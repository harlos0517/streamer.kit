import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { toPluginSchemaName } from '@streamer-kit/plugin-sdk'
import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

import { PLUGIN_ID } from './src/pluginId.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

loadEnv({ path: resolve(__dirname, '../../.env') })

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './migrations',
  schemaFilter: [toPluginSchemaName(PLUGIN_ID)],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
