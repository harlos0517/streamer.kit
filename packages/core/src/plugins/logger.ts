import type { Logger } from '@streamer-kit/plugin-sdk'

export const createLogger = (pluginId: string): Logger => {
  const prefix = `[${pluginId}]`

  return {
    info: (...args) => console.info(prefix, ...args),
    warn: (...args) => console.warn(prefix, ...args),
    error: (...args) => console.error(prefix, ...args),
  }
}
