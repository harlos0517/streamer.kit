import './env.ts'

import type { PayloadBase, TwitchChatMessageEventData } from '@/types/eventData.ts'
import type { ChatMessageEvent } from './events/normalize.ts'
import { normalizeTwitchChatMessage } from './events/normalize.ts'
import { createStreamerbotClient } from './streamerbot/client.ts'
import { resolveViewer } from './viewers/resolve.ts'

async function handleChatMessage(event: ChatMessageEvent) {
  const viewer = await resolveViewer(event)
  console.log(
    '[chat.message]', event.platform, event.platformDisplayName, event.message, '->', viewer.id,
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
