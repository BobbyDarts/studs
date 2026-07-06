// eslint.config.ts

import middenVueConfig from "@midden/eslint-config-vue";
import pluginVitest from "@vitest/eslint-plugin";
import pluginOxlint from "eslint-plugin-oxlint";
import pluginPlaywright from "eslint-plugin-playwright";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...middenVueConfig({
    pathGroups: [
      {
        pattern: "@/components/ui/**",
        group: "external",
        position: "after",
      },
    ],
  }),

  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "commitlint.config.ts",
            "prettier.config.ts",
            "vitest.setup.ts",
          ],
        },
      },
    },
  },

  {
    ignores: [
      "**/dist/**",
      "**/dist-ssr/**",
      "**/coverage/**",
      "src/components/ui/**",
    ],
  },

  {
    ...pluginPlaywright.configs["flat/recommended"],
    files: ["e2e/**/*.{test,spec}.{js,ts,jsx,tsx}"],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/*.test.ts"],
  },

  ...pluginOxlint.buildFromOxlintConfigFile(".oxlintrc.json"),

  {
    rules: {
      "vue/block-lang": ["error", { script: { lang: "ts" } }],
    },
  },
);
