import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config as loadEnv } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(__dirname, '../../../.env') })

const { drizzle } = await import('drizzle-orm/node-postgres')
const { currency } = await import('./schema.ts')

const db = drizzle(process.env.DATABASE_URL!)

const main = async() => {
  await db.insert(currency)
    .values({ key: 'coin', name: 'Coin' })
    .onConflictDoNothing({ target: currency.key })
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  // drizzle(url) opens a pg Pool that keeps the event loop alive - without
  // this the process hangs forever instead of exiting (broke the Dockerfile
  // CMD chain, which runs db:seed && ... and waits for it to exit).
  .finally(() => process.exit())
