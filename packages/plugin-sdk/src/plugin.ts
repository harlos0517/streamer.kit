import type { PluginContext } from './context.ts'
import type { PluginManifest } from './manifest.ts'

// The only contract the Runtime depends on - it never checks
// `instanceof BasePlugin` (3.2).
export interface Plugin {
  manifest: PluginManifest
  setup(ctx: PluginContext): void | Promise<void>
  start?(): void | Promise<void>
  stop?(): void | Promise<void>
}
