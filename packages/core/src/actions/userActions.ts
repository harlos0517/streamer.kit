import type { DoActionResponse, StreamerbotClient } from '@streamerbot/client'

export const createActionsCapability = (client: StreamerbotClient) => {
  const bindings = new Map<string, string>()

  return {
    // Maps a Plugin-chosen logical id to a real Streamer.bot Action id/name.
    // Runtime bootstrap calls this, not Plugin code - Plugin never sees the UUID.
    // In-memory only for now; Part 3/4 will need to persist this per-Plugin
    // (action_binding, per CLAUDE.md 4.3) once a real Plugin Runtime exists.
    bind(logicalId: string, streamerbotActionId: string): void {
      bindings.set(logicalId, streamerbotActionId)
    },

    async execute(
      logicalId: string,
      args: Record<string, unknown> = {},
    ): Promise<DoActionResponse> {
      const actionId = bindings.get(logicalId)
      if (!actionId)
        throw new Error(`No Streamer.bot Action bound to logical action "${logicalId}"`)

      const response = await client.doAction(actionId, args)
      if (response.status !== 'ok') {
        const detail = 'error' in response ? String(response.error) : 'unknown error'
        throw new Error(`actions.execute(${logicalId}) failed: ${detail}`)
      }
      return response
    },
  }
}
