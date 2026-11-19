import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import { defineConfig } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

import { loadConfig } from "@sveltejs/load-config";
const svelteConfig = (await loadConfig("./", { traverse: false }))?.config;

export default defineConfig([
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  {
      languageOptions: {
          globals: {
              ...globals.browser,
              APP_VERSION: "readonly",
              IS_DEBUG: "readonly",
          },

          parserOptions: {
              extraFileExtensions: [".svelte"],
          },
      },
  },
  {
      files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
      languageOptions: {
          parserOptions: {
              projectService: true,
              parser: ts.parser,
              svelteConfig
          },
      },
  },
  {
      rules: {
          indent: "off",
          "linebreak-style": "off",
          eqeqeq: ["warn", "always"],
          "no-var": "error",
          "arrow-parens": ["error", "always"],
          "array-bracket-newline": ["error", "consistent"],
          "array-element-newline": ["error", "consistent"],
          "array-bracket-spacing": ["error", "always"],
          "object-curly-spacing": ["error", "always"],
          "function-paren-newline": ["error", "consistent"],
          "function-call-argument-newline": ["error", "consistent"],
          "@typescript-eslint/consistent-type-definitions": ["error", "type"],

          "@typescript-eslint/consistent-type-assertions": ["error", {
              assertionStyle: "as",
              objectLiteralTypeAssertions: "allow-as-parameter",
          }],

          "@typescript-eslint/consistent-indexed-object-style": "error",
          "@typescript-eslint/no-explicit-any": "error",
          "@typescript-eslint/no-unused-vars": "off",
          "@typescript-eslint/ban-ts-comment": "off",
          quotes: ["error", "double"],
          semi: "warn",
          "@typescript-eslint/no-extra-semi": "error",
          "no-undef": "off",
      },
  }
]);