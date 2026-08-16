import type { ChatMessageEvent } from './chat.ts'

export interface CommandTriggeredEvent {
  commandId: string
  chatEvent: ChatMessageEvent
  args: string[]
}

// Shape of the payload emitted on a command's own targetEvent. Not part of
// CoreEventMap since targetEvent is a runtime string, not a literal key -
// consumers cast to this explicitly.
export interface CommandTargetEventPayload {
  chatEvent: ChatMessageEvent
  args: string[]
}
