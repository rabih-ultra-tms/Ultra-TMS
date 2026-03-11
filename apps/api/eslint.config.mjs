import { config } from '@repo/eslint-config/base';

// Node.js globals — avoids no-undef for process, Buffer, require, etc.
const nodeGlobals = {
  process: 'readonly',
  Buffer: 'readonly',
  require: 'readonly',
  module: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  setInterval: 'readonly',
  clearTimeout: 'readonly',
  clearInterval: 'readonly',
  setImmediate: 'readonly',
  clearImmediate: 'readonly',
  global: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  exports: 'readonly',
};

const jestGlobals = {
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  jest: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
};

const moduleEnvRuleExemptions = [
  'src/modules/auth/**/*.{ts,tsx}',
  'src/modules/crm/**/*.{ts,tsx}',
  'src/modules/sales/**/*.{ts,tsx}',
  'src/modules/load-board/**/*.{ts,tsx}',
  'src/modules/commission/**/*.{ts,tsx}',
  'src/modules/documents/**/*.{ts,tsx}',
  'src/modules/communication/**/*.{ts,tsx}',
];

export default [
  ...config,
  {
    ignores: ['src/modules/*.bak/**', 'src/modules/**/*.bak/**'],
  },
  {
    languageOptions: {
      globals: {
        ...nodeGlobals,
      },
    },
    // Allow legacy any usage while we incrementally tighten typings.
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: {
        ...jestGlobals,
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    files: moduleEnvRuleExemptions,
    rules: {
      'turbo/no-undeclared-env-vars': 'off',
    },
  },
];
