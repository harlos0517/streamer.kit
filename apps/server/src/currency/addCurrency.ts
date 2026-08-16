import type { Transaction } from '@streamer-kit/core'
import { currencies, db, transactions, wallets } from '@streamer-kit/core'
import { eq, sql } from 'drizzle-orm'

export const addCurrency = async(params: {
  viewerId: string
  currencyKey: string
  amount: number
  reason: string
  source: string
}): Promise<Transaction> => {
  const currency = await db.query.currencies.findFirst({
    where: eq(currencies.key, params.currencyKey),
  })
  if (!currency) throw new Error(`Currency not found: ${params.currencyKey}`)

  return db.transaction(async tx => {
    const [transaction] = await tx.insert(transactions).values({
      viewerId: params.viewerId,
      currencyId: currency.id,
      amount: params.amount,
      reason: params.reason,
      source: params.source,
    }).returning()

    await tx.insert(wallets)
      .values({ viewerId: params.viewerId, currencyId: currency.id, balance: params.amount })
      .onConflictDoUpdate({
        target: [wallets.viewerId, wallets.currencyId],
        set: { balance: sql`${wallets.balance} + ${params.amount}` },
      })

    return transaction!
  })
}
