import {
  loadBuildings,
  loadResources,
  loadTrainingQueues,
  saveResources,
  saveTrainingQueues,
  type BuildingType,
  type UnitType,
} from "./gameSync"
import {
  emitGameUpdated,
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
} from "./gameState"

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function startUnitTraining(params: {
  unitType: UnitType
  amount: number
  costGold: number
  costIron: number
  costFuel: number
  durationMs: number
}) {
  const { unitType, amount, costGold, costIron, costFuel, durationMs } = params

  const resources = loadResources()
  const training = loadTrainingQueues()
  const now = Date.now()

  if (
    resources.gold < costGold ||
    resources.iron < costIron ||
    resources.fuel < costFuel
  ) {
    throw new Error("자원이 부족합니다.")
  }

  const nextResources = {
    gold: resources.gold - costGold,
    iron: resources.iron - costIron,
    fuel: resources.fuel - costFuel,
  }

  const nextTraining = {
    ...training,
    training: [
      ...training.training,
      {
        id: uid(),
        unitType,
        amount,
        startedAt: now,
        endsAt: now + durationMs,
      },
    ],
  }

  saveResources(nextResources)
  saveTrainingQueues(nextTraining)
  emitGameUpdated()
}

export function startBuildingUpgrade(params: {
  buildingType: BuildingType
  costGold: number
  costIron: number
  durationMs: number
}) {
  const { buildingType, costGold, costIron, durationMs } = params

  const resources = loadResources()
  const buildings = loadBuildings()
  const training = loadTrainingQueues()
  const now = Date.now()

  if (resources.gold < costGold || resources.iron < costIron) {
    throw new Error("자원이 부족합니다.")
  }

  const currentLevel = buildings[buildingType]
  const targetLevel = currentLevel + 1

  const alreadyUpgrading = training.upgrades.some(
    (item) => item.buildingType === buildingType
  )

  if (alreadyUpgrading) {
    throw new Error("이미 업그레이드 중입니다.")
  }

  const nextResources = {
    ...resources,
    gold: resources.gold - costGold,
    iron: resources.iron - costIron,
  }

  const nextTraining = {
    ...training,
    upgrades: [
      ...training.upgrades,
      {
        id: uid(),
        buildingType,
        targetLevel,
        startedAt: now,
        endsAt: now + durationMs,
      },
    ],
  }

  saveResources(nextResources)
  saveTrainingQueues(nextTraining)
  emitGameUpdated()
}

export function claimEmergencySupply() {
  const now = Date.now()
  const lastSupplyAt = loadFromStorage<number>(STORAGE_KEYS.lastSupplyAt, 0)
  const cooldownMs = 60_000

  if (now - lastSupplyAt < cooldownMs) {
    const remainSec = Math.ceil((cooldownMs - (now - lastSupplyAt)) / 1000)
    throw new Error(`보급 대기 중입니다. ${remainSec}초 후 다시 시도하세요.`)
  }

  const resources = loadResources()
  const buildings = loadBuildings()

  const bonusGold = 200 + buildings.hq * 40
  const bonusIron = 160 + buildings.ironMine * 35
  const bonusFuel = 120 + buildings.refinery * 25

  const nextResources = {
    gold: resources.gold + bonusGold,
    iron: resources.iron + bonusIron,
    fuel: resources.fuel + bonusFuel,
  }

  saveResources(nextResources)
  saveToStorage(STORAGE_KEYS.lastSupplyAt, now)
  emitGameUpdated()

  return {
    gold: bonusGold,
    iron: bonusIron,
    fuel: bonusFuel,
    nextAvailableAt: now + cooldownMs,
  }
}

export function getEmergencySupplyRemainingMs() {
  const now = Date.now()
  const lastSupplyAt = loadFromStorage<number>(STORAGE_KEYS.lastSupplyAt, 0)
  const cooldownMs = 60_000
  return Math.max(0, lastSupplyAt + cooldownMs - now)
}