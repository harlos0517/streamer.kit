export type Platform = 'twitch' // | 'youtube'

export type ChatMessageEvent = {
  type: 'chat.message'
  platform: Platform
  // Core's canonical identity, resolved once at normalization time (1.4),
  // before this event reaches the Event Bus - not something any downstream
  // consumer (Core's own handlers, Plugins) resolves for itself.
  viewerId: string
  platformUserId: string
  platformDisplayName: string
  message: string
  timestamp: string
  raw: unknown
}
