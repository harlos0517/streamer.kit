import type {
  SendMessageResponse,
  StreamerbotClient,
  StreamerbotPlatform,
} from '@streamerbot/client'

export interface SendChatMessageParams {
  platform: StreamerbotPlatform
  message: string
  bot?: boolean
  internal?: boolean
  replyId?: string
  broadcastId?: string
}

export const createChatCapability = (client: StreamerbotClient) => {
  return {
    async send(params: SendChatMessageParams): Promise<SendMessageResponse> {
      const { platform, message, ...options } = params
      const response = await client.sendMessage(platform, message, options)
      if (response.status !== 'ok')
        throw new Error(`chat.send failed: ${response.error ?? 'unknown error'}`)

      return response
    },
  }
}
