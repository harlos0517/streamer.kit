// Naming contract shared by two independent call sites that must always
// agree: a plugin's drizzle-kit-facing pgSchema(...) call (author-time,
// migration generation) and Runtime's ctx.database.table() resolution
// (runtime, via createPluginDatabase in @streamer-kit/core). Both derive the
// physical Postgres schema name from the same manifest id through this one
// function instead of each hardcoding the string themselves.
export const toPluginSchemaName = (pluginId: string): string =>
  `plugin_${pluginId.replace(/[^a-zA-Z0-9]+/g, '_')}`
