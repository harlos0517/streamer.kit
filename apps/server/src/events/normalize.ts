import type { PayloadBase, TwitchChatMessageEventData } from '@/types/eventData.ts'

export type Platform = 'twitch' // | 'youtube'

export type ChatMessageEvent = {
  type: 'chat.message'
  platform: Platform
  platformUserId: string
  platformDisplayName: string
  message: string
  timestamp: string
  raw: unknown
}

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

export function normalizeTwitchChatMessage(
  payload: PayloadBase<TwitchChatMessageEventData>,
): ChatMessageEvent {
  const { data } = payload

  return {
    type: 'chat.message',
    platform: 'twitch',
    platformUserId: data.user.id,
    platformDisplayName: data.user.name,
    message: data.text,
    timestamp: payload.timeStamp,
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
