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
