import { definePlugin, loadMigrations } from '@streamer-kit/plugin-sdk'

import { PLUGIN_ID } from './pluginId.ts'
import { createCurrencyService } from './service.ts'

// Pre-generated via `drizzle-kit generate` (schema.ts) - Runtime applies
// these automatically on install (4.9), never regenerates them.
const migrations = loadMigrations(new URL('../migrations', import.meta.url))

export const currencyPlugin = definePlugin({
  manifest: {
    id: PLUGIN_ID,
    name: 'Currency',
    version: '0.1.0',
  },
  migrations,
  setup(ctx) {
    ctx.services.register('currency', createCurrencyService(ctx.database, ctx.events))
  },
})

export type { CurrencyService, CurrencyTransaction } from './service.ts'
