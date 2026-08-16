import type { PluginContext } from './context.ts'
import type { PluginManifest } from './manifest.ts'
import type { Plugin } from './plugin.ts'

// Functional alternative to BasePlugin (3.4) - third parties aren't forced
// into OOP.
export interface PluginDefinition {
  manifest: PluginManifest
  setup(ctx: PluginContext): void | Promise<void>
  start?(): void | Promise<void>
  stop?(): void | Promise<void>
}

export const definePlugin = (definition: PluginDefinition): Plugin => definition
