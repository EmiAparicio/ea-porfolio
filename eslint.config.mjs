import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

import nextPlugin from 'eslint-config-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import storybookPlugin from 'eslint-plugin-storybook';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = [{
  ignores: [
    '**/node_modules/**',
    '**/.next/**',
    '**/out/**',
    '**/dist/**',
    '**/storybook-static/**',
  ],
}, js.configs.recommended, ...tseslint.configs.recommended, prettierConfig, {
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
}, {
  files: ['packages/portfolio/**/*.{ts,tsx}'],
  ...nextPlugin.configs['core-web-vitals'],
}, {
  files: ['packages/ui-pkg/**/*.{ts,tsx}'],
  plugins: {
    'react-hooks': reactHooks,
  },
  ...reactPlugin.configs.recommended,
  ...storybookPlugin.configs.recommended,
  rules: {
    ...reactHooks.configs.recommended.rules,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;