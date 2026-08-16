// Deliberately independent of @streamerbot/client's StreamerbotPlatform -
// Plugins shouldn't know the underlying integration is Streamer.bot (2.1).
export type SendPlatform = 'twitch' | 'youtube' | 'trovo' | 'kick'

export interface SendChatMessageParams {
  platform: SendPlatform
  message: string
  bot?: boolean
  internal?: boolean
  replyId?: string
  broadcastId?: string
}
