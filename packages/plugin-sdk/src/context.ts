import type { DatabaseAPI } from './database/api.ts'
import type { Principal } from './permission.ts'
import type { PluginStorage } from './storage.ts'
import type { SendChatMessageParams } from './types/chat.ts'
import type { PluginCommandDefinition } from './types/commands.ts'
import type { ViewerSummary } from './types/viewer.ts'

// Structurally compatible with Core's real EventBus/ServiceRegistry, but
// declared independently - plugin-sdk never imports from @streamer-kit/core.
export interface EventAPI {
  on<T = unknown>(event: string, listener: (payload: T) => void | Promise<void>): () => void
  emit<T = unknown>(event: string, payload: T): void
}

export interface ServiceAPI {
  register(name: string, implementation: unknown): void
  get<T>(name: string): T
}

export interface CommandAPI {
  register(command: PluginCommandDefinition): void
}

export interface ChatAPI {
  send(params: SendChatMessageParams): Promise<void>
}

export interface ViewerAPI {
  // Re-fetches a previously-obtained viewerId - needs viewer:read. Returns
  // undefined if the viewer no longer exists (4.8). Resolving *from* a chat
  // event isn't a Plugin capability - chatEvent.viewerId is already resolved
  // by Runtime at normalization time (1.4), before chat.message reaches the
  // Event Bus, so every Plugin already has it with no permission needed.
  get(viewerId: string): Promise<ViewerSummary | undefined>
}

export interface TemplateAPI {
  render(template: string, data: Record<string, unknown>): string
}

export interface Logger {
  info(...args: unknown[]): void
  warn(...args: unknown[]): void
  error(...args: unknown[]): void
}

// Deliberately excludes obs/actions this round - see the Part 3/4 plans for
// why (they each need Runtime capabilities that don't exist yet without
// opening a backdoor around the plugin-sdk boundary). viewer was excluded
// for the same reason until Part 5 (Check-in) needed it - see ViewerAPI.
export interface PluginContext {
  plugin: {
    id: string
    version: string
  }
  // Every call made through this ctx is implicitly on behalf of this
  // principal (3.12) - the hook future Service-to-Service propagation will
  // use once real inter-plugin services exist to thread it through.
  principal: Principal
  events: EventAPI
  services: ServiceAPI
  commands: CommandAPI
  chat: ChatAPI
  viewer: ViewerAPI
  template: TemplateAPI
  storage: PluginStorage
  database: DatabaseAPI
  logger: Logger
}
