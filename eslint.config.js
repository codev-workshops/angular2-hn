import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    {
        ignores: ['dist-react/**', 'test-results/**', 'playwright-report/**'],
    },
    eslint.configs.recommended,
    {
        files: ['web/**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                document: 'readonly',
                window: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'react-hooks': reactHooks,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'no-undef': 'off',
            'no-unused-vars': 'off',
        },
    },
    {
        files: ['scripts/**/*.js'],
        languageOptions: {
            globals: {
                __dirname: 'readonly',
                process: 'readonly',
                require: 'readonly',
            },
        },
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
        },
    },
];
