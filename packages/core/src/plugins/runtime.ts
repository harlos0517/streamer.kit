import type { Plugin } from '@streamer-kit/plugin-sdk'
import { PermissionDeniedError } from '@streamer-kit/plugin-sdk'

import type { Runtime } from '../runtime/runtime.ts'
import { createPluginContext } from './context.ts'
import { applyPluginMigrations } from './migrations.ts'

export interface InstallPluginOptions {
  grantedPermissions?: string[] | undefined
}

export const installPlugin = async(
  plugin: Plugin,
  runtime: Runtime,
  options: InstallPluginOptions = {},
): Promise<void> => {
  const granted = new Set(options.grantedPermissions ?? [])
  const missingRequired = (plugin.manifest.permissions?.required ?? [])
    .filter(permission => !granted.has(permission))

  if (missingRequired.length > 0) {
    throw new PermissionDeniedError(
      `Plugin "${plugin.manifest.id}" cannot start - missing required permissions: `
      + missingRequired.join(', '),
    )
  }

  if (plugin.migrations) await applyPluginMigrations(plugin.manifest.id, plugin.migrations)

  const ctx = createPluginContext(plugin.manifest, runtime, granted)

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
