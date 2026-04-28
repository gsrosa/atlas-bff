import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

const importSortGroups = [
  ["^@", "^\\w"],
  ["^(@)(/.*|$)"],
  ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
  ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
];

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "dist/**",
      "coverage/**",
      "types-generated/**",
      "**/*.d.ts",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,ts}"],
    languageOptions: { globals: globals.node },
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "simple-import-sort/imports": ["warn", { groups: importSortGroups }],
    },
  },
);
