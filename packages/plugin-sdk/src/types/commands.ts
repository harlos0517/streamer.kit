// Manifest-declared default command (1.9) - distinct from Core's internal
// CommandDefinition (which has admin/runtime-only fields like enabled/cooldownMs).
export interface PluginCommandDefinition {
  id: string
  defaultTrigger: string
  aliases?: string[]
  targetEvent: string
  userConfigurable?: boolean
}
