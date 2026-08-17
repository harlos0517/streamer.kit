// Deliberately independent of Core's Drizzle Viewer row - same reasoning as
// SendChatMessageParams in types/chat.ts. Trimmed to the fields a Plugin
// plausibly needs; add more only when something actually consumes them.
export interface ViewerSummary {
  id: string
  displayName: string | null
  firstSeenAt: Date
  lastMessageAt: Date | null
}
