import type { PluginCommandDefinition } from './types/commands.ts'

// Fields beyond these (permissions/events/services/actions/database/settings/
// dependencies, per CLAUDE.md 3.5) aren't added yet - nothing in the Runtime
// processes them this round, so declaring them now would just be dead shape.
export interface PluginManifest {
  id: string
  name: string
  version: string
  commands?: PluginCommandDefinition[]
}
