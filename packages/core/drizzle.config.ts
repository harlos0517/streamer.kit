import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

const __dirname = dirname(fileURLToPath(import.meta.url))

loadEnv({ path: resolve(__dirname, '../../.env') })

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/persistence/schema.ts',
  out: './migrations',
  schemaFilter: ['core'],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
