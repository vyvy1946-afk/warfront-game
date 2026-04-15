import {
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
} from "./gameState"

export type ResourceType = "gold" | "iron" | "fuel"
export type UnitType = "infantry" | "sniper" | "tank"
export type BuildingType = "hq" | "ironMine" | "refinery" | "barracks"

export type Resources = Record<ResourceType, number>
export type Units = Record<UnitType, number>
export type Buildings = Record<BuildingType, number>

export type TrainingQueueItem = {
  id: string
  unitType: UnitType
  amount: number
  startedAt: number
  endsAt: number
}

export type BuildingUpgradeQueueItem = {
  id: string
  buildingType: BuildingType
  targetLevel: number
  startedAt: number
  endsAt: number
}

export type TrainingQueues = {
  training: TrainingQueueItem[]
  upgrades: BuildingUpgradeQueueItem[]
}

export type BattleReport = {
  id: string
  title: string
  result: "win" | "lose"
  rewardGold: number
  rewardIron: number
  fuelUsed: number
  lossInfantry: number
  lossSniper: number
  lossTank: number
  createdAt: number
}

export type SyncResult = {
  resources: Resources
  units: Units
  buildings: Buildings
  training: TrainingQueues
  completedTraining: Record<UnitType, number>
  completedBuildings: BuildingType[]
}

export const defaultResources: Resources = {
  gold: 1000,
  iron: 1000,
  fuel: 500,
}

export const defaultUnits: Units = {
  infantry: 0,
  sniper: 0,
  tank: 0,
}

export const defaultBuildings: Buildings = {
  hq: 1,
  ironMine: 1,
  refinery: 1,
  barracks: 1,
}

export const defaultTraining: TrainingQueues = {
  training: [],
  upgrades: [],
}

function safeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

export function getResourceRatesPerSecond(buildings: Buildings) {
  return {
    gold: Math.max(1, safeNumber(buildings.hq, 1)) * 0.4,
    iron: Math.max(1, safeNumber(buildings.ironMine, 1)) * 0.35,
    fuel: Math.max(1, safeNumber(buildings.refinery, 1)) * 0.25,
  }
}

export function loadResources(): Resources {
  const data = loadFromStorage<Partial<Resources>>(
    STORAGE_KEYS.resources,
    defaultResources
  )

  return {
    gold: safeNumber(data?.gold, defaultResources.gold),
    iron: safeNumber(data?.iron, defaultResources.iron),
    fuel: safeNumber(data?.fuel, defaultResources.fuel),
  }
}

export function saveResources(resources: Resources) {
  saveToStorage(STORAGE_KEYS.resources, resources)
}

export function loadUnits(): Units {
  const data = loadFromStorage<Partial<Units>>(
    STORAGE_KEYS.units,
    defaultUnits
  )

  return {
    infantry: safeNumber(data?.infantry, defaultUnits.infantry),
    sniper: safeNumber(data?.sniper, defaultUnits.sniper),
    tank: safeNumber(data?.tank, defaultUnits.tank),
  }
}

export function saveUnits(units: Units) {
  saveToStorage(STORAGE_KEYS.units, units)
}

export function loadBuildings(): Buildings {
  const data = loadFromStorage<Partial<Buildings>>(
    STORAGE_KEYS.buildings,
    defaultBuildings
  )

  return {
    hq: safeNumber(data?.hq, defaultBuildings.hq),
    ironMine: safeNumber(data?.ironMine, defaultBuildings.ironMine),
    refinery: safeNumber(data?.refinery, defaultBuildings.refinery),
    barracks: safeNumber(data?.barracks, defaultBuildings.barracks),
  }
}

export function saveBuildings(buildings: Buildings) {
  saveToStorage(STORAGE_KEYS.buildings, buildings)
}

export function loadTrainingQueues(): TrainingQueues {
  const data = loadFromStorage<Partial<TrainingQueues>>(
    STORAGE_KEYS.training,
    defaultTraining
  )

  return {
    training: Array.isArray(data?.training) ? data.training : [],
    upgrades: Array.isArray(data?.upgrades) ? data.upgrades : [],
  }
}

export function saveTrainingQueues(training: TrainingQueues) {
  saveToStorage(STORAGE_KEYS.training, training)
}

export function loadReports(): BattleReport[] {
  const data = loadFromStorage<unknown[]>(STORAGE_KEYS.reports, [])
  if (!Array.isArray(data)) return []

  return data.map((item, index) => {
    const report = (item ?? {}) as Partial<BattleReport>

    return {
      id:
        typeof report.id === "string"
          ? report.id
          : `report_${index}_${Date.now()}`,
      title: typeof report.title === "string" ? report.title : "전투 보고서",
      result: report.result === "lose" ? "lose" : "win",
      rewardGold: safeNumber(report.rewardGold, 0),
      rewardIron: safeNumber(report.rewardIron, 0),
      fuelUsed: safeNumber(report.fuelUsed, 0),
      lossInfantry: safeNumber(report.lossInfantry, 0),
      lossSniper: safeNumber(report.lossSniper, 0),
      lossTank: safeNumber(report.lossTank, 0),
      createdAt: safeNumber(report.createdAt, Date.now()),
    }
  })
}

export function saveReports(reports: BattleReport[]) {
  saveToStorage(STORAGE_KEYS.reports, reports)
}

export function syncGameProgress(): SyncResult {
  const now = Date.now()

  const resources = loadResources()
  const units = loadUnits()
  const buildings = loadBuildings()
  const training = loadTrainingQueues()

  const rawLastSyncAt = loadFromStorage<number>(STORAGE_KEYS.lastSyncAt, now)
  const lastSyncAt = safeNumber(rawLastSyncAt, now)

  const elapsedSeconds = Math.max(0, Math.floor((now - lastSyncAt) / 1000))
  const rates = getResourceRatesPerSecond(buildings)

  const nextResources: Resources = {
    gold: Math.floor(resources.gold + rates.gold * elapsedSeconds),
    iron: Math.floor(resources.iron + rates.iron * elapsedSeconds),
    fuel: Math.floor(resources.fuel + rates.fuel * elapsedSeconds),
  }

  const completedTraining: Record<UnitType, number> = {
    infantry: 0,
    sniper: 0,
    tank: 0,
  }

  const remainingTraining = training.training.filter((item) => {
    if (item.endsAt <= now) {
      completedTraining[item.unitType] += item.amount
      return false
    }
    return true
  })

  const nextUnits: Units = {
    infantry: units.infantry + completedTraining.infantry,
    sniper: units.sniper + completedTraining.sniper,
    tank: units.tank + completedTraining.tank,
  }

  const completedBuildings: BuildingType[] = []
  const nextBuildings: Buildings = { ...buildings }

  const remainingUpgrades = training.upgrades.filter((item) => {
    if (item.endsAt <= now) {
      completedBuildings.push(item.buildingType)
      nextBuildings[item.buildingType] = Math.max(
        nextBuildings[item.buildingType],
        item.targetLevel
      )
      return false
    }
    return true
  })

  const nextTraining: TrainingQueues = {
    training: remainingTraining,
    upgrades: remainingUpgrades,
  }

  saveResources(nextResources)
  saveUnits(nextUnits)
  saveBuildings(nextBuildings)
  saveTrainingQueues(nextTraining)
  saveToStorage(STORAGE_KEYS.lastSyncAt, now)

  return {
    resources: nextResources,
    units: nextUnits,
    buildings: nextBuildings,
    training: nextTraining,
    completedTraining,
    completedBuildings,
  }
}