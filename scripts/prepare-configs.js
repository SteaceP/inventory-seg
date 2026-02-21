import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

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

const env = {
  ...loadEnvFile(path.join(rootDir, ".env.example")), // Default blueprint
  ...loadEnvFile(path.join(rootDir, ".env")),
  ...loadEnvFile(path.join(rootDir, ".env.local")),
  ...process.env,
};

// Derive APP_DOMAIN if available
if (env.APP_URL && !env.APP_DOMAIN) {
  try {
    env.APP_DOMAIN = new URL(env.APP_URL).hostname;
  } catch (e) {
    console.warn("Could not parse APP_URL to derive APP_DOMAIN");
  }
}

function processTemplate(templateName, outputName) {
  const templatePath = path.join(rootDir, templateName);
  const outputPath = path.join(rootDir, outputName);

  if (!fs.existsSync(templatePath)) return;

  let content = fs.readFileSync(templatePath, "utf-8");

  content = content.replace(/\$\{([A-Z0-9_]+)\}/g, (match, varName) => {
    return env[varName] !== undefined
      ? env[varName]
      : env[`VITE_${varName}`] !== undefined
        ? env[`VITE_${varName}`]
        : match;
  });

  // Convert "true"/"false" strings to boolean literals for TOML
  content = content.replace(/"(true|false)"/g, "$1");

  fs.writeFileSync(outputPath, content);
  console.log(`Successfully generated ${outputName}`);
}

processTemplate("wrangler.template.toml", "wrangler.toml");
processTemplate("package.template.json", "package.json");
