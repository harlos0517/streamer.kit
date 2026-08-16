import type { CommandTargetEventPayload } from '@streamer-kit/plugin-sdk'
import { definePlugin } from '@streamer-kit/plugin-sdk'

const PING_REPLY_TEMPLATE = '{{viewerName}} 呼叫了 !ping，pong 🏓'

// Proves the Plugin mechanism end to end (Part 3): this package only depends
// on @streamer-kit/plugin-sdk, never @streamer-kit/core.
export const pingPlugin = definePlugin({
  manifest: {
    id: 'demo.ping',
    name: 'Ping',
    version: '0.1.0',
    commands: [
      {
        id: 'ping',
        defaultTrigger: '!ping',
        targetEvent: 'ping.requested',
        userConfigurable: true,
      },
    ],
  },
  setup(ctx) {
    ctx.events.on('ping.requested', async payload => {
      const { chatEvent } = payload as CommandTargetEventPayload
      const message = ctx.template.render(PING_REPLY_TEMPLATE, {
        viewerName: chatEvent.platformDisplayName,
      })

      try {
        await ctx.chat.send({ platform: chatEvent.platform, message })
      } catch(error) {
        ctx.logger.error('chat.send failed', error)
      }
    })
  },
})
