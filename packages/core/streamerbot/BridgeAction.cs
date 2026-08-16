// Streamer.kit CPH Bridge Action
// ================================
// This is NOT part of the pnpm/tsc build - it's the Streamer.bot-side half of
// packages/core/src/actions/bridge.ts (CLAUDE.md Part 2.4).
//
// Setup:
//   1. In Streamer.bot, create a new Action (suggested name: "Streamer.kit Bridge").
//   2. Add one sub-action to it: Core > C# > Execute C# Code.
//   3. Paste this whole file into the code editor, then Compile/Save.
//   4. Copy the Action's exact name (whatever you named it in step 1) into
//      your .env as STREAMERBOT_BRIDGE_ACTION_NAME. Streamer.bot resolves
//      DoAction by name server-side, so no GUID copying needed - but the
//      name must match exactly (rename the Action -> update the env var too).
//   5. Runtime calls DoAction({ name: bridgeActionName }, { operation, ...flatArgs })
//      - this code reads "operation" plus whatever operation-specific args
//      came with it and dispatches to the matching CPH call below.
//
// Adding a new operation: add a case here AND a matching entry in
// BridgeOperationArgs (packages/core/src/actions/bridge.ts). Keep the two in
// sync - this switch is the runtime enforcement of the versioned contract
// that TypeScript only enforces at compile time. Each handler stays an
// explicit, individually-readable method (not a reflection/table-driven
// dispatcher) - RequireArg() below only removes the repetitive "fetch +
// validate + log" boilerplate, not the per-operation explicitness.

using System;

public class CPHInline
{
    public bool Execute()
    {
        if (!RequireArg("operation", out string operation)) return false;

        switch (operation)
        {
            case "obs.scene.set":
                return HandleObsSceneSet();
            case "obs.source.visibility":
                return HandleObsSourceVisibility();
            default:
                CPH.LogWarn($"[Bridge] Unknown operation: {operation}");
                return false;
        }
    }

    private bool HandleObsSceneSet()
    {
        if (!RequireArg("sceneName", out string sceneName)) return false;

        CPH.ObsSetScene(sceneName);
        return true;
    }

    private bool HandleObsSourceVisibility()
    {
        if (!RequireArg("sceneName", out string sceneName)) return false;
        if (!RequireArg("sourceName", out string sourceName)) return false;
        if (!RequireArg("visible", out bool visible)) return false;

        CPH.ObsSetSourceVisibility(sceneName, sourceName, visible);
        return true;
    }

    // Fetches a required arg and logs+fails clearly if it's missing, of the
    // wrong type (TryGetArg itself returns false), or an empty string.
    private bool RequireArg<T>(string name, out T value)
    {
        if (!CPH.TryGetArg(name, out value))
        {
            CPH.LogWarn($"[Bridge] Missing or wrong-typed required arg '{name}'");
            return false;
        }

        if (value is string str && string.IsNullOrEmpty(str))
        {
            CPH.LogWarn($"[Bridge] Required arg '{name}' is empty");
            return false;
        }

        return true;
    }
}
