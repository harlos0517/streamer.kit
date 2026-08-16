import type { SendChatMessageParams } from './types/chat.ts'
import type { PluginCommandDefinition } from './types/commands.ts'

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

export interface TemplateAPI {
  render(template: string, data: Record<string, unknown>): string
}

export interface Logger {
  info(...args: unknown[]): void
  warn(...args: unknown[]): void
  error(...args: unknown[]): void
}

// Deliberately excludes viewer/obs/actions/storage/database this round - see
// the Part 3 plan for why (they each need Runtime capabilities that don't
// exist yet without opening a backdoor around the plugin-sdk boundary).
export interface PluginContext {
  plugin: {
    id: string
    version: string
  }
  events: EventAPI
  services: ServiceAPI
  commands: CommandAPI
  chat: ChatAPI
  template: TemplateAPI
  logger: Logger
}
