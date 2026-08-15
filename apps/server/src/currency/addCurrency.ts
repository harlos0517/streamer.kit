import type { Transaction } from '@streamer-kit/database'
import { prisma } from '@streamer-kit/database'

export async function addCurrency(params: {
  viewerId: string
  currencyKey: string
  amount: number
  reason: string
  source: string
}): Promise<Transaction> {
  const currency = await prisma.currency.findUniqueOrThrow({ where: { key: params.currencyKey } })

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        viewerId: params.viewerId,
        currencyId: currency.id,
        amount: params.amount,
        reason: params.reason,
        source: params.source,
      },
    }),
    prisma.wallet.upsert({
      where: { viewerId_currencyId: { viewerId: params.viewerId, currencyId: currency.id } },
      create: { viewerId: params.viewerId, currencyId: currency.id, balance: params.amount },
      update: { balance: { increment: params.amount } },
    }),
  ])

  return transaction
}
