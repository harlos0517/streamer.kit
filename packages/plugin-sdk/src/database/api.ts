import type { SQL } from 'drizzle-orm'
import type { BuildColumns } from 'drizzle-orm/column-builder'
import type { PgColumnBuilderBase, PgTableWithColumns } from 'drizzle-orm/pg-core'

// Drizzle's own table type needs a wildcard here; a plugin's table shape is
// inherently unknown to this generic interface.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPluginTable = PgTableWithColumns<any>

// No raw(...) escape hatch (4.6) - select/insert/update only, all scoped to
// tables created via table() below. Never provide unrestricted SQL access.
export interface DatabaseAPI {
  table<TName extends string, TColumns extends Record<string, PgColumnBuilderBase>>(
    name: TName,
    columns: TColumns,
  ): PgTableWithColumns<{
    name: TName
    schema: string
    columns: BuildColumns<TName, TColumns, 'pg'>
    dialect: 'pg'
  }>
  select<T extends AnyPluginTable>(table: T): Promise<T['$inferSelect'][]>
  insert<T extends AnyPluginTable>(table: T, values: T['$inferInsert']): Promise<void>
  update<T extends AnyPluginTable>(
    table: T,
    values: Partial<T['$inferInsert']>,
    where: SQL,
  ): Promise<void>
}
