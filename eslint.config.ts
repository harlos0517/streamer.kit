import harlosNode from '@harlos/eslint-config/node'
import harlosReact from '@harlos/eslint-config/react'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  {
    ignores: ['node_modules', 'dist', 'generated'],
  },
  {
    ignores: ['apps/dashboard/**'],
    extends: [
      harlosNode,
    ],
  },
  {
    files: ['apps/dashboard/**/*.{ts,tsx}'],
    extends: [
      harlosReact,
    ],
  },
)
