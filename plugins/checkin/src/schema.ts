import { db, toPluginSchemaName } from '@streamer-kit/plugin-sdk'
import { pgSchema } from 'drizzle-orm/pg-core'

import { PLUGIN_ID } from './pluginId.ts'

// One row per successful check-in (5.3, history) - no separate streak/status
// column. Streak and "already checked in today" are both derived from this
// history at query time, same trade-off as Currency's ledger-derived balance
// (plugins/currency/src/schema.ts) - proven fine at this project's scale.
export const checkinColumns = {
  id: db.id(),
  // Opaque external reference (4.7) - no FK to core.viewers, just a string.
  viewerId: db.string().notNull(),
  checkedInAt: db.createdAt(),
}

// drizzle-kit only - never imported by setup()/runtime code, which gets its
// table handle from ctx.database.table() instead. Must be exported (not just
// the table built from it) or drizzle-kit won't emit CREATE SCHEMA.
export const migrationSchema = pgSchema(toPluginSchemaName(PLUGIN_ID))
export const checkin = migrationSchema.table('checkin', checkinColumns)
