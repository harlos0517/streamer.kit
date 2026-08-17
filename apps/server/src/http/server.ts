import cors from '@fastify/cors'
import { db } from '@streamer-kit/core'
import type { CurrencyService } from '@streamer-kit/plugin-currency'
import Fastify from 'fastify'

export const createHttpServer = (currencyService: CurrencyService) => {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })

  app.get('/viewers', async() => {
    const viewers = await db.query.viewers.findMany({
      orderBy: (viewers, { desc }) => [desc(viewers.lastMessageAt)],
    })

    return Promise.all(viewers.map(async viewer => ({
      id: viewer.id,
      displayName: viewer.displayName,
      firstSeenAt: viewer.firstSeenAt,
      lastMessageAt: viewer.lastMessageAt,
      wallets: [{
        currency: 'coin',
        balance: await currencyService.getBalance(viewer.id, 'coin'),
      }],
    })))
  })

  return app
}
