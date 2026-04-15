import {
  loadBuildings,
  loadResources,
  loadTrainingQueues,
  loadUnits,
  saveBuildings,
  saveResources,
  saveTrainingQueues,
  saveUnits,
  type Buildings,
  type TrainingQueues,
  type Units,
  type Resources,
} from './storage'

type BuildingType = 'gold_mine' | 'oil_refinery' | 'steel_factory'
type UnitType = 'infantry' | 'armored' | 'tank'

export type SyncResult = {
  resources: Resources
  units: Units
  buildings: Buildings
  training: TrainingQueues
  completedTraining: Record<UnitType, number>
  completedBuildings: BuildingType[]
}

export function syncGameProgress(): SyncResult {
  const now = Date.now()

  const resources = loadResources()
  const units = loadUnits()
  const buildings = loadBuildings()
  const training = loadTrainingQueues()

  const completedTraining: Record<UnitType, number> = {
    infantry: 0,
    armored: 0,
    tank: 0,
  }

  const completedBuildings: BuildingType[] = []

  const nextBuildings: Buildings = {
    gold_mine: { ...buildings.gold_mine },
    oil_refinery: { ...buildings.oil_refinery },
    steel_factory: { ...buildings.steel_factory },
  }

  ;(['gold_mine', 'oil_refinery', 'steel_factory'] as BuildingType[]).forEach(
    (key) => {
      const building = nextBuildings[key]

      if (
        building.upgradingUntil !== null &&
        now >= building.upgradingUntil
      ) {
        nextBuildings[key] = {
          level: building.level + 1,
          upgradingUntil: null,
        }
        completedBuildings.push(key)
      }
    }
  )

  const nextTraining: TrainingQueues = {
    infantry: [...training.infantry],
    armored: [...training.armored],
    tank: [...training.tank],
  }

  const nextUnits: Units = {
    ...units,
  }

  ;(['infantry', 'armored', 'tank'] as UnitType[]).forEach((type) => {
    const remaining = nextTraining[type].filter((finishTime) => finishTime > now)
    const completed = nextTraining[type].length - remaining.length

    if (completed > 0) {
      completedTraining[type] = completed
      nextUnits[type] += completed
    }

    nextTraining[type] = remaining
  })

  saveResources(resources)
  saveUnits(nextUnits)
  saveBuildings(nextBuildings)
  saveTrainingQueues(nextTraining)

  return {
    resources,
    units: nextUnits,
    buildings: nextBuildings,
    training: nextTraining,
    completedTraining,
    completedBuildings,
  }
}