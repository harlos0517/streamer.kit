// Permission keys are plain strings, not a closed union - Plugin-provided
// Services can define their own (3.9: e.g. "currency:read"), and Core adds
// new ones as new PluginContext capabilities appear. No registry enforces
// "valid" keys yet; a typo just means "never granted."
export interface PluginPermissions {
  required?: string[] | undefined
  optional?: string[] | undefined
}

// NOT a security sandbox (3.14): this only gates what a Plugin can do
// through the official PluginContext API. A Plugin running in the same
// Node.js process can still `import fs from 'node:fs'` directly - real
// isolation needs a separate process/worker/container, which doesn't exist
// yet. Don't let this type's existence imply otherwise.
//
// CLAUDE.md 3.12 describes Principal as PluginPrincipal | UserPrincipal |
// SystemPrincipal, but only PluginPrincipal has an actual caller this round -
// nothing constructs a call on behalf of a Dashboard user or Core itself yet.
// Add UserPrincipal/SystemPrincipal when real code needs to build one, not
// before (an unused union variant is dead shape, same reasoning as why
// PluginManifest only has the fields Runtime actually processes).
export interface PluginPrincipal {
  type: 'plugin'
  pluginId: string
}

export type Principal = PluginPrincipal

export class PermissionDeniedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PermissionDeniedError'
  }
}
