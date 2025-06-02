//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/consistent-type-specifier-style': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'sort-imports': 'off',
    },
  },
]
