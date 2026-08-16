import type { DatabaseAPI } from '@streamer-kit/plugin-sdk'
import type { AnyPgTable } from 'drizzle-orm/pg-core'
import { pgSchema } from 'drizzle-orm/pg-core'

import { db as coreDb } from '../persistence/client.ts'

// Must match how each plugin's own drizzle-kit-facing schema file names its
// pgSchema(...) call (see e.g. plugins/ping/src/schema.ts).
export const toPluginSchemaName = (pluginId: string): string =>
  `plugin_${pluginId.replace(/[^a-zA-Z0-9]+/g, '_')}`

export const createPluginDatabase = (pluginId: string): DatabaseAPI => {
  const schema = pgSchema(toPluginSchemaName(pluginId))

  return {
    table: (name, columns) => schema.table(name, columns),
    // DatabaseAPI's generic T (constrained to PgTableWithColumns<any>) is too
    // loose for Drizzle's own conditional query-builder types to resolve -
    // narrowing through AnyPgTable is the intentional glue point here, same
    // idea as the EventAPI cast in plugins/context.ts.
    select: table => coreDb.select().from(table as AnyPgTable),
    insert: async(table, values) => {
      await coreDb.insert(table as AnyPgTable).values(values)
    },
    update: async(table, values, where) => {
      await coreDb.update(table as AnyPgTable).set(values).where(where)
    },
  }
}
