const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type Wallet = {
  currency: string
  balance: number
}

export type Viewer = {
  id: string
  displayName: string | null
  firstSeenAt: string
  lastMessageAt: string | null
  wallets: Wallet[]
}

export async function fetchViewers(): Promise<Viewer[]> {
  const response = await fetch(`${API_URL}/viewers`)
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.json() as Promise<Viewer[]>
}
