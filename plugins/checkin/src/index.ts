import type { CommandTargetEventPayload } from '@streamer-kit/plugin-sdk'
import { definePlugin, loadMigrations } from '@streamer-kit/plugin-sdk'

import { PLUGIN_ID } from './pluginId.ts'
import type { CurrencyCapability } from './service.ts'
import { createCheckinService } from './service.ts'

const SUCCESS_TEMPLATE = '{{viewerName}} 簽到成功！連續 {{streak}} 天，獲得 {{reward}} 枚硬幣！'
const ALREADY_TEMPLATE = '{{viewerName}} 今天已經簽到過了，明天再來吧！（連續 {{streak}} 天）'

// Pre-generated via `drizzle-kit generate` (schema.ts) - Runtime applies
// these automatically on install (4.9), never regenerates them.
const migrations = loadMigrations(new URL('../migrations', import.meta.url))

export const checkinPlugin = definePlugin({
  manifest: {
    id: PLUGIN_ID,
    name: 'Check-in',
    version: '0.1.0',
    permissions: { required: ['chat:send'] },
    commands: [
      {
        id: 'checkin',
        defaultTrigger: '!簽到',
        aliases: ['!checkin'],
        targetEvent: 'checkin.requested',
        userConfigurable: true,
      },
    ],
  },
  migrations,
  setup(ctx) {
    // Service dependency, not an implementation import (5.4) - installPlugin
    // must run this after the Currency plugin's, or this throws immediately
    // (ServiceRegistry.get has no retry/wait - see apps/server/src/main.ts).
    const currency = ctx.services.get<CurrencyCapability>('currency')
    const checkinService = createCheckinService(ctx.database, ctx.events, currency)
    ctx.services.register('checkin', checkinService)

    ctx.events.on('checkin.requested', async payload => {
      const { chatEvent } = payload as CommandTargetEventPayload

      try {
        const result = await checkinService.checkIn(chatEvent.viewerId)

        const message = ctx.template.render(
          result.status === 'checked-in' ? SUCCESS_TEMPLATE : ALREADY_TEMPLATE,
          {
            viewerName: chatEvent.platformDisplayName,
            streak: result.streak,
            reward: result.status === 'checked-in' ? result.reward : undefined,
          },
        )
        await ctx.chat.send({ platform: chatEvent.platform, message })
      } catch(error) {
        ctx.logger.error('checkin failed', error)
      }
    })
  },
})

export type { CheckinResult, CheckinService, CheckinStatus } from './service.ts'
