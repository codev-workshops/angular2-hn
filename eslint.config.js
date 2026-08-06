import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import ts from 'typescript';
import path from 'path';

const configFile = ts.readConfigFile('web/tsconfig.json', ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.resolve(process.cwd(), 'web'));
const typeProgram = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);

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
                programs: [typeProgram],
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
        files: ['scripts/**/*.{js,cjs}'],
        languageOptions: {
            globals: {
                __dirname: 'readonly',
                process: 'readonly',
                require: 'readonly',
                console: 'readonly',
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
