import type { PluginContext } from './context.ts'
import type { PluginManifest } from './manifest.ts'
import type { PluginMigration } from './migrations.ts'

// The only contract the Runtime depends on - it never checks
// `instanceof BasePlugin` (3.2).
export interface Plugin {
  manifest: PluginManifest
  // Pre-generated .sql migrations (4.9), applied by Runtime in order before
  // setup() runs. Typically built via loadMigrations() over a bundled
  // migrations/ directory. Absent for plugins with no relational schema.
  migrations?: PluginMigration[]
  setup(ctx: PluginContext): void | Promise<void>
  start?(): void | Promise<void>
  stop?(): void | Promise<void>
}
