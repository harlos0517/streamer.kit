import { CommandsService } from '../commands/service.ts'
import { EventBus } from '../events/bus.ts'
import type { CoreEventMap } from '../events/coreEventMap.ts'
import { registerNormalizers } from '../events/normalize.ts'
import { ServiceRegistry } from '../services/registry.ts'
import { createStreamerbotAdapter } from '../streamerbot/adapter.ts'

export function createRuntime() {
  const bus = new EventBus<CoreEventMap>()
  const services = new ServiceRegistry()
  const commands = new CommandsService(bus)

  registerNormalizers(bus)
  const adapter = createStreamerbotAdapter(bus)

  return { bus, services, commands, adapter }
}

export type Runtime = ReturnType<typeof createRuntime>
