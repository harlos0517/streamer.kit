import { and, eq } from 'drizzle-orm'

import type { ChatMessageEvent } from '../events/normalize.ts'
import { db } from '../persistence/client.ts'
import type { Identity, Viewer } from '../persistence/schema.ts'
import { identities, viewers } from '../persistence/schema.ts'

const platformMap: Record<ChatMessageEvent['platform'], Identity['platform']> = {
  twitch: 'twitch',
}

export async function resolveViewer(event: ChatMessageEvent): Promise<Viewer> {
  const platform = platformMap[event.platform]
  const lastMessageAt = new Date(event.timestamp)

  const identity = await db.query.identities.findFirst({
    where: and(
      eq(identities.platform, platform),
      eq(identities.platformUserId, event.platformUserId),
    ),
  })

  if (identity) {
    await db.update(identities)
      .set({ platformDisplayName: event.platformDisplayName })
      .where(eq(identities.id, identity.id))

    const [viewer] = await db.update(viewers)
      .set({ displayName: event.platformDisplayName, lastMessageAt })
      .where(eq(viewers.id, identity.viewerId))
      .returning()

    return viewer!
  }

  const [viewer] = await db.insert(viewers)
    .values({ displayName: event.platformDisplayName, lastMessageAt })
    .returning()

  await db.insert(identities).values({
    platform,
    platformUserId: event.platformUserId,
    platformDisplayName: event.platformDisplayName,
    viewerId: viewer!.id,
  })

  return viewer!
}
