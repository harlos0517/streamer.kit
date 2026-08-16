export interface PayloadBase<T = unknown> {
  timeStamp: string
  eventName: string
  data: T
}

export interface TwitchChatMessageEventData {
  user: {
    role: number
    badges: {
      name: string
      version: string
      imageUrl: string
      info: string
    }[]
    color: string // #FFFFFF
    subscribed: boolean
    subscriptionTier: string
    monthsSubscribed: number
    id: string
    login: string
    name: string
    type: string
  }
  messageId: string
  meta: {
    internal: boolean
    firstMessage: boolean
    firstMessageTimestamp: string
    returningChatter: boolean
    isHighlighted: boolean
    isMe: boolean
    isCustomReward: boolean
    isInSharedChat: boolean
    isSharedChatHost: boolean
    isFromSharedChatGuest: boolean
    createdAt: string
    isTest: boolean
  }
  anonymous: boolean
  text: string
  emotes: []
  parts: {
    type: string
    text: string
  }[]
  isReply: boolean
  broadcaster: {
    id: string
    login: string
    name: string
    type: string
  }
  isInSharedChat: boolean
  isSharedChatHost: boolean
  isFromSharedChatGuest: boolean
  createdAt: string
  isTest: boolean
}
