import { db, toPluginSchemaName } from '@streamer-kit/plugin-sdk'
import { pgSchema } from 'drizzle-orm/pg-core'

import { PLUGIN_ID } from './pluginId.ts'

export const pingLogColumns = {
  id: db.id(),
  platformDisplayName: db.string(),
  message: db.string(),
  createdAt: db.createdAt(),
}

// drizzle-kit only - never imported by setup()/runtime code, which gets its
// table handle from ctx.database.table() instead. Must be exported (not just
// the table built from it) or drizzle-kit won't emit CREATE SCHEMA.
//
// Derived through the same toPluginSchemaName() Runtime uses to resolve
// ctx.database.table(), instead of a hand-typed string (see
// plugins/currency/src/schema.ts for why this matters).
export const migrationSchema = pgSchema(toPluginSchemaName(PLUGIN_ID))
export const pingLog = migrationSchema.table('ping_log', pingLogColumns)
