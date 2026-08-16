import type { StreamerbotEventName } from '@streamerbot/client'

import type { EventBus } from '../events/bus.ts'

import { createStreamerbotClient } from './client.ts'

const RAW_EVENT_PREFIX = 'streamerbot.'

// Our bus namespace -> Streamer.bot's own "Source.Type" event string.
// Only events listed here can ever be forwarded; unmapped streamerbot.*
// subscriptions are silently ignored (nothing to subscribe to yet).
const RAW_EVENT_MAP: Record<string, StreamerbotEventName> = {
  'twitch.chatMessage': 'Twitch.ChatMessage',
  // 'youtube.message': 'YouTube.Message',
}

export function createStreamerbotAdapter(bus: EventBus) {
  const client = createStreamerbotClient()

  // Lazy by design: Streamer.bot exposes hundreds of possible event types
  // (Twitch/YouTube/OBS/VTubeStudio/...). client.on() itself only subscribes
  // to what's asked for, so we only ask for a raw event once something on
  // the Runtime bus actually listens for it - see EventBus.onSubscribe.
  bus.onSubscribe(event => {
    if (!event.startsWith(RAW_EVENT_PREFIX)) return

    const sbEvent = RAW_EVENT_MAP[event.slice(RAW_EVENT_PREFIX.length)]
    if (!sbEvent) return

    client.on(sbEvent, payload => bus.emit(event, payload))
  })

  return { client }
}
