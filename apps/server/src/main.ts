import './env.ts'

import { createRuntime, installPlugin, resolveViewer } from '@streamer-kit/core'
import type { CurrencyService } from '@streamer-kit/plugin-currency'
import { currencyPlugin } from '@streamer-kit/plugin-currency'
import { pingPlugin } from '@streamer-kit/plugin-ping'

import { createHttpServer } from './http/server.ts'

const CHAT_MESSAGE_CURRENCY_KEY = 'coin'
const CHAT_MESSAGE_REWARD_AMOUNT = 10

const runtime = createRuntime({
  bridgeActionName: process.env.STREAMERBOT_BRIDGE_ACTION_NAME,
})

await installPlugin(currencyPlugin, runtime)
const currencyService = runtime.services.get<CurrencyService>('currency')

// Every chat message earns currency - this isn't trigger-based, so it stays a
// direct chat.message subscriber rather than going through the Commands Service.
// Listener type is inferred from CoreEventMap['chat.message'] - no cast needed.
runtime.bus.on('chat.message', async event => {
  const viewer = await resolveViewer(event)
  const transaction = await currencyService.add({
    viewerId: viewer.id,
    currencyKey: CHAT_MESSAGE_CURRENCY_KEY,
    amount: CHAT_MESSAGE_REWARD_AMOUNT,
    reason: 'chat.message',
    source: 'core',
  })
  console.log(
    '[chat.message]', event.platform, event.platformDisplayName, event.message,
    '-> viewer', viewer.id, `+${transaction.amount} ${CHAT_MESSAGE_CURRENCY_KEY}`,
  )
})

await installPlugin(pingPlugin, runtime, { grantedPermissions: ['chat:send'] })

const httpApp = createHttpServer(currencyService)
const httpPort = Number(process.env.HTTP_PORT ?? 3000)

httpApp
  .listen({ port: httpPort, host: '0.0.0.0' })
  .catch(error => {
    httpApp.log.error(error, 'Failed to start HTTP server')
    process.exit(1)
  })
