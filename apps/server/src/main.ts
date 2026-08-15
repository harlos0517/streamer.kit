import './env.ts'

import type { PayloadBase, TwitchChatMessageEventData } from '@/types/eventData.ts'
import type { ChatMessageEvent } from './events/normalize.ts'
import { normalizeTwitchChatMessage } from './events/normalize.ts'
import { createStreamerbotClient } from './streamerbot/client.ts'

function handleChatMessage(event: ChatMessageEvent) {
  console.log('[chat.message]', event.platform, event.platformDisplayName, event.message)
}

const client = createStreamerbotClient()

client.on('Twitch.ChatMessage', payload => {
  handleChatMessage(normalizeTwitchChatMessage(
    payload as unknown as PayloadBase<TwitchChatMessageEventData>,
  ))
})

// client.on('YouTube.Message', payload => {
//   handleChatMessage(normalizeYouTubeMessage(payload))
// })
