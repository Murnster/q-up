import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.browser,
				React: true,
				JSX: true,
			},
			parser: tseslint.parser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			'import': importPlugin,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'react': reactPlugin,
		},
		settings: {
			'import/resolver': {
				typescript: true
			}
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					args: 'none',
					ignoreRestSiblings: true,
					vars: 'all',
					varsIgnorePattern: '^_',
				}
			],
			'object-curly-spacing': ['warn', 'always'],
			'semi': ['error', 'always'],
			'react/jsx-curly-spacing': ['warn', {
				when: 'always',
				children: true,
				attributes: true,
				spacing: {
					objectLiterals: 'never'
				}
			}],
			'import/order': [
				'error',
				{
					groups: [
						'index',
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
					],
					pathGroups: [
						{
							pattern: '**/*.css',
							group: 'index',
							position: 'before',
						}
					],
					'newlines-between': 'never',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true
					}
				}
			]
		},
	},
)
