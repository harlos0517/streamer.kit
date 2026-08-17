import type { DatabaseAPI, EventAPI } from '@streamer-kit/plugin-sdk'
import { eq } from 'drizzle-orm'

import { checkinColumns } from './schema.ts'

// Declared independently, not imported from @streamer-kit/plugin-currency
// (5.4: Currency is a Service dependency, not an implementation import) -
// structurally compatible with the real CurrencyService.add(), same idea as
// plugin-sdk's own EventAPI/ServiceAPI being declared independently of
// Core's real EventBus/ServiceRegistry.
export interface CurrencyCapability {
  add(params: {
    viewerId: string
    currencyKey: string
    amount: number
    reason: string
    source?: string | undefined
  }): Promise<unknown>
}

export type CheckinResult =
  | { status: 'checked-in', streak: number, reward: number, checkedInAt: Date }
  | { status: 'already-checked-in', streak: number, lastCheckinAt: Date }

export interface CheckinStatus {
  checkedInToday: boolean
  lastCheckinAt: Date | null
  streak: number
}

export interface CheckinService {
  checkIn(viewerId: string): Promise<CheckinResult>
  getStatus(viewerId: string): Promise<CheckinStatus>
  getStreak(viewerId: string): Promise<number>
}

const CHECKIN_REWARD_CURRENCY_KEY = 'coin'
const CHECKIN_REWARD_AMOUNT = 20
const DAY_MS = 24 * 60 * 60 * 1000

// UTC calendar day - known simplification (no per-viewer timezone support
// yet), same category of trade-off as Currency's transfer() non-atomicity.
const toDayKey = (date: Date): string => date.toISOString().slice(0, 10)

// dayKeys must already be unique and sorted descending (most recent first).
const computeStreak = (dayKeys: string[]): number => {
  let streak = 0
  let cursor = Date.now()
  for (const day of dayKeys) {
    if (day !== toDayKey(new Date(cursor))) break
    streak++
    cursor -= DAY_MS
  }
  return streak
}

export const createCheckinService = (
  database: DatabaseAPI, events: EventAPI, currency: CurrencyCapability,
): CheckinService => {
  const checkinTable = database.table('checkin', checkinColumns)

  const history = async(viewerId: string) => {
    const rows = await database.select(checkinTable, eq(checkinTable.viewerId, viewerId))
    const dayKeys = [...new Set(rows.map(row => toDayKey(row.checkedInAt)))].sort().reverse()
    return { rows, dayKeys }
  }

  const getStatus: CheckinService['getStatus'] = async viewerId => {
    const { rows, dayKeys } = await history(viewerId)
    const lastCheckinAt = rows.length === 0
      ? null
      : rows.reduce(
        (latest, row) => row.checkedInAt > latest ? row.checkedInAt : latest, rows[0]!.checkedInAt,
      )

    return {
      checkedInToday: dayKeys[0] === toDayKey(new Date()),
      lastCheckinAt,
      streak: computeStreak(dayKeys),
    }
  }

  const getStreak: CheckinService['getStreak'] = async viewerId =>
    (await getStatus(viewerId)).streak

  const checkIn: CheckinService['checkIn'] = async viewerId => {
    const status = await getStatus(viewerId)
    if (status.checkedInToday) {
      return {
        status: 'already-checked-in', streak: status.streak, lastCheckinAt: status.lastCheckinAt!,
      }
    }

    const row = await database.insert(checkinTable, { viewerId })
    const { dayKeys } = await history(viewerId)
    const streak = computeStreak(dayKeys)

    await currency.add({
      viewerId,
      currencyKey: CHECKIN_REWARD_CURRENCY_KEY,
      amount: CHECKIN_REWARD_AMOUNT,
      reason: 'checkin',
      source: 'official.checkin',
    })

    const result: CheckinResult = {
      status: 'checked-in', streak, reward: CHECKIN_REWARD_AMOUNT, checkedInAt: row.checkedInAt,
    }
    events.emit('checkin.completed', { viewerId, ...result })
    events.emit('checkin.streakChanged', { viewerId, streak })
    return result
  }

  return { checkIn, getStatus, getStreak }
}
