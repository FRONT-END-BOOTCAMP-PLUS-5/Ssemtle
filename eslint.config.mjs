import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { fileURLToPath } from 'node:url';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    ignorePatterns: [
      'node_modules/',
      '.yarn/',
      '.vscode',
      'dist/',
      'build/',
      '.next/',
      'public/',
      'temp/',
    ],
    extends: [
      'next/core-web-vitals',
      'next/typescript',
      'plugin:storybook/recommended',
    ],
    overrides: [
      {
        files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
        rules: {
          '@typescript-eslint/no-unused-vars': 'warn',
        },
      },
    ],
  }),
];

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  eslintConfig,
  eslintConfigPrettier,
]);
