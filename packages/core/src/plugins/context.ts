import type { PluginContext, PluginManifest } from '@streamer-kit/plugin-sdk'
import { PermissionDeniedError } from '@streamer-kit/plugin-sdk'

import type { Runtime } from '../runtime/runtime.ts'
import { createPluginDatabase } from './database.ts'
import { createLogger } from './logger.ts'
import { createPluginStorage } from './storage.ts'

export const createPluginContext = (
  manifest: PluginManifest,
  runtime: Runtime,
  grantedPermissions: Set<string>,
): PluginContext => {
  // Authorization boundary lives here, not on the caller (3.11): checked on
  // every call regardless of what the manifest declared as required/optional
  // - manifest declarations only affect whether install() blocks (see
  // plugins/runtime.ts), not what's actually enforced at call time.
  const assertPermission = (permission: string): void => {
    if (!grantedPermissions.has(permission)) {
      throw new PermissionDeniedError(
        `Plugin "${manifest.id}" is not authorized for "${permission}" (not granted).`,
      )
    }
  }

  return {
    plugin: { id: manifest.id, version: manifest.version },
    principal: { type: 'plugin', pluginId: manifest.id },
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
        assertPermission('chat:send')
        await runtime.chat.send(params)
      },
    },
    template: {
      render: (template, data) => runtime.template.render(template, data),
    },
    // Bound to manifest.id at construction time - the Plugin never gets a
    // chance to pass a different pluginId (4.4).
    storage: createPluginStorage(manifest.id),
    database: createPluginDatabase(manifest.id),
    logger: createLogger(manifest.id),
  }
}
