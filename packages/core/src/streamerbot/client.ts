import { StreamerbotClient } from '@streamerbot/client'

export function createStreamerbotClient() {
  const password = process.env.STREAMERBOT_WS_PASSWORD

  return new StreamerbotClient({
    host: process.env.STREAMERBOT_WS_HOST ?? '127.0.0.1',
    port: Number(process.env.STREAMERBOT_WS_PORT ?? 8080),
    endpoint: process.env.STREAMERBOT_WS_ENDPOINT ?? '/',
    ...(password ? { password } : {}),
    immediate: true,
    autoReconnect: true,
    retries: -1,
    onConnect: info => {
      console.info(`Connected to Streamer.bot ${info.version} (${info.instanceId})`)
    },
    onDisconnect: () => {
      console.warn('Disconnected from Streamer.bot, attempting to reconnect...')
    },
    onError: error => {
      console.error('Streamer.bot connection error:', error)
    },
  })
}
