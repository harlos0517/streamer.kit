import type { PluginContext } from './context.ts'
import type { PluginManifest } from './manifest.ts'
import type { Plugin } from './plugin.ts'

// Optional OOP-style base class (3.3) - purely a convenience wrapper, not a
// Runtime contract. Subclasses that override setup() should call
// super.setup(ctx) first to get context storage.
export abstract class BasePlugin implements Plugin {
  abstract manifest: PluginManifest
  protected ctx?: PluginContext

  setup(ctx: PluginContext): void | Promise<void> {
    this.ctx = ctx
  }

  start?(): void | Promise<void>
  stop?(): void | Promise<void>
}
