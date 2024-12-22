import prettier from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.{ts,jsx,js,tsx}'],
    plugins: {
      prettier: prettier,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'auto',
          semi: true,
          singleQuote: true,
          printWidth: 100,
          trailingComma: 'all',
          useTabs: false,
          tabWidth: 4,
          jsxSingleQuote: true,
          bracketSpacing: true,
          arrowParens: 'avoid',
        },
      ],
      'no-unused-vars': 'warn',
      'no-explicit-any': 'off',
      'prefer-const': 'warn',
      'no-console': 'warn',
    },
  },
];