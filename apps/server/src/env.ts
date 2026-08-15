import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config as loadEnv } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))

loadEnv({ path: resolve(__dirname, '../../../.env') })
