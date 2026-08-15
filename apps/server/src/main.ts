import './env.ts'

import type { PayloadBase, TwitchChatMessageEventData } from '@/types/eventData.ts'
import type { ChatMessageEvent } from './events/normalize.ts'
import { normalizeTwitchChatMessage } from './events/normalize.ts'
import { addCurrency } from './currency/addCurrency.ts'
import { createStreamerbotClient } from './streamerbot/client.ts'
import { resolveViewer } from './viewers/resolve.ts'

const CHAT_MESSAGE_CURRENCY_KEY = 'coin'
const CHAT_MESSAGE_REWARD_AMOUNT = 10

async function handleChatMessage(event: ChatMessageEvent) {
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
}

const client = createStreamerbotClient()

client.on('Twitch.ChatMessage', payload => {
  handleChatMessage(normalizeTwitchChatMessage(
    payload as unknown as PayloadBase<TwitchChatMessageEventData>,
  )).catch(error => console.error('Failed to handle chat message', error))
})

// client.on('YouTube.Message', payload => {
//   handleChatMessage(normalizeYouTubeMessage(payload))
// })
