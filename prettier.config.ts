// /prettier.config.ts

import type { Config } from "prettier";

const config: Config = {
  printWidth: 80,
  tabWidth: 2,

  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,

  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",

  quoteProps: "as-needed",
  endOfLine: "lf",

  proseWrap: "preserve",
  embeddedLanguageFormatting: "auto",
};

export default config;
