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

const RESOURCES_KEY = 'wf_resources'
const UNITS_KEY = 'wf_units'
const BUILDINGS_KEY = 'wf_buildings'

export function loadResources(): Resources {
  if (typeof window === 'undefined') return defaultResources

  const saved = localStorage.getItem(RESOURCES_KEY)
  if (!saved) return defaultResources

  try {
    return JSON.parse(saved)
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
    return JSON.parse(saved)
  } catch {
    return defaultUnits
  }
}

export function saveUnits(units: Units) {
  if (typeof window === 'undefined') return
  localStorage.setItem(UNITS_KEY, JSON.stringify(units))
}

export function loadBuildings(): Buildings {
  if (typeof window === 'undefined') return defaultBuildings

  const saved = localStorage.getItem(BUILDINGS_KEY)
  if (!saved) return defaultBuildings

  try {
    return JSON.parse(saved)
  } catch {
    return defaultBuildings
  }
}

export function saveBuildings(buildings: Buildings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(BUILDINGS_KEY, JSON.stringify(buildings))
}