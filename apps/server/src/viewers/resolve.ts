import type { Viewer } from '@streamer-kit/database'
import { Platform, prisma } from '@streamer-kit/database'

import type { ChatMessageEvent } from '@/events/normalize.ts'

const platformMap: Record<ChatMessageEvent['platform'], Platform> = {
  twitch: Platform.TWITCH,
}

export async function resolveViewer(event: ChatMessageEvent): Promise<Viewer> {
  const platform = platformMap[event.platform]
  const lastMessageAt = new Date(event.timestamp)

  const identity = await prisma.identity.findUnique({
    where: { platform_platformUserId: { platform, platformUserId: event.platformUserId } },
  })

  if (identity) {
    await prisma.identity.update({
      where: { id: identity.id },
      data: { platformDisplayName: event.platformDisplayName },
    })

    return prisma.viewer.update({
      where: { id: identity.viewerId },
      data: { displayName: event.platformDisplayName, lastMessageAt },
    })
  }

  return prisma.viewer.create({
    data: {
      displayName: event.platformDisplayName,
      lastMessageAt,
      identities: {
        create: {
          platform,
          platformUserId: event.platformUserId,
          platformDisplayName: event.platformDisplayName,
        },
      },
    },
  })
}
