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
          noWarnOnMultipleProjects: true,
          project: [
            "./tsconfig.app.json",
            "./tsconfig.node.json",
            "./tsconfig.test.json",
            "./tsconfig.worker.json",
          ],
        },
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [{ regex: "^@mui/[^/]+$" }],
        },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "builtin",
              position: "before",
            },
            {
              pattern: "@mui/material/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "@mui/icons-material/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "@typescript-eslint/no-deprecated": "warn",
    },
  },
  prettierRecommended,
  {
    files: ["vitest.worker.config.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
]);
