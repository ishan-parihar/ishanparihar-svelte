// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format


import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "off", // Disable no-explicit-any rule
      "@next/next/no-assign-module-variable": "off", // Disable module assignment rule
      "react-hooks/exhaustive-deps": "warn", // Change to warning instead of error
      "@next/next/no-img-element": "warn", // Change to warning instead of error
    },
  },
  {
    ignores: [".next/", ".*.js", "*.json", "node_modules/", "*/*.d.ts"],
  },
  
];

export default eslintConfig;
