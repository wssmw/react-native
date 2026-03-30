// @ts-check

const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat();

module.exports = defineConfig([
  js.configs.recommended,
  ...compat.extends('prettier'),
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      // 你可以在这里添加自定义规则
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ...expoConfig,
  },
  {
    ignores: [
      'dist/**',
      '.expo/**',
      'node_modules/**',
      'build/**',
      'coverage/**',
    ],
  },
]);
