import { createId } from '@paralleldrive/cuid2'
import { boolean, integer, jsonb, text, timestamp } from 'drizzle-orm/pg-core'

// Wraps common Drizzle column declarations (4.6) - simplifies the common case,
// doesn't reinvent an ORM. Plugin authors never call pgTable/pgSchema
// directly; the physical schema a table lands in is resolved by Runtime
// (see ctx.database.table()), not chosen here.
export const db = {
  id: () => text('id').primaryKey().$defaultFn(() => createId()),
  string: () => text(),
  integer: () => integer(),
  boolean: () => boolean(),
  json: <T = unknown>() => jsonb().$type<T>(),
  createdAt: () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: () => timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}
