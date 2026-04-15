type Army = {
  infantry: number
  armored: number
  tank: number
}

const STATS = {
  infantry: { attack: 10, defense: 8 },
  armored: { attack: 22, defense: 18 },
  tank: { attack: 40, defense: 35 },
}

function getAttackPower(army: Army) {
  return (
    army.infantry * STATS.infantry.attack +
    army.armored * STATS.armored.attack +
    army.tank * STATS.tank.attack
  )
}

function getDefensePower(army: Army) {
  return (
    army.infantry * STATS.infantry.defense +
    army.armored * STATS.armored.defense +
    army.tank * STATS.tank.defense
  )
}

export function simulateBattle(attacker: Army, defender: Army) {
  const attackerBase =
    getAttackPower(attacker) * 0.7 + getDefensePower(attacker) * 0.3
  const defenderBase =
    getAttackPower(defender) * 0.7 + getDefensePower(defender) * 0.3

  const attackerRoll = attackerBase * (0.8 + Math.random() * 0.4)
  const defenderRoll = defenderBase * (0.8 + Math.random() * 0.4)

  return {
    attackerWon: attackerRoll > defenderRoll,
    attackerPower: Math.floor(attackerRoll),
    defenderPower: Math.floor(defenderRoll),
  }
}