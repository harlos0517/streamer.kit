import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { index, integer, jsonb, pgSchema, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

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

export const currencies = core.table('currencies', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const wallets = core.table('wallets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  balance: integer('balance').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  viewerId: text('viewer_id').notNull().references(() => viewers.id),
  currencyId: text('currency_id').notNull().references(() => currencies.id),
}, table => [
  uniqueIndex('wallets_viewer_id_currency_id_key').on(table.viewerId, table.currencyId),
])

export const transactions = core.table('transactions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  source: text('source'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  viewerId: text('viewer_id').notNull().references(() => viewers.id),
  currencyId: text('currency_id').notNull().references(() => currencies.id),
}, table => [
  index('transactions_viewer_id_idx').on(table.viewerId),
  index('transactions_currency_id_idx').on(table.currencyId),
])

export const viewersRelations = relations(viewers, ({ many }) => ({
  identities: many(identities),
  wallets: many(wallets),
  transactions: many(transactions),
}))

export const identitiesRelations = relations(identities, ({ one }) => ({
  viewer: one(viewers, { fields: [identities.viewerId], references: [viewers.id] }),
}))

export const currenciesRelations = relations(currencies, ({ many }) => ({
  wallets: many(wallets),
  transactions: many(transactions),
}))

export const walletsRelations = relations(wallets, ({ one }) => ({
  viewer: one(viewers, { fields: [wallets.viewerId], references: [viewers.id] }),
  currency: one(currencies, { fields: [wallets.currencyId], references: [currencies.id] }),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  viewer: one(viewers, { fields: [transactions.viewerId], references: [viewers.id] }),
  currency: one(currencies, { fields: [transactions.currencyId], references: [currencies.id] }),
}))

export type Viewer = typeof viewers.$inferSelect
export type Identity = typeof identities.$inferSelect
export type Currency = typeof currencies.$inferSelect
export type Wallet = typeof wallets.$inferSelect
export type Transaction = typeof transactions.$inferSelect
