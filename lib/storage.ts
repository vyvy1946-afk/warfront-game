export type Resources = {
  gold: number
  fuel: number
  steel: number
}

export type Units = {
  infantry: number
  armored: number
  tank: number
}

export type Buildings = {
  gold_mine: {
    level: number
    upgradingUntil: number | null
  }
  oil_refinery: {
    level: number
    upgradingUntil: number | null
  }
  steel_factory: {
    level: number
    upgradingUntil: number | null
  }
}

export type TrainingQueues = {
  infantry: number[]
  armored: number[]
  tank: number[]
}

export const defaultResources: Resources = {
  gold: 1000,
  fuel: 500,
  steel: 500,
}

export const defaultUnits: Units = {
  infantry: 0,
  armored: 0,
  tank: 0,
}

export const defaultBuildings: Buildings = {
  gold_mine: {
    level: 1,
    upgradingUntil: null,
  },
  oil_refinery: {
    level: 1,
    upgradingUntil: null,
  },
  steel_factory: {
    level: 1,
    upgradingUntil: null,
  },
}

export const defaultTrainingQueues: TrainingQueues = {
  infantry: [],
  armored: [],
  tank: [],
}

const RESOURCES_KEY = 'wf_resources'
const UNITS_KEY = 'wf_units'
const BUILDINGS_KEY = 'wf_buildings'
const TRAINING_KEY = 'wf_training'

export function loadResources(): Resources {
  if (typeof window === 'undefined') return defaultResources

  const saved = localStorage.getItem(RESOURCES_KEY)
  if (!saved) return defaultResources

  try {
    const parsed = JSON.parse(saved)

    return {
      gold: Number(parsed.gold) || defaultResources.gold,
      fuel: Number(parsed.fuel) || defaultResources.fuel,
      steel: Number(parsed.steel) || defaultResources.steel,
    }
  } catch {
    return defaultResources
  }
}

export function saveResources(resources: Resources) {
  if (typeof window === 'undefined') return
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources))
}

export function loadUnits(): Units {
  if (typeof window === 'undefined') return defaultUnits

  const saved = localStorage.getItem(UNITS_KEY)
  if (!saved) return defaultUnits

  try {
    const parsed = JSON.parse(saved)

    return {
      infantry: Number(parsed.infantry) || 0,
      armored: Number(parsed.armored) || 0,
      tank: Number(parsed.tank) || 0,
    }
  } catch {
    return defaultUnits
  }
}

export function saveUnits(units: Units) {
  if (typeof window === 'undefined') return
  localStorage.setItem(UNITS_KEY, JSON.stringify(units))
}

function normalizeBuildingValue(
  value: unknown
): { level: number; upgradingUntil: number | null } {
  if (typeof value === 'number') {
    return {
      level: value,
      upgradingUntil: null,
    }
  }

  if (typeof value === 'object' && value !== null) {
    const v = value as { level?: unknown; upgradingUntil?: unknown }

    return {
      level: typeof v.level === 'number' ? v.level : 1,
      upgradingUntil:
        typeof v.upgradingUntil === 'number' ? v.upgradingUntil : null,
    }
  }

  return {
    level: 1,
    upgradingUntil: null,
  }
}

export function loadBuildings(): Buildings {
  if (typeof window === 'undefined') return defaultBuildings

  const saved = localStorage.getItem(BUILDINGS_KEY)
  if (!saved) return defaultBuildings

  try {
    const parsed = JSON.parse(saved)

    return {
      gold_mine: normalizeBuildingValue(parsed.gold_mine),
      oil_refinery: normalizeBuildingValue(parsed.oil_refinery),
      steel_factory: normalizeBuildingValue(parsed.steel_factory),
    }
  } catch {
    return defaultBuildings
  }
}

export function saveBuildings(buildings: Buildings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(BUILDINGS_KEY, JSON.stringify(buildings))
}

function normalizeTrainingArray(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value.filter((v) => typeof v === 'number')
}

export function loadTrainingQueues(): TrainingQueues {
  if (typeof window === 'undefined') return defaultTrainingQueues

  const saved = localStorage.getItem(TRAINING_KEY)
  if (!saved) return defaultTrainingQueues

  try {
    const parsed = JSON.parse(saved)

    return {
      infantry: normalizeTrainingArray(parsed.infantry),
      armored: normalizeTrainingArray(parsed.armored),
      tank: normalizeTrainingArray(parsed.tank),
    }
  } catch {
    return defaultTrainingQueues
  }
}

export function saveTrainingQueues(training: TrainingQueues) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TRAINING_KEY, JSON.stringify(training))
}

export function resetAllGameData() {
  if (typeof window === 'undefined') return

  localStorage.removeItem(RESOURCES_KEY)
  localStorage.removeItem(UNITS_KEY)
  localStorage.removeItem(BUILDINGS_KEY)
  localStorage.removeItem(TRAINING_KEY)
  localStorage.removeItem('wf_reports')
}