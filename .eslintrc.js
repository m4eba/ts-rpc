module.exports = {
  env: {
    "es6": true,
    "node": true,
    "jest/globals": true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended"
  ],
  globals: {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  plugins: [
    "jest",
    "@typescript-eslint"
  ],
  rules: {
    "no-undef": "warn",
    "no-unused-vars": "warn",
    "no-trailing-spaces": "error",
    "@typescript-eslint/no-use-before-define": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [2, { args: 'none' }]
      }
    }
  ]
};