import {
  loadReports,
  loadResources,
  loadUnits,
  saveReports,
  saveResources,
  saveUnits,
  loadBuildings,
  type BattleReport,
  type Units,
} from "./gameSync"
import {
  emitGameUpdated,
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
} from "./gameState"

export type NpcBase = {
  id: string
  name: string
  difficulty: "easy" | "normal" | "hard"
  enemyPower: number
  rewardGold: number
  rewardIron: number
  infantryLoss: number
  sniperLoss: number
  tankLoss: number
}

export type AttackArmy = {
  infantry: number
  sniper: number
  tank: number
}

export const UNIT_POWER = {
  infantry: 6,
  sniper: 11,
  tank: 24,
} as const

export const NPC_BASES: NpcBase[] = [
  {
    id: "outpost_alpha",
    name: "알파 전초기지",
    difficulty: "easy",
    enemyPower: 18,
    rewardGold: 180,
    rewardIron: 120,
    infantryLoss: 1,
    sniperLoss: 0,
    tankLoss: 0,
  },
  {
    id: "supply_beta",
    name: "베타 보급기지",
    difficulty: "normal",
    enemyPower: 34,
    rewardGold: 360,
    rewardIron: 260,
    infantryLoss: 2,
    sniperLoss: 1,
    tankLoss: 0,
  },
  {
    id: "fortress_gamma",
    name: "감마 요새",
    difficulty: "hard",
    enemyPower: 56,
    rewardGold: 650,
    rewardIron: 480,
    infantryLoss: 3,
    sniperLoss: 1,
    tankLoss: 1,
  },
]

const ATTACK_COOLDOWN_MS = 15_000

function clampLoss(current: number, loss: number) {
  return Math.max(0, current - loss)
}

export function getSelectedArmyPower(selected: AttackArmy) {
  return (
    selected.infantry * UNIT_POWER.infantry +
    selected.sniper * UNIT_POWER.sniper +
    selected.tank * UNIT_POWER.tank
  )
}

export function getAttackCooldownRemainingMs() {
  const now = Date.now()
  const lastAttackAt = loadFromStorage<number>(STORAGE_KEYS.lastAttackAt, 0)
  return Math.max(0, lastAttackAt + ATTACK_COOLDOWN_MS - now)
}

export function getAttackSlotLimit(barracksLevel: number) {
  if (barracksLevel >= 5) return 3
  if (barracksLevel >= 3) return 2
  return 1
}

export function getArmySelectionCap(barracksLevel: number) {
  const slotLimit = getAttackSlotLimit(barracksLevel)
  if (slotLimit === 1) return 12
  if (slotLimit === 2) return 24
  return 40
}

export function attackNpcBase(baseId: string, selectedArmy: AttackArmy) {
  const base = NPC_BASES.find((item) => item.id === baseId)

  if (!base) {
    throw new Error("대상 기지를 찾을 수 없습니다.")
  }

  const cooldownRemain = getAttackCooldownRemainingMs()
  if (cooldownRemain > 0) {
    throw new Error(`공격 대기 중입니다. ${Math.ceil(cooldownRemain / 1000)}초 후 다시 시도하세요.`)
  }

  const units = loadUnits()
  const resources = loadResources()
  const reports = loadReports()
  const buildings = loadBuildings()

  if (
    selectedArmy.infantry < 0 ||
    selectedArmy.sniper < 0 ||
    selectedArmy.tank < 0
  ) {
    throw new Error("잘못된 출정 병력입니다.")
  }

  if (
    selectedArmy.infantry > units.infantry ||
    selectedArmy.sniper > units.sniper ||
    selectedArmy.tank > units.tank
  ) {
    throw new Error("보유 병력을 초과했습니다.")
  }

  const totalSelected =
    selectedArmy.infantry + selectedArmy.sniper + selectedArmy.tank

  if (totalSelected <= 0) {
    throw new Error("출정 병력을 선택하세요.")
  }

  const cap = getArmySelectionCap(buildings.barracks)
  if (totalSelected > cap) {
    throw new Error(`병영 레벨 제한으로 한 번에 ${cap}기까지만 출정할 수 있습니다.`)
  }

  const fuelCost =
    20 +
    base.enemyPower +
    selectedArmy.infantry * 1 +
    selectedArmy.sniper * 2 +
    selectedArmy.tank * 4

  if (resources.fuel < fuelCost) {
    throw new Error("연료가 부족합니다.")
  }

  const playerPower = getSelectedArmyPower(selectedArmy)
  const variance = Math.floor(Math.random() * 10) - 4
  const finalPower = playerPower + variance
  const isWin = finalPower >= base.enemyPower

  let nextUnits: Units = { ...units }
  let nextResources = {
    ...resources,
    fuel: resources.fuel - fuelCost,
  }

  let lossInfantry = 0
  let lossSniper = 0
  let lossTank = 0

  if (isWin) {
    lossInfantry = Math.min(selectedArmy.infantry, base.infantryLoss)
    lossSniper = Math.min(selectedArmy.sniper, base.sniperLoss)
    lossTank = Math.min(selectedArmy.tank, base.tankLoss)

    nextResources = {
      gold: resources.gold + base.rewardGold,
      iron: resources.iron + base.rewardIron,
      fuel: resources.fuel - fuelCost,
    }
  } else {
    lossInfantry = Math.min(selectedArmy.infantry, base.infantryLoss + 1)
    lossSniper = Math.min(selectedArmy.sniper, base.sniperLoss + 1)
    lossTank = Math.min(selectedArmy.tank, base.tankLoss + 1)
  }

  nextUnits = {
    infantry: clampLoss(units.infantry, lossInfantry),
    sniper: clampLoss(units.sniper, lossSniper),
    tank: clampLoss(units.tank, lossTank),
  }

  const report: BattleReport = {
    id: `battle_${Date.now()}`,
    title: base.name,
    result: isWin ? "win" : "lose",
    rewardGold: isWin ? base.rewardGold : 0,
    rewardIron: isWin ? base.rewardIron : 0,
    fuelUsed: fuelCost,
    lossInfantry,
    lossSniper,
    lossTank,
    createdAt: Date.now(),
  }

  saveUnits(nextUnits)
  saveResources(nextResources)
  saveReports([report, ...reports])
  saveToStorage(STORAGE_KEYS.lastAttackAt, Date.now())

  emitGameUpdated()

  return {
    base,
    result: report,
    nextUnits,
    nextResources,
    selectedArmy,
    playerPower,
  }
}