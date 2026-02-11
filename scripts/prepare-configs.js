import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

/**
 * Loads environment variables from a file if it exists
 * @param {string} filePath
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf-8");
  const env = {};
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const colonIndex = trimmed.indexOf("=");
    if (colonIndex > -1) {
      const key = trimmed.slice(0, colonIndex).trim();
      let value = trimmed.slice(colonIndex + 1).trim();
      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  });
  return env;
}
const isCI =
  process.env.GITHUB_ACTIONS === "true" || process.env.ACT === "true";

const env = {
  ...loadEnvFile(path.join(rootDir, ".env.example")), // Blueprint
  ...loadEnvFile(path.join(rootDir, ".env.local")), // Development
  ...(isCI ? loadEnvFile(path.join(rootDir, ".act.env")) : {}), // CI / Local ACT
  ...loadEnvFile(path.join(rootDir, ".prod.vars")), // Production Infrastructure
  ...process.env, // Final Overrides
  AI_REMOTE: isCI ? "false" : "true",
};

// Derive extracted values
if (env.APP_URL) {
  try {
    const url = new URL(env.APP_URL);
    env.APP_DOMAIN = url.hostname;
  } catch (e) {
    console.warn("Could not parse APP_URL to derive APP_DOMAIN");
  }
}

/**
 * Processes a template file and generates the output file
 * @param {string} templateName
 * @param {string} outputName
 */
function processTemplate(templateName, outputName) {
  const templatePath = path.join(rootDir, templateName);
  const outputPath = path.join(rootDir, outputName);

  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(templatePath, "utf-8");
  let missingVars = [];

  // Replace ${VAR_NAME} placeholders
  content = content.replace(/\$\{([A-Z0-9_]+)\}/g, (match, varName) => {
    // Check environment variables (both standard and VITE_ prefixed)
    const hasVar = varName in env;
    const hasViteVar = `VITE_${varName}` in env;

    if (!hasVar && !hasViteVar) {
      missingVars.push(varName);
      return match;
    }

    return env[varName] !== undefined ? env[varName] : env[`VITE_${varName}`];
  });

  if (missingVars.length > 0) {
    console.error(
      `\x1b[31mError: The following environment variables are missing for ${outputName}:\x1b[0m`
    );
    missingVars.forEach((v) => console.error(`  - ${v}`));
    console.error(`\nPlease add them to your .env.local or .dev.vars file.`);
    process.exit(1);
  }

  // Post-process to convert quoted boolean/number placeholders back to literals
  content = content.replace(/"(true|false)"/g, "$1");

  // Add schema back to wrangler.jsonc if missing
  if (outputName === "wrangler.jsonc" && !content.includes("$schema")) {
    content = content.replace(
      "{",
      '{\n  "$schema": "node_modules/wrangler/config-schema.json",'
    );
  }

  fs.writeFileSync(outputPath, content);
  console.log(`Successfully generated ${outputName} from template`);
}

// Process all templates
processTemplate("wrangler.template.jsonc", "wrangler.jsonc");
processTemplate("package.template.json", "package.json");
