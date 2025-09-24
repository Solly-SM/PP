module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prefer-const': 'warn',
    'no-var': 'error',
  },
  ignorePatterns: [
    'client/build/**',
    'client/node_modules/**',
    'node_modules/**',
    '*.min.js',
    'dist/**',
    'build/**',
  ],
};