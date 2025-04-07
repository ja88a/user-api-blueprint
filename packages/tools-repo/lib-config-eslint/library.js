const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'prettier', 'eslint-config-turbo'],

  root: true,

  globals: {
    React: true,
    JSX: true,
  },

  env: {
    node: true,
    jest: true,
    es2022: true,
  },

  plugins: ['@typescript-eslint/eslint-plugin', 'only-warn', 'unused-imports'],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    project: false,
  },

  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },

  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    '.*.ts',
    'node_modules/',
    'dist/',
  ],

  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)'],
    },
  ],

  // Refer to https://typescript-eslint.io/rules/
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    //'no-unused-vars': ['error', { argsIgnorePattern: 'params' }],
    //'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: 'params' }],
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: 'params',
        argsIgnorePattern: '^_',
      },
    ],
  },
}
