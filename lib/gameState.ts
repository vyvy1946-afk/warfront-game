export const STORAGE_KEYS = {
  resources: "wf_resources",
  units: "wf_units",
  buildings: "wf_buildings",
  training: "wf_training",
  reports: "wf_reports",
  lastSyncAt: "wf_last_sync_at",
  lastSupplyAt: "wf_last_supply_at",
  lastAttackAt: "wf_last_attack_at",
} as const

export const GAME_UPDATED_EVENT = "wf:updated"

export function emitGameUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(GAME_UPDATED_EVENT))
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

export function clearAllGameData() {
  if (typeof window === "undefined") return

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })

  emitGameUpdated()
}