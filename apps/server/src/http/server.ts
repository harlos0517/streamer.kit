import cors from '@fastify/cors'
import { prisma } from '@streamer-kit/database'
import Fastify from 'fastify'

export function createHttpServer() {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })

  app.get('/viewers', async() => {
    const viewers = await prisma.viewer.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: { wallets: { include: { currency: true } } },
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
