import type { CommandTargetEventPayload } from '@streamer-kit/plugin-sdk'
import { definePlugin, loadMigrations } from '@streamer-kit/plugin-sdk'

import { PLUGIN_ID } from './pluginId.ts'
import { pingLogColumns } from './schema.ts'

const PING_REPLY_TEMPLATE = '{{viewerName}} 呼叫了 !ping，pong 🏓（第 {{count}} 次）'

// Pre-generated via `drizzle-kit generate` (schema.ts) - Runtime applies
// these automatically on install (4.9), never regenerates them.
const migrations = loadMigrations(new URL('../migrations', import.meta.url))

// Proves the Plugin mechanism end to end (Part 3): this package only depends
// on @streamer-kit/plugin-sdk, never @streamer-kit/core.
export const pingPlugin = definePlugin({
  manifest: {
    id: PLUGIN_ID,
    name: 'Ping',
    version: '0.1.0',
    permissions: { required: ['chat:send'] },
    commands: [
      {
        id: 'ping',
        defaultTrigger: '!ping',
        targetEvent: 'ping.requested',
        userConfigurable: true,
      },
    ],
  },
  migrations,
  setup(ctx) {
    const pingLog = ctx.database.table('ping_log', pingLogColumns)

    ctx.events.on('ping.requested', async payload => {
      const { chatEvent } = payload as CommandTargetEventPayload
      const previousCount = (await ctx.storage.get<number>('pingCount')) ?? 0
      const count = previousCount + 1
      await ctx.storage.set('pingCount', count)

      await ctx.database.insert(pingLog, {
        platformDisplayName: chatEvent.platformDisplayName,
        message: chatEvent.message,
      })

      const message = ctx.template.render(PING_REPLY_TEMPLATE, {
        viewerName: chatEvent.platformDisplayName,
        count,
      })

      try {
        await ctx.chat.send({ platform: chatEvent.platform, message })
      } catch(error) {
        ctx.logger.error('chat.send failed', error)
      }
    })
  },
})
