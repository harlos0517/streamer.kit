import './env.ts'

import type { CommandTargetEventPayload } from '@streamer-kit/core'
import { createRuntime, resolveViewer } from '@streamer-kit/core'

import { addCurrency } from './currency/addCurrency.ts'
import { createHttpServer } from './http/server.ts'

const CHAT_MESSAGE_CURRENCY_KEY = 'coin'
const CHAT_MESSAGE_REWARD_AMOUNT = 10
const PING_REPLY_TEMPLATE = '{{viewerName}} 呼叫了 !ping，pong 🏓'

const runtime = createRuntime()

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

// Proves the Commands Service + chat.send + Template Service pipeline works
// end to end. Not a real feature - drop it once Part 3 brings a real Plugin
// with a real command.
runtime.commands.register({
  id: 'ping',
  trigger: '!ping',
  targetEvent: 'ping.requested',
})
runtime.bus.on('ping.requested', async payload => {
  // 'ping.requested' isn't a CoreEventMap key (it's a demo command's own
  // targetEvent), so the payload comes through as unknown - Core has no way
  // to know its shape ahead of time. We know it because we defined the command.
  const { chatEvent } = payload as CommandTargetEventPayload
  const message = runtime.template.render(PING_REPLY_TEMPLATE, {
    viewerName: chatEvent.platformDisplayName,
  })

  try {
    await runtime.chat.send({ platform: chatEvent.platform, message })
  } catch(error) {
    console.error('[ping.requested] chat.send failed', error)
  }
})

const httpApp = createHttpServer()
const httpPort = Number(process.env.HTTP_PORT ?? 3000)

httpApp
  .listen({ port: httpPort, host: '0.0.0.0' })
  .catch(error => {
    httpApp.log.error(error, 'Failed to start HTTP server')
    process.exit(1)
  })
