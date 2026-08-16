import { createChatCapability } from '../actions/chat.ts'
import { CommandsService } from '../commands/service.ts'
import { EventBus } from '../events/bus.ts'
import type { CoreEventMap } from '../events/coreEventMap.ts'
import { registerNormalizers } from '../events/normalize.ts'
import { ServiceRegistry } from '../services/registry.ts'
import { createStreamerbotAdapter } from '../streamerbot/adapter.ts'
import { createTemplateService } from '../template/service.ts'

export const createRuntime = () => {
  const bus = new EventBus<CoreEventMap>()
  const services = new ServiceRegistry()
  const commands = new CommandsService(bus)

  registerNormalizers(bus)
  const adapter = createStreamerbotAdapter(bus)
  const chat = createChatCapability(adapter.client)
  const template = createTemplateService()

  return { bus, services, commands, adapter, chat, template }
}

export type Runtime = ReturnType<typeof createRuntime>
