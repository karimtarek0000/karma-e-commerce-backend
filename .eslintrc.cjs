module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    quotes: ['error', 'single'],
    'import/extensions': ['error', 'always'],
    'comma-dangle': ['off'],
    'consistent-return': ['off'],
    'no-underscore-dangle': ['off'],
    'implicit-arrow-linebreak': ['off'],
    'function-paren-newline': ['off'],
    'import/prefer-default-export': ['off'],
    camelcase: ['off'],
  },
};
