import type { DatabaseAPI, EventAPI } from '@streamer-kit/plugin-sdk'
import { and, eq } from 'drizzle-orm'

import { currencyColumns, transactionColumns } from './schema.ts'

export interface CurrencyTransaction {
  id: string
  viewerId: string
  currencyId: string
  amount: number
  reason: string
  source: string | null
  createdAt: Date
}

export interface CurrencyService {
  getBalance(viewerId: string, currencyKey: string): Promise<number>
  add(params: {
    viewerId: string
    currencyKey: string
    amount: number
    reason: string
    source?: string | undefined
  }): Promise<CurrencyTransaction>
  subtract(params: {
    viewerId: string
    currencyKey: string
    amount: number
    reason: string
    source?: string | undefined
  }): Promise<CurrencyTransaction>
  transfer(params: {
    fromViewerId: string
    toViewerId: string
    currencyKey: string
    amount: number
    reason: string
    source?: string | undefined
  }): Promise<{ debit: CurrencyTransaction, credit: CurrencyTransaction }>
}

// Idempotent default-data bootstrap, run from setup() before the service is
// registered - replaces the old standalone seed.ts script, which opened its
// own drizzle connection outside the Runtime/ctx.database boundary and had
// to run as a separate pre-boot deploy step (ordering problem: it depended
// on the plugin's schema already existing, but schema creation itself is
// handled by installPlugin()'s automatic migration - see 4.9). Doing it here
// instead means schema creation and default-data creation happen in the same
// install step, in the right order, with no external orchestration needed.
export const ensureCurrency = async(
  database: DatabaseAPI, key: string, name: string,
): Promise<void> => {
  const currencyTable = database.table('currency', currencyColumns)
  const existing = await database.select(currencyTable, eq(currencyTable.key, key))
  if (existing.length === 0) await database.insert(currencyTable, { key, name })
}

export const createCurrencyService = (database: DatabaseAPI, events: EventAPI): CurrencyService => {
  const currencyTable = database.table('currency', currencyColumns)
  const transactionTable = database.table('transaction', transactionColumns)

  const resolveCurrencyId = async(currencyKey: string): Promise<string> => {
    const rows = await database.select(currencyTable, eq(currencyTable.key, currencyKey))
    if (!rows[0]) throw new Error(`Currency not found: ${currencyKey}`)
    return rows[0].id
  }

  const sumBalance = async(viewerId: string, currencyId: string): Promise<number> => {
    const rows = await database.select(
      transactionTable,
      and(eq(transactionTable.viewerId, viewerId), eq(transactionTable.currencyId, currencyId)),
    )
    return rows.reduce((total, row) => total + row.amount, 0)
  }

  const record = async(
    viewerId: string,
    currencyId: string,
    currencyKey: string,
    amount: number,
    reason: string,
    source?: string | undefined,
  ): Promise<CurrencyTransaction> => {
    const row = await database.insert(
      transactionTable, { viewerId, currencyId, amount, reason, source },
    )
    events.emit('currency.transactionCreated', row)
    const balance = await sumBalance(viewerId, currencyId)
    events.emit('currency.balanceChanged', { viewerId, currencyKey, balance })
    return row
  }

  // Defined as local consts (not object methods referencing `this`) so
  // transfer() can call add/subtract directly - safe even if a caller ever
  // destructures the returned service instead of calling it as a method.
  const getBalance = async(viewerId: string, currencyKey: string): Promise<number> =>
    sumBalance(viewerId, await resolveCurrencyId(currencyKey))

  const add: CurrencyService['add'] = async params => {
    const currencyId = await resolveCurrencyId(params.currencyKey)
    return record(
      params.viewerId, currencyId, params.currencyKey, params.amount, params.reason, params.source,
    )
  }

  const subtract: CurrencyService['subtract'] = async params => {
    const currencyId = await resolveCurrencyId(params.currencyKey)
    const balance = await sumBalance(params.viewerId, currencyId)
    if (balance < params.amount) {
      throw new Error(
        `Insufficient balance for viewer "${params.viewerId}": `
        + `has ${balance}, needs ${params.amount}`,
      )
    }
    return record(
      params.viewerId, currencyId, params.currencyKey, -params.amount, params.reason, params.source,
    )
  }

  const transfer: CurrencyService['transfer'] = async params => {
    // Not atomic - no ctx.database.transaction() this round. If debit
    // succeeds and credit fails, the ledger is left inconsistent; both sides
    // share reason/source so it's at least auditable/repairable.
    const debit = await subtract({
      viewerId: params.fromViewerId,
      currencyKey: params.currencyKey,
      amount: params.amount,
      reason: params.reason,
      source: params.source,
    })
    const credit = await add({
      viewerId: params.toViewerId,
      currencyKey: params.currencyKey,
      amount: params.amount,
      reason: params.reason,
      source: params.source,
    })
    return { debit, credit }
  }

  return { getBalance, add, subtract, transfer }
}
