module.exports = {
    env: {
      browser: true,
      node: true,
      es2020: true, // Enable ES2020 features
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended', // React plugin
    ],
    parserOptions: {
      ecmaVersion: 2020, // Enable ECMAScript 2020 features
      sourceType: 'module', // Support for ES modules
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the installed React version
      },
    },
  };
  