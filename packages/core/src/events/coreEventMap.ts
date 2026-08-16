import type { CommandTriggeredEvent } from '../commands/service.ts'
import type { PayloadBase, TwitchChatMessageEventData } from '../types/eventData.ts'
import type { ChatMessageEvent } from './normalize.ts'

// Events Core itself owns/emits. Plugin-defined events (e.g. a command's
// targetEvent) aren't known here - they fall back to EventBus's untyped
// overload. Once Part 3's Plugin SDK exists, plugins can extend this via
// declaration merging instead of Core needing to know about them upfront.
// `type`, not `interface` - interfaces don't satisfy EventBus's
// `TEventMap extends Record<string, unknown>` constraint.
export type CoreEventMap = {
  'chat.message': ChatMessageEvent
  'command.triggered': CommandTriggeredEvent
  'streamerbot.twitch.chatMessage': PayloadBase<TwitchChatMessageEventData>
  // Anything not listed above (a command's targetEvent, a future Plugin event)
  // still resolves - just without a checked payload shape, same as before.
  [event: string]: unknown
}
