import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
export default tseslint.config(
    {
        ignores: ['dist/', 'node_modules/'],
    },
    ...tseslint.configs.recommended,
    prettierConfig,

    {
        files: ['**/*.ts'],
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            'no-useless-constructor': 'off',
            'class-methods-use-this': 'off',
            'no-await-in-loop': 'off',
            'linebreak-style': 'off',
            'no-restricted-syntax': 'off',
            'no-redeclare': 'off',
            'no-return-await': 'off',
            'no-path-concat': 'off',
            'no-continue': 'off',
            'lines-between-class-members': [
                'error',
                'always',
                {
                    exceptAfterSingleLine: true,
                },
            ],
            '@typescript-eslint/naming-convention': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/interface-name-prefix': 'off',
            'no-console': 'error',
            'prettier/prettier': 'error',
            'padding-line-between-statements': [
                'error',
                {blankLine: 'always', prev: '*', next: '*'},
                {blankLine: 'any', prev: 'import', next: 'import'},
                {blankLine: 'any', prev: 'export', next: 'export'},
                {blankLine: 'any', prev: 'singleline-const', next: 'singleline-const'},
                {blankLine: 'any', prev: 'singleline-let', next: 'singleline-let'},
                {blankLine: 'any', prev: 'expression', next: 'expression'},
            ],
        },
    },
);
