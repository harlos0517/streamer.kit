// No pluginId parameter anywhere on this interface (4.4) - a Plugin has no
// way to address another Plugin's namespace, structurally, not just by
// runtime check.
export interface PluginStorage {
  get<T = unknown>(key: string): Promise<T | undefined>
  set(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
}
