import { PRODUCTION } from './gameConfig'
import type { Buildings } from './buildings'

export function calculateProduction(hours: number, buildings: Buildings) {
  return {
    gold: PRODUCTION.gold_mine * buildings.gold_mine * hours,
    fuel: PRODUCTION.oil_refinery * buildings.oil_refinery * hours,
    steel: PRODUCTION.steel_factory * buildings.steel_factory * hours,
  }
}