export type BuildingType = 'gold_mine' | 'oil_refinery' | 'steel_factory'

export type Buildings = {
  gold_mine: number
  oil_refinery: number
  steel_factory: number
}

export const defaultBuildings: Buildings = {
  gold_mine: 1,
  oil_refinery: 1,
  steel_factory: 1,
}

export const BUILDING_COST = {
  gold_mine: (level: number) => ({
    gold: 200 * level,
    fuel: 50 * level,
    steel: 100 * level,
  }),
  oil_refinery: (level: number) => ({
    gold: 150 * level,
    fuel: 80 * level,
    steel: 100 * level,
  }),
  steel_factory: (level: number) => ({
    gold: 180 * level,
    fuel: 60 * level,
    steel: 120 * level,
  }),
}