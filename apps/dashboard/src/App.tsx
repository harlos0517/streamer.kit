import { useEffect, useState } from 'react'

import type { Viewer } from './api.ts'
import { fetchViewers } from './api.ts'

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : '-'
}

function formatWallets(wallets: Viewer['wallets']) {
  return wallets.length
    ? wallets.map(wallet => `${wallet.balance} ${wallet.currency}`).join(', ')
    : '-'
}

export function App() {
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchViewers()
      .then(setViewers)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
  }, [])

  if (error) return <p>Failed to load viewers: {error}</p>

  return (
    <table>
      <thead>
        <tr>
          <th>Display Name</th>
          <th>First Seen</th>
          <th>Last Message</th>
          <th>Wallets</th>
        </tr>
      </thead>
      <tbody>
        {viewers.map(viewer => (
          <tr key={viewer.id}>
            <td>{viewer.displayName ?? viewer.id}</td>
            <td>{formatDate(viewer.firstSeenAt)}</td>
            <td>{formatDate(viewer.lastMessageAt)}</td>
            <td>{formatWallets(viewer.wallets)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
