import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { index, jsonb, pgSchema, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const core = pgSchema('core')

export const platformEnum = core.enum('platform', ['twitch', 'youtube'])

export const viewers = core.table('viewers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const identities = core.table('identities', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  platform: platformEnum('platform').notNull(),
  platformUserId: text('platform_user_id').notNull(),
  platformDisplayName: text('platform_display_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  viewerId: text('viewer_id').notNull().references(() => viewers.id),
}, table => [
  uniqueIndex('identities_platform_platform_user_id_key').on(table.platform, table.platformUserId),
  index('identities_viewer_id_idx').on(table.viewerId),
])

export const pluginStorage = core.table('plugin_storage', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  pluginId: text('plugin_id').notNull(),
  key: text('key').notNull(),
  value: jsonb('value'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, table => [
  uniqueIndex('plugin_storage_plugin_id_key_key').on(table.pluginId, table.key),
])

export const pluginMigration = core.table('plugin_migration', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  pluginId: text('plugin_id').notNull(),
  migrationName: text('migration_name').notNull(),
  appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('plugin_migration_plugin_id_migration_name_key')
    .on(table.pluginId, table.migrationName),
])

export const viewersRelations = relations(viewers, ({ many }) => ({
  identities: many(identities),
}))

export const identitiesRelations = relations(identities, ({ one }) => ({
  viewer: one(viewers, { fields: [identities.viewerId], references: [viewers.id] }),
}))

export type Viewer = typeof viewers.$inferSelect
export type Identity = typeof identities.$inferSelect
export type PluginStorageRow = typeof pluginStorage.$inferSelect
export type PluginMigrationRow = typeof pluginMigration.$inferSelect
