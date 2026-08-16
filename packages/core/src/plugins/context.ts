import type { PluginContext, PluginManifest } from '@streamer-kit/plugin-sdk'

import type { Runtime } from '../runtime/runtime.ts'
import { createLogger } from './logger.ts'

export const createPluginContext = (manifest: PluginManifest, runtime: Runtime): PluginContext => {
  return {
    plugin: { id: manifest.id, version: manifest.version },
    events: {
      // EventAPI.on<T> is fully open (Plugin picks T); Core's real bus infers
      // listener type from the event name via CoreEventMap instead - the two
      // don't line up statically, so this cast is the intentional glue point.
      on: (event, listener) => runtime.bus.on(event, listener as (payload: unknown) => void),
      emit: (event, payload) => runtime.bus.emit(event, payload),
    },
    services: {
      register: (name, implementation) => runtime.services.register(name, implementation),
      get: name => runtime.services.get(name),
    },
    commands: {
      register: command => runtime.commands.register({
        id: `${manifest.id}.${command.id}`,
        trigger: command.defaultTrigger,
        aliases: command.aliases,
        targetEvent: command.targetEvent,
      }),
    },
    chat: {
      // Discard Streamer.bot's raw response shape - Plugins shouldn't see it
      // (2.1). chat.send already throws on failure.
      send: async params => {
        await runtime.chat.send(params)
      },
    },
    template: {
      render: (template, data) => runtime.template.render(template, data),
    },
    logger: createLogger(manifest.id),
  }
}
