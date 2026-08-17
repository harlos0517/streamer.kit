import { db, toPluginSchemaName } from '@streamer-kit/plugin-sdk'
import { pgSchema } from 'drizzle-orm/pg-core'

import { PLUGIN_ID } from './pluginId.ts'

export const currencyColumns = {
  id: db.id(),
  key: db.string().notNull().unique(),
  name: db.string().notNull(),
  createdAt: db.createdAt(),
}

export const transactionColumns = {
  id: db.id(),
  // Opaque external reference (4.7) - no FK to core.viewers, just a string.
  viewerId: db.string().notNull(),
  // References this plugin's own currency table. Could be a real FK since
  // both tables live in the same schema, but CurrencyService already
  // validates the currency exists before writing (same check the old
  // addCurrency.ts did) - keeping the column declaration plain instead.
  currencyId: db.string().notNull(),
  amount: db.integer().notNull(),
  reason: db.string().notNull(),
  source: db.string(),
  createdAt: db.createdAt(),
}

// drizzle-kit only - never imported by setup()/runtime code, which gets its
// table handles from ctx.database.table() instead. Must be exported (not
// just the tables built from it) or drizzle-kit won't emit CREATE SCHEMA.
//
// Derived through the same toPluginSchemaName() Runtime uses to resolve
// ctx.database.table() (see @streamer-kit/plugin-sdk), instead of a
// hand-typed string - a mismatch here previously went undetected by
// TypeScript (both were just string literals) and only surfaced as
// "relation does not exist" at runtime.
export const migrationSchema = pgSchema(toPluginSchemaName(PLUGIN_ID))
export const currency = migrationSchema.table('currency', currencyColumns)
export const transaction = migrationSchema.table('transaction', transactionColumns)
