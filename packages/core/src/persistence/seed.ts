import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config as loadEnv } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(__dirname, '../../../../.env') })

const { db } = await import('./client.ts')
const { currencies } = await import('./schema.ts')

async function main() {
  await db.insert(currencies)
    .values({ key: 'coin', name: 'Coin' })
    .onConflictDoNothing({ target: currencies.key })
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
