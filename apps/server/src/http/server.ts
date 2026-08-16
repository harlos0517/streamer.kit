import cors from '@fastify/cors'
import { db } from '@streamer-kit/core'
import Fastify from 'fastify'

export const createHttpServer = () => {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })

  app.get('/viewers', async() => {
    const viewers = await db.query.viewers.findMany({
      orderBy: (viewers, { desc }) => [desc(viewers.lastMessageAt)],
      with: { wallets: { with: { currency: true } } },
    })

    return viewers.map(viewer => ({
      id: viewer.id,
      displayName: viewer.displayName,
      firstSeenAt: viewer.firstSeenAt,
      lastMessageAt: viewer.lastMessageAt,
      wallets: viewer.wallets.map(wallet => ({
        currency: wallet.currency.key,
        balance: wallet.balance,
      })),
    }))
  })

  return app
}
