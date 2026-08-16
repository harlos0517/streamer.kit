import { createBridgeCapability } from '../actions/bridge.ts'
import { createChatCapability } from '../actions/chat.ts'
import { createActionsCapability } from '../actions/userActions.ts'
import { CommandsService } from '../commands/service.ts'
import { EventBus } from '../events/bus.ts'
import type { CoreEventMap } from '../events/coreEventMap.ts'
import { registerNormalizers } from '../events/normalize.ts'
import { ServiceRegistry } from '../services/registry.ts'
import { createStreamerbotAdapter } from '../streamerbot/adapter.ts'
import { createTemplateService } from '../template/service.ts'

export interface RuntimeOptions {
  bridgeActionName?: string | undefined
}

export const createRuntime = (options: RuntimeOptions = {}) => {
  const bus = new EventBus<CoreEventMap>()
  const services = new ServiceRegistry()
  const commands = new CommandsService(bus)

  registerNormalizers(bus)
  const adapter = createStreamerbotAdapter(bus)
  const chat = createChatCapability(adapter.client)
  const template = createTemplateService()
  const bridge = createBridgeCapability(adapter.client, options.bridgeActionName)
  const actions = createActionsCapability(adapter.client)

  return { bus, services, commands, adapter, chat, template, bridge, actions }
}

export type Runtime = ReturnType<typeof createRuntime>
