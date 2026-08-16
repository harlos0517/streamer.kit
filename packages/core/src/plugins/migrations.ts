import type { PluginMigration } from '@streamer-kit/plugin-sdk'
import { eq, sql } from 'drizzle-orm'

import { db } from '../persistence/client.ts'
import { pluginMigration } from '../persistence/schema.ts'

// Applies a plugin's pre-generated .sql migrations in order, skipping ones
// already recorded in core.plugin_migration. Each migration's SQL + history
// record commit in the same transaction (Postgres DDL is transactional) -
// no risk of "ran but not recorded" or the reverse.
export const applyPluginMigrations = async(
  pluginId: string,
  migrations: PluginMigration[],
): Promise<void> => {
  if (migrations.length === 0) return

  const applied = await db.query.pluginMigration.findMany({
    where: eq(pluginMigration.pluginId, pluginId),
  })
  const appliedNames = new Set(applied.map(row => row.migrationName))

  for (const migration of migrations) {
    if (appliedNames.has(migration.name)) continue

    await db.transaction(async tx => {
      await tx.execute(sql.raw(migration.sql))
      await tx.insert(pluginMigration).values({ pluginId, migrationName: migration.name })
    })
  }
}
