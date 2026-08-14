import harlos from '@harlos/eslint-config/node'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  {
    ignores: ['node_modules', 'dist'],
  },
  {
    extends: [
      harlos,
    ],
  },
)
