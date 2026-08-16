import './env.ts'

import { createRuntime, installPlugin, resolveViewer } from '@streamer-kit/core'
import { pingPlugin } from '@streamer-kit/plugin-ping'

import { addCurrency } from './currency/addCurrency.ts'
import { createHttpServer } from './http/server.ts'

const CHAT_MESSAGE_CURRENCY_KEY = 'coin'
const CHAT_MESSAGE_REWARD_AMOUNT = 10

const runtime = createRuntime({
  bridgeActionName: process.env.STREAMERBOT_BRIDGE_ACTION_NAME,
})

// Every chat message earns currency - this isn't trigger-based, so it stays a
// direct chat.message subscriber rather than going through the Commands Service.
// Listener type is inferred from CoreEventMap['chat.message'] - no cast needed.
runtime.bus.on('chat.message', async event => {
  const viewer = await resolveViewer(event)
  const transaction = await addCurrency({
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

const httpApp = createHttpServer()
const httpPort = Number(process.env.HTTP_PORT ?? 3000)

httpApp
  .listen({ port: httpPort, host: '0.0.0.0' })
  .catch(error => {
    httpApp.log.error(error, 'Failed to start HTTP server')
    process.exit(1)
  })
