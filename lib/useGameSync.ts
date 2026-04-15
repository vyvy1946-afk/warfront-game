"use client"

import { useCallback, useEffect, useState } from "react"
import {
  defaultBuildings,
  defaultResources,
  defaultTraining,
  defaultUnits,
  syncGameProgress,
  type Buildings,
  type Resources,
  type TrainingQueues,
  type Units,
} from "./gameSync"
import { GAME_UPDATED_EVENT } from "./gameState"

type Snapshot = {
  resources: Resources
  units: Units
  buildings: Buildings
  training: TrainingQueues
}

const defaultSnapshot: Snapshot = {
  resources: defaultResources,
  units: defaultUnits,
  buildings: defaultBuildings,
  training: defaultTraining,
}

export function useGameSync() {
  const [snapshot, setSnapshot] = useState<Snapshot>(defaultSnapshot)
  const [isHydrated, setIsHydrated] = useState(false)

  const refresh = useCallback(() => {
    const result = syncGameProgress()
    setSnapshot({
      resources: result.resources,
      units: result.units,
      buildings: result.buildings,
      training: result.training,
    })
  }, [])

  useEffect(() => {
    setIsHydrated(true)
    refresh()

    const onFocus = () => refresh()
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh()
    }
    const onUpdated = () => refresh()

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener(GAME_UPDATED_EVENT, onUpdated)

    const interval = window.setInterval(refresh, 1000)

    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener(GAME_UPDATED_EVENT, onUpdated)
      window.clearInterval(interval)
    }
  }, [refresh])

  return {
    ...snapshot,
    refresh,
    isHydrated,
  }
}