import { config } from '@repo/eslint-config/base';

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
		// Allow legacy any usage while we incrementally tighten typings.
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
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
		files: moduleEnvRuleExemptions,
		rules: {
			'turbo/no-undeclared-env-vars': 'off',
		},
	},
];
