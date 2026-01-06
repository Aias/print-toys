const globals = require("globals");
const react = require("eslint-plugin-react");
const jsxA11Y = require("eslint-plugin-jsx-a11y");
const reactHooks = require("eslint-plugin-react-hooks");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const _import = require("eslint-plugin-import");
const tsParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");

const { fixupConfigRules, fixupPluginRules } = require("@eslint/compat");
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  // Global ignores - include hidden directories
  {
    ignores: ["!**/.server", "!**/.client"],
  },

  // Base config for all files
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.commonjs,
      },
    },
  },

  // React config for JS/JSX/TS/TSX files
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react,
      "jsx-a11y": jsxA11Y,
      "react-hooks": fixupPluginRules(reactHooks),
    },
    settings: {
      react: {
        version: "detect",
      },
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],
      "import/resolver": {
        typescript: {},
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11Y.configs.recommended.rules,
      "react/prop-types": "off", // Using TypeScript for prop validation
    },
  },

  // TypeScript config
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
      import: fixupPluginRules(_import),
    },
    languageOptions: {
      parser: tsParser,
    },
    settings: {
      "import/internal-regex": "^~/",
      "import/resolver": {
        node: {
          extensions: [".ts", ".tsx"],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
    },
  },
  ...fixupConfigRules(
    compat.extends("plugin:import/recommended", "plugin:import/typescript"),
  ),

  // Node.js files - add Node globals for server-side code
  {
    files: [
      "eslint.config.cjs",
      "next.config.ts",
      "prisma.config.ts",
      "app/api/**/*.ts",
      "app/lib/**/*.ts",
      "app/actions/**/*.ts",
      "test-*.ts",
      "process-*.ts",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Ignore generated files
  {
    ignores: [
      "docs/**",
      "generated/**",
      "build/**",
      "types/**",
      ".next/**",
    ],
  },
];
