import type { DatabaseAPI } from '@streamer-kit/plugin-sdk'
import { toPluginSchemaName } from '@streamer-kit/plugin-sdk'
import type { AnyPgTable } from 'drizzle-orm/pg-core'
import { pgSchema } from 'drizzle-orm/pg-core'

import { db as coreDb } from '../persistence/client.ts'

export { toPluginSchemaName }

export const createPluginDatabase = (pluginId: string): DatabaseAPI => {
  const schema = pgSchema(toPluginSchemaName(pluginId))

  return {
    table: (name, columns) => schema.table(name, columns),
    // DatabaseAPI's generic T (constrained to PgTableWithColumns<any>) is too
    // loose for Drizzle's own conditional query-builder types to resolve -
    // narrowing through AnyPgTable is the intentional glue point here, same
    // idea as the EventAPI cast in plugins/context.ts.
    select: (table, where) => {
      const query = coreDb.select().from(table as AnyPgTable)
      return where ? query.where(where) : query
    },
    insert: async(table, values) => {
      const [row] = await coreDb.insert(table as AnyPgTable).values(values).returning()
      return row!
    },
    update: async(table, values, where) => {
      await coreDb.update(table as AnyPgTable).set(values).where(where)
    },
  }
}
