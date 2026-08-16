import { db } from '@streamer-kit/plugin-sdk'
import { pgSchema } from 'drizzle-orm/pg-core'

// Column shape shared between this file (drizzle-kit migration generation,
// hardcoded schema name below) and setup()'s ctx.database.table() call
// (Runtime-resolved schema name from manifest.id via toPluginSchemaName).
// Both must resolve to the same physical schema - 'demo.ping' -> 'plugin_demo_ping'.
export const pingLogColumns = {
  id: db.id(),
  platformDisplayName: db.string(),
  message: db.string(),
  createdAt: db.createdAt(),
}

// drizzle-kit only - never imported by setup()/runtime code, which gets its
// table handle from ctx.database.table() instead. Must be exported (not just
// the table built from it) or drizzle-kit won't emit CREATE SCHEMA.
export const migrationSchema = pgSchema('plugin_demo_ping')
export const pingLog = migrationSchema.table('ping_log', pingLogColumns)
