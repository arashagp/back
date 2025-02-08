import * as globals from 'globals';
import eslintJs from '@eslint/js';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import path from 'node:path';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

const baseExtends = tseslint.config(
  eslintJs.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  tseslint.configs.stylisticTypeChecked,
);

const jsConfigs = tseslint.config({
  extends: [tseslint.configs.disableTypeChecked],
  files: ['*.{mjs,js,cjs}', '**/*.{mjs,js,cjs}'],
  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },
  languageOptions: {
    globals: {
      ...globals.commonjs,
      ...globals.node,
    },
    ecmaVersion: 'latest',
    sourceType: 'commonjs',
  },
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
});

const tsconfigRootDir = import.meta.dirname;

const tsConfig = tseslint.config({
  files: ['**/*.ts', '**/*.mjs', '**/*.cjs', '**/*.js'],
  languageOptions: {
    globals: {
      ...globals['shared-node-browser'],
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir,
    },
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    '@stylistic': stylistic,
  },
  rules: {
    '@stylistic/max-len': ['error', { code: 140 }],
    'no-eval': ['error', { allowIndirect: true }],
    '@stylistic/no-floating-decimal': 'error',
    '@stylistic/space-infix-ops': 'error',
    'new-cap': ['error', { capIsNewExceptionPattern: 'Mini$' }],
    '@stylistic/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
    '@stylistic/array-bracket-spacing': 'off',
    '@stylistic/indent': [
      'error',
      2,
      {
        SwitchCase: 1,
        VariableDeclarator: 1,
        outerIIFEBody: 1,
        MemberExpression: 1,
        FunctionDeclaration: { parameters: 1, body: 1 },
        FunctionExpression: { parameters: 1, body: 1 },
        CallExpression: { arguments: 1 },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        flatTernaryExpressions: false,
        ignoreComments: false,
        ignoredNodes: [
          'TemplateLiteral *',
          'TSTypeParameterInstantiation',
          'FunctionExpression > .params[decorators.length > 0]',
          'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
          'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key',
        ],
      },
    ],
    '@stylistic/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],

    '@stylistic/semi': 'error',

    'no-unused-vars': 'off',
    'prefer-const': 'error',
    'sort-imports': ['error'],

    '@typescript-eslint/prefer-string-starts-ends-with': 'off',
    '@typescript-eslint/no-dynamic-delete': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-unused-labels': 'off',
    'require-await': 'error',
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gitignorePath = path.resolve(__dirname, '.gitignore');

const ignorePatterns = includeIgnoreFile(gitignorePath).ignores;
ignorePatterns?.push('.yarn');

export default [
  ...baseExtends,
  ...tsConfig,
  ...jsConfigs,
  {
    ignores: ['node_modules', 'dist'],
  },
];
