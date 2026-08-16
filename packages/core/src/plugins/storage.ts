import type { PluginStorage } from '@streamer-kit/plugin-sdk'
import { and, eq } from 'drizzle-orm'

import { db } from '../persistence/client.ts'
import { pluginStorage } from '../persistence/schema.ts'

export const createPluginStorage = (pluginId: string): PluginStorage => {
  return {
    async get<T>(key: string): Promise<T | undefined> {
      const row = await db.query.pluginStorage.findFirst({
        where: and(eq(pluginStorage.pluginId, pluginId), eq(pluginStorage.key, key)),
      })
      return row?.value as T | undefined
    },
    async set(key: string, value: unknown): Promise<void> {
      await db.insert(pluginStorage)
        .values({ pluginId, key, value })
        .onConflictDoUpdate({
          target: [pluginStorage.pluginId, pluginStorage.key],
          set: { value },
        })
    },
    async delete(key: string): Promise<void> {
      await db.delete(pluginStorage)
        .where(and(eq(pluginStorage.pluginId, pluginId), eq(pluginStorage.key, key)))
    },
  }
}
