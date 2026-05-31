import pluginVitest from "@vitest/eslint-plugin";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import { globalIgnores } from "eslint/config";
import skipFormatting from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import-x";
import pluginOxlint from "eslint-plugin-oxlint";
import pluginPlaywright from "eslint-plugin-playwright";
import pluginVue from "eslint-plugin-vue";

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{vue,ts,mts,tsx}"],
  },

  globalIgnores([
    "**/dist/**",
    "**/dist-ssr/**",
    "**/coverage/**",
    "src/components/ui/**",
  ]),

  ...pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,

  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "commitlint.config.ts",
            "vitest.setup.ts",
            "prettier.config.ts",
          ],
        },
      },
    },
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

  // Import ordering
  {
    plugins: {
      "import-x": importPlugin,
    },
    rules: {
      "import-x/order": [
        "warn",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
          ],
          pathGroups: [
            {
              pattern: "@/components/ui/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import-x/no-duplicates": "error",
    },
  },

  // Core rules
  {
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-explicit-any": "warn",

      // Vue
      "vue/multi-word-component-names": "off",
      "vue/block-lang": ["error", { script: { lang: "ts" } }],
      "vue/no-side-effects-in-computed-properties": "error",
      "vue/require-v-for-key": "error",
      "vue/block-order": ["warn", { order: ["script", "template", "style"] }],
      "vue/define-macros-order": [
        "error",
        {
          order: ["defineProps", "defineEmits", "defineSlots", "defineExpose"],
        },
      ],
      "vue/no-undef-components": [
        "error",
        {
          ignorePatterns: ["RouterView", "router-view"],
        },
      ],

      // General
      "prefer-const": "error",
      "no-unused-expressions": "error",
    },
  },

  skipFormatting,
);
