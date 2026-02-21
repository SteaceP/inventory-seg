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

  let content = "";

  if (fs.existsSync(templatePath)) {
    content = fs.readFileSync(templatePath, "utf-8");
    content = content.replace(/\$\{([A-Z0-9_]+)\}/g, (match, varName) => {
      return env[varName] !== undefined
        ? env[varName]
        : env[`VITE_${varName}`] !== undefined
          ? env[`VITE_${varName}`]
          : match;
    });
  } else if (fs.existsSync(outputPath)) {
    // If no template, fall back to output (for direct mutation)
    content = fs.readFileSync(outputPath, "utf-8");

    // In CI, dynamically replace hardcoded dummies in wrangler.toml
    if (process.env.CI && outputName === "wrangler.toml") {
      if (env.HYPERDRIVE_ID) {
        content = content.replace(
          /id = "your_hyperdrive_id"/g,
          `id = "${env.HYPERDRIVE_ID}"`
        );
      }
      if (env.SUPABASE_URL) {
        content = content.replace(
          /SUPABASE_URL = "http:\/\/127\.0\.0\.1:54321"/g,
          `SUPABASE_URL = "${env.SUPABASE_URL}"`
        );
      }
      if (env.R2_BUCKET_NAME) {
        content = content.replace(
          /bucket_name = "my-inventory-bucket"/g,
          `bucket_name = "${env.R2_BUCKET_NAME}"`
        );
        content = content.replace(
          /R2_BUCKET_NAME = "my-inventory-bucket"/g,
          `R2_BUCKET_NAME = "${env.R2_BUCKET_NAME}"`
        );
      }
      if (env.D1_DATABASE_ID) {
        content = content.replace(
          /database_id = "64eb265b-9118-4a15-a544-110fec170502"/g,
          `database_id = "${env.D1_DATABASE_ID}"`
        );
      }
    }
  } else {
    // Neither template nor output exists
    return;
  }

  // Convert "true"/"false" strings to boolean literals for TOML
  content = content.replace(/"(true|false)"/g, "$1");

  fs.writeFileSync(outputPath, content);
  console.log(`Successfully generated ${outputName}`);
}

processTemplate("wrangler.template.toml", "wrangler.toml");
processTemplate("package.template.json", "package.json");
