import type { ChatMessageEvent } from '@streamer-kit/shared'

import type { PayloadBase, TwitchChatMessageEventData } from '../types/eventData.ts'
import { resolveViewer } from '../viewer/resolve.ts'
import type { EventBus } from './bus.ts'
import type { CoreEventMap } from './coreEventMap.ts'

// Streamer.bot doesn't publish a schema for YouTube.Message yet; shape taken
// from the client library's source (youtube.types.ts), unverified against a live instance.
// type YouTubeUser = {
//   id: string
//   name: string
//   url: string
//   profileImageUrl: string
//   isModerator: boolean
//   isOwner: boolean
//   isSponsor: boolean
//   isVerified: boolean
// }

// type YouTubeMessage = {
//   eventId: string
//   message: string
//   publishedAt: string
//   user: YouTubeUser
// }

export const normalizeTwitchChatMessage = async(
  payload: PayloadBase<TwitchChatMessageEventData>,
): Promise<ChatMessageEvent> => {
  const { data } = payload

  const base = {
    platform: 'twitch' as const,
    platformUserId: data.user.id,
    platformDisplayName: data.user.name,
    timestamp: payload.timeStamp,
  }
  const viewer = await resolveViewer(base)

  return {
    type: 'chat.message',
    ...base,
    viewerId: viewer.id,
    message: data.text,
    raw: payload,
  }
}

// export function normalizeYouTubeMessage(payload: {
//   data: YouTubeMessage
//   timeStamp: string
// }): ChatMessageEvent {
//   return {
//     type: 'chat.message',
//     platform: 'youtube',
//     platformUserId: payload.data.user.id,
//     platformDisplayName: payload.data.user.name,
//     message: payload.data.message,
//     timestamp: payload.timeStamp,
//     raw: payload,
//   }
// }

export const registerNormalizers = (bus: EventBus<CoreEventMap>): void => {
  bus.on('streamerbot.twitch.chatMessage', async payload => {
    bus.emit('chat.message', await normalizeTwitchChatMessage(payload))
  })

  // bus.on('streamerbot.youtube.message', payload => {
  //   bus.emit('chat.message', normalizeYouTubeMessage(payload))
  // })
}
