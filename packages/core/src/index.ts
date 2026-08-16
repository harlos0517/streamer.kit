export type { BridgeOperation, BridgeOperationArgs } from './actions/bridge.ts'
export { createBridgeCapability } from './actions/bridge.ts'
export type { SendChatMessageParams } from './actions/chat.ts'
export { createChatCapability } from './actions/chat.ts'
export { createActionsCapability } from './actions/userActions.ts'
export type { CommandDefinition } from './commands/service.ts'
export { CommandsService } from './commands/service.ts'
export { EventBus } from './events/bus.ts'
export type { CoreEventMap } from './events/coreEventMap.ts'
export { db } from './persistence/client.ts'
export * from './persistence/schema.ts'
export type { Runtime, RuntimeOptions } from './runtime/runtime.ts'
export { createRuntime } from './runtime/runtime.ts'
export type { InstallPluginOptions } from './plugins/runtime.ts'
export { installPlugin } from './plugins/runtime.ts'
export { ServiceRegistry } from './services/registry.ts'
export { createTemplateService, renderTemplate } from './template/service.ts'
export { resolveViewer } from './viewer/resolve.ts'

export type {
  ChatMessageEvent,
  CommandTargetEventPayload,
  CommandTriggeredEvent,
  Platform,
} from '@streamer-kit/shared'

export type { Plugin, PluginContext, PluginManifest, Principal } from '@streamer-kit/plugin-sdk'
export { PermissionDeniedError } from '@streamer-kit/plugin-sdk'
