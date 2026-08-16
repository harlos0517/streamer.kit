import type { Plugin } from '@streamer-kit/plugin-sdk'

import type { Runtime } from '../runtime/runtime.ts'
import { createPluginContext } from './context.ts'

export const installPlugin = async(plugin: Plugin, runtime: Runtime): Promise<void> => {
  const ctx = createPluginContext(plugin.manifest, runtime)

  for (const command of plugin.manifest.commands ?? []) {
    runtime.commands.register({
      id: `${plugin.manifest.id}.${command.id}`,
      trigger: command.defaultTrigger,
      aliases: command.aliases,
      targetEvent: command.targetEvent,
    })
  }

  await plugin.setup(ctx)
  await plugin.start?.()
}
