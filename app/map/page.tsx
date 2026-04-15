'use client'

import { useEffect, useState } from 'react'
import GameHeader from '../../components/GameHeader'
import {
  loadResources,
  saveResources,
  loadUnits,
  saveUnits,
  type Resources,
  type Units,
} from '../../lib/storage'
import { addReport } from '../../lib/reports'

type EnemyArmy = {
  infantry: number
  armored: number
  tank: number
}

type BattleOutcome = 'win' | 'lose' | null

type BattleReward = {
  gold: number
  fuel: number
  steel: number
} | null

export default function MapPage() {
  const [resources, setResources] = useState<Resources>({
    gold: 0,
    fuel: 0,
    steel: 0,
  })

  const [units, setUnits] = useState<Units>({
    infantry: 0,
    armored: 0,
    tank: 0,
  })

  const [log, setLog] = useState('전투 준비 완료')
  const [enemy, setEnemy] = useState<EnemyArmy>({
    infantry: 8,
    armored: 3,
    tank: 1,
  })

  const [outcome, setOutcome] = useState<BattleOutcome>(null)
  const [reward, setReward] = useState<BattleReward>(null)
  const [attackerPower, setAttackerPower] = useState<number | null>(null)
  const [defenderPower, setDefenderPower] = useState<number | null>(null)

  useEffect(() => {
    setResources(loadResources())
    setUnits(loadUnits())
  }, [])

  const generateEnemy = (): EnemyArmy => {
    return {
      infantry: Math.floor(Math.random() * 12) + 4,
      armored: Math.floor(Math.random() * 6) + 1,
      tank: Math.floor(Math.random() * 4),
    }
  }

  const resetBattlePanel = () => {
    setOutcome(null)
    setReward(null)
    setAttackerPower(null)
    setDefenderPower(null)
  }

  const handleScout = () => {
    const newEnemy = generateEnemy()
    setEnemy(newEnemy)
    resetBattlePanel()
    setLog(
      `정찰 완료\n적 병력 → 보병 ${newEnemy.infantry}, 장갑차 ${newEnemy.armored}, 탱크 ${newEnemy.tank}`
    )
  }

  const handleAttack = () => {
    const totalMyUnits = units.infantry + units.armored + units.tank

    if (totalMyUnits <= 0) {
      resetBattlePanel()
      setLog('출전 가능한 병력이 없습니다. 기지에서 병력을 먼저 생산하세요.')
      return
    }

    const myPower =
      units.infantry * 1 +
      units.armored * 3 +
      units.tank * 5

    const enemyPower =
      enemy.infantry * 1 +
      enemy.armored * 3 +
      enemy.tank * 5

    const winRate = myPower / (myPower + enemyPower)
    const roll = Math.random()

    setAttackerPower(myPower)
    setDefenderPower(enemyPower)

    let nextUnits: Units = { ...units }
    let nextResources: Resources = { ...resources }

    if (roll < winRate) {
      const gainedReward = {
        gold: 100 + enemy.infantry * 10 + enemy.armored * 20 + enemy.tank * 40,
        fuel: 50 + enemy.armored * 15 + enemy.tank * 25,
        steel: 40 + enemy.tank * 30 + enemy.armored * 10,
      }

      nextUnits = {
        infantry: Math.max(
          0,
          Math.floor(units.infantry * (0.75 + Math.random() * 0.15))
        ),
        armored: Math.max(
          0,
          Math.floor(units.armored * (0.75 + Math.random() * 0.15))
        ),
        tank: Math.max(
          0,
          Math.floor(units.tank * (0.8 + Math.random() * 0.15))
        ),
      }

      nextResources = {
        gold: resources.gold + gainedReward.gold,
        fuel: resources.fuel + gainedReward.fuel,
        steel: resources.steel + gainedReward.steel,
      }

      setUnits(nextUnits)
      saveUnits(nextUnits)
      setResources(nextResources)
      saveResources(nextResources)

      setOutcome('win')
      setReward(gainedReward)

      const detailText = `적 병력 → 보병 ${enemy.infantry}, 장갑차 ${enemy.armored}, 탱크 ${enemy.tank}
내 전투력: ${myPower} / 적 전투력: ${enemyPower}
승률: ${(winRate * 100).toFixed(1)}%`

      setLog(`${detailText}

결과: 🔥 승리! 자원을 약탈했습니다.

획득 자원
골드 +${gainedReward.gold}
연료 +${gainedReward.fuel}
철강 +${gainedReward.steel}`)

      addReport({
        id: crypto.randomUUID(),
        title: 'NPC 기지 공격',
        result: 'win',
        detail: detailText,
        reward: gainedReward,
        createdAt: new Date().toLocaleString(),
      })
    } else {
      nextUnits = {
        infantry: Math.max(
          0,
          Math.floor(units.infantry * (0.35 + Math.random() * 0.2))
        ),
        armored: Math.max(
          0,
          Math.floor(units.armored * (0.35 + Math.random() * 0.2))
        ),
        tank: Math.max(
          0,
          Math.floor(units.tank * (0.4 + Math.random() * 0.2))
        ),
      }

      setUnits(nextUnits)
      saveUnits(nextUnits)

      setOutcome('lose')
      setReward(null)

      const detailText = `적 병력 → 보병 ${enemy.infantry}, 장갑차 ${enemy.armored}, 탱크 ${enemy.tank}
내 전투력: ${myPower} / 적 전투력: ${enemyPower}
승률: ${(winRate * 100).toFixed(1)}%`

      setLog(`${detailText}

결과: 💀 패배... 병력이 크게 손실되었습니다.

획득 자원 없음`)

      addReport({
        id: crypto.randomUUID(),
        title: 'NPC 기지 공격',
        result: 'lose',
        detail: detailText,
        createdAt: new Date().toLocaleString(),
      })
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <GameHeader />

      <section className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 sm:text-sm sm:tracking-[0.25em]">
            World Operation
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            월드맵
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            적 거점을 정찰하고 공격해 자원을 확보하세요.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="mb-6 grid gap-3 sm:gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-4 sm:p-5">
            <p className="text-sm text-yellow-200/80">골드</p>
            <p className="mt-2 text-2xl font-black sm:text-3xl">💰 {resources.gold}</p>
          </div>
          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-4 sm:p-5">
            <p className="text-sm text-blue-200/80">연료</p>
            <p className="mt-2 text-2xl font-black sm:text-3xl">⛽ {resources.fuel}</p>
          </div>
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900 p-4 sm:p-5">
            <p className="text-sm text-zinc-300">철강</p>
            <p className="mt-2 text-2xl font-black sm:text-3xl">🛠 {resources.steel}</p>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-12">
          <section className="xl:col-span-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
            <p className="text-sm text-zinc-400">Army Status</p>
            <h2 className="mt-1 text-2xl font-bold">내 병력</h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-zinc-950/80 p-4 flex items-center justify-between">
                <span className="text-zinc-300">보병</span>
                <span className="text-xl font-bold">{units.infantry}</span>
              </div>
              <div className="rounded-2xl bg-zinc-950/80 p-4 flex items-center justify-between">
                <span className="text-zinc-300">장갑차</span>
                <span className="text-xl font-bold">{units.armored}</span>
              </div>
              <div className="rounded-2xl bg-zinc-950/80 p-4 flex items-center justify-between">
                <span className="text-zinc-300">탱크</span>
                <span className="text-xl font-bold">{units.tank}</span>
              </div>
            </div>
          </section>

          <section className="xl:col-span-4 rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/10 to-zinc-900 p-4 sm:p-6">
            <p className="text-sm text-red-200/80">Enemy Target</p>
            <h2 className="mt-1 text-2xl font-bold">적 기지</h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-zinc-950/80 p-4 flex items-center justify-between">
                <span className="text-zinc-300">보병</span>
                <span className="text-xl font-bold">{enemy.infantry}</span>
              </div>
              <div className="rounded-2xl bg-zinc-950/80 p-4 flex items-center justify-between">
                <span className="text-zinc-300">장갑차</span>
                <span className="text-xl font-bold">{enemy.armored}</span>
              </div>
              <div className="rounded-2xl bg-zinc-950/80 p-4 flex items-center justify-between">
                <span className="text-zinc-300">탱크</span>
                <span className="text-xl font-bold">{enemy.tank}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                onClick={handleScout}
                className="rounded-2xl bg-blue-600 px-4 py-3 font-bold transition hover:bg-blue-500"
              >
                정찰하기
              </button>
              <button
                onClick={handleAttack}
                className="rounded-2xl bg-red-600 px-4 py-3 font-bold transition hover:bg-red-500"
              >
                공격하기
              </button>
            </div>
          </section>

          <section className="xl:col-span-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
            <p className="text-sm text-zinc-400">Battle Log</p>
            <h2 className="mt-1 text-2xl font-bold">전투 로그</h2>

            <div className="mt-5 whitespace-pre-line rounded-2xl bg-zinc-950/80 p-4 text-sm leading-7 text-zinc-200 min-h-[280px]">
              {log}
            </div>
          </section>
        </div>

        {(outcome || attackerPower !== null || defenderPower !== null) && (
          <section
            className={[
              'mt-6 rounded-3xl border p-4 sm:p-6',
              outcome === 'win'
                ? 'border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-zinc-900'
                : 'border-red-500/20 bg-gradient-to-b from-red-500/10 to-zinc-900',
            ].join(' ')}
          >
            <p className="text-sm text-zinc-400">Battle Result</p>
            <h3
              className={[
                'mt-2 text-2xl font-black sm:text-3xl',
                outcome === 'win' ? 'text-emerald-300' : 'text-red-300',
              ].join(' ')}
            >
              {outcome === 'win' ? '전투 승리' : '전투 패배'}
            </h3>

            {(attackerPower !== null || defenderPower !== null) && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">내 전투력</p>
                  <p className="mt-1 text-2xl font-black">{attackerPower}</p>
                </div>
                <div className="rounded-2xl bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">적 전투력</p>
                  <p className="mt-1 text-2xl font-black">{defenderPower}</p>
                </div>
              </div>
            )}

            {reward && (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                  <p className="text-sm text-yellow-200/80">골드</p>
                  <p className="mt-1 text-2xl font-black">+{reward.gold}</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <p className="text-sm text-blue-200/80">연료</p>
                  <p className="mt-1 text-2xl font-black">+{reward.fuel}</p>
                </div>
                <div className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4">
                  <p className="text-sm text-zinc-300">철강</p>
                  <p className="mt-1 text-2xl font-black">+{reward.steel}</p>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}