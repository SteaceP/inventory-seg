import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

import importPlugin from "eslint-plugin-import";

export default defineConfig([
  globalIgnores([
    "dist",
    ".wrangler",
    ".agent",
    "src/types/database.types.ts",
    "coverage",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      reactX.configs["recommended-typescript"],
      reactDom.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: [
          "./tsconfig.app.json",
          "./tsconfig.node.json",
          "./tsconfig.test.json",
          "./tsconfig.worker.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: ["./tsconfig.json"],
        },
      },
    },
  },
  prettierRecommended,
]);
