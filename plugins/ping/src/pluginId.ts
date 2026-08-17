// Single source for the manifest id - schema.ts (pgSchema naming) and
// index.ts (manifest.id) both import this instead of duplicating the
// literal. Lives in its own file, not schema.ts or index.ts, because those
// two already import from each other (index.ts pulls the column shapes from
// schema.ts) - putting it in either would create a cycle.
export const PLUGIN_ID = 'demo.ping'
