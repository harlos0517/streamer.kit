import type { ChatMessageEvent } from '@streamer-kit/shared'
import { and, eq } from 'drizzle-orm'

import { db } from '../persistence/client.ts'
import type { Identity, Viewer } from '../persistence/schema.ts'
import { identities, viewers } from '../persistence/schema.ts'

const platformMap: Record<ChatMessageEvent['platform'], Identity['platform']> = {
  twitch: 'twitch',
}

// Only reads these fields - narrower than the full ChatMessageEvent since
// this runs during normalization, before viewerId exists yet (it's what
// this function produces).
type ResolvableChatEvent = Pick<
  ChatMessageEvent, 'platform' | 'platformUserId' | 'platformDisplayName' | 'timestamp'
>

export const resolveViewer = async(event: ResolvableChatEvent): Promise<Viewer> => {
  const platform = platformMap[event.platform]
  const lastMessageAt = new Date(event.timestamp)

  const findIdentity = () => db.query.identities.findFirst({
    where: and(
      eq(identities.platform, platform),
      eq(identities.platformUserId, event.platformUserId),
    ),
  })

  let identity = await findIdentity()

  if (!identity) {
    const [viewer] = await db.insert(viewers)
      .values({ displayName: event.platformDisplayName, lastMessageAt })
      .returning()

    const [insertedIdentity] = await db.insert(identities)
      .values({
        platform,
        platformUserId: event.platformUserId,
        platformDisplayName: event.platformDisplayName,
        viewerId: viewer!.id,
      })
      // Defensive: resolveViewer() is only called from one place now
      // (normalize.ts, once per inbound chat.message, before it reaches the
      // Event Bus - see 1.4), so this shouldn't race in practice. Kept
      // anyway - it's what actually caused a live "duplicate key" crash
      // before resolution was centralized here, and costs nothing to keep
      // covering (e.g. a second normalizer for another platform running
      // concurrently). The loser's viewer row above is orphaned (harmless,
      // never referenced by any identity) rather than the whole call failing.
      .onConflictDoNothing({ target: [identities.platform, identities.platformUserId] })
      .returning()

    if (insertedIdentity) return viewer!

    identity = await findIdentity()
  }

  await db.update(identities)
    .set({ platformDisplayName: event.platformDisplayName })
    .where(eq(identities.id, identity!.id))

  const [viewer] = await db.update(viewers)
    .set({ displayName: event.platformDisplayName, lastMessageAt })
    .where(eq(viewers.id, identity!.viewerId))
    .returning()

  return viewer!
}

export const getViewer = async(viewerId: string): Promise<Viewer | undefined> =>
  db.query.viewers.findFirst({ where: eq(viewers.id, viewerId) })
