import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'prisma/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

loadEnv({ path: resolve(__dirname, '../../.env') })

const databaseUrl = process.env.DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
})
