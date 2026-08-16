export { BasePlugin } from './basePlugin.ts'
export type {
  ChatAPI,
  CommandAPI,
  EventAPI,
  Logger,
  PluginContext,
  ServiceAPI,
  TemplateAPI,
} from './context.ts'
export type { AnyPluginTable, DatabaseAPI } from './database/api.ts'
export { db } from './database/columns.ts'
export type { PluginDefinition } from './definePlugin.ts'
export { definePlugin } from './definePlugin.ts'
export type { PluginManifest } from './manifest.ts'
export type { Plugin } from './plugin.ts'
export type { Principal, PluginPermissions, PluginPrincipal } from './permission.ts'
export { PermissionDeniedError } from './permission.ts'
export type { PluginStorage } from './storage.ts'
export type { SendChatMessageParams, SendPlatform } from './types/chat.ts'
export type { PluginCommandDefinition } from './types/commands.ts'

// Re-exported so plugin authors only need one import source (0.4).
export type {
  ChatMessageEvent,
  CommandTargetEventPayload,
  CommandTriggeredEvent,
  Platform,
} from '@streamer-kit/shared'
