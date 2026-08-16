import type { DoActionResponse, StreamerbotClient } from '@streamerbot/client'

// Versioned, closed contract - adding an operation means adding a line here,
// not exposing an arbitrary CPH method call. Keep it in sync with
// BridgeAction.cs (packages/core/streamerbot/BridgeAction.cs).
export interface BridgeOperationArgs {
  'obs.scene.set': { sceneName: string }
  // CPH.ObsSetSourceVisibility requires the scene the source lives in, not
  // just the source name - confirmed against docs.streamer.bot.
  'obs.source.visibility': { sceneName: string, sourceName: string, visible: boolean }
}

export type BridgeOperation = keyof BridgeOperationArgs

export const createBridgeCapability = (client: StreamerbotClient, bridgeActionName?: string) => {
  return {
    async execute<TOperation extends BridgeOperation>(
      operation: TOperation,
      args: BridgeOperationArgs[TOperation],
    ): Promise<DoActionResponse> {
      if (!bridgeActionName) {
        throw new Error(
          'Bridge Action not configured. Set STREAMERBOT_BRIDGE_ACTION_NAME once '
          + 'the Bridge Action exists in Streamer.bot.',
        )
      }

      // Streamer.bot resolves DoAction by name server-side - no need to look
      // up and hardcode the Action's GUID ourselves.
      // Flat structure per 2.6 - operation + payload merged at the top level.
      const response = await client.doAction({ name: bridgeActionName }, { operation, ...args })
      if (response.status !== 'ok') {
        const detail = 'error' in response ? String(response.error) : 'unknown error'
        throw new Error(`bridge.execute(${operation}) failed: ${detail}`)
      }
      return response
    },
  }
}
