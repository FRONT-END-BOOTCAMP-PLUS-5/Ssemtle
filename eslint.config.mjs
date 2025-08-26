import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import jestPlugin from 'eslint-plugin-jest';
import { fileURLToPath } from 'node:url';
import pluginQuery from '@tanstack/eslint-plugin-query';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const compat = new FlatCompat({
  baseDirectory: fileURLToPath(new URL('.', import.meta.url)),
});

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  // Jest configuration for test files
  {
    files: [
      '**/*.{test,spec}.{js,ts,jsx,tsx}',
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
      'tests/**/*.{js,ts}',
      'jest.setup.js',
      'jest.config.mjs',
    ],
    ...jestPlugin.configs['flat/recommended'],
  },
];

export default defineConfig([
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      'node_modules/**',
      '.yarn/**',
      '.vscode/**',
      'dist/**',
      'build/**',
      '.next/**',
      'public/**',
      'temp/**',
    ],
  },
  ...pluginQuery.configs['flat/recommended'],
  ...eslintConfig,
  eslintConfigPrettier,
]);
