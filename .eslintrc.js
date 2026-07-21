module.exports = {
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended', // TypeScript rules
      'plugin:react/recommended', // React rules
      'plugin:react-hooks/recommended', // Rules for React Hooks
    ],
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript
    parserOptions: {
      ecmaFeatures: {
        jsx: true, // Allows for the parsing of JSX
      },
      ecmaVersion: 12, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
    },
    plugins: [
      'react',
      '@typescript-eslint',
    ],
    rules: {
      // Use the TypeScript-aware unused-vars rule so parameter names inside
      // type/interface signatures aren't wrongly flagged.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }], // console.log discouraged
      'react/react-in-jsx-scope': 'off', // Not necessary with React 17+
      'react/prop-types': 'off', // Disables prop-types as we use TypeScript for type checking
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
  };
  