import type { ChatMessageEvent, CommandTargetEventPayload } from '@streamer-kit/shared'

import type { EventBus } from '../events/bus.ts'
import type { CoreEventMap } from '../events/coreEventMap.ts'

export interface CommandDefinition {
  id: string
  trigger: string
  aliases?: string[] | undefined
  targetEvent: string
  enabled?: boolean
  cooldownMs?: number
}

export class CommandsService {
  private commands = new Map<string, CommandDefinition>()
  private lastTriggeredAt = new Map<string, number>()

  constructor(private readonly bus: EventBus<CoreEventMap>) {
    this.bus.on('chat.message', event => this.handleChatMessage(event))
  }

  register(definition: CommandDefinition): void {
    this.commands.set(definition.id, definition)
  }

  private handleChatMessage(event: ChatMessageEvent): void {
    const [triggerToken, ...args] = event.message.trim().split(/\s+/)
    if (!triggerToken) return

    const command = this.match(triggerToken)
    if (!command || command.enabled === false) return
    if (this.isOnCooldown(command)) return

    this.bus.emit('command.triggered', {
      commandId: command.id,
      chatEvent: event,
      args,
    })
    const targetPayload: CommandTargetEventPayload = { chatEvent: event, args }
    this.bus.emit(command.targetEvent, targetPayload)
  }

  private match(token: string): CommandDefinition | undefined {
    const normalized = token.toLowerCase()

    for (const command of this.commands.values()) {
      if (command.trigger.toLowerCase() === normalized) return command
      if (command.aliases?.some(alias => alias.toLowerCase() === normalized)) return command
    }

    return undefined
  }

  private isOnCooldown(command: CommandDefinition): boolean {
    if (!command.cooldownMs) return false

    const lastTriggeredAt = this.lastTriggeredAt.get(command.id)
    const now = Date.now()
    if (lastTriggeredAt !== undefined && now - lastTriggeredAt < command.cooldownMs) return true

    this.lastTriggeredAt.set(command.id, now)
    return false
  }
}
