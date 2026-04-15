'use client'

import { useEffect, useState } from 'react'
import GameHeader from '../../components/GameHeader'
import { simulateBattle } from '../../lib/battle'
import {
  loadResources,
  saveResources,
  loadUnits,
  saveUnits,
  type Units,
  type Resources,
} from '../../lib/storage'
import { addReport } from '../../lib/reports'

type EnemyArmy = {
  infantry: number
  armored: number
  tank: number
}

type Toast = {
  id: number
  message: string
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

  const [enemy, setEnemy] = useState<EnemyArmy>({
    infantry: 10,
    armored: 5,
    tank: 2,
  })

  const [result, setResult] = useState<string | null>(null)
  const [detail, setDetail] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<BattleOutcome>(null)
  const [reward, setReward] = useState<BattleReward>(null)
  const [attackerPower, setAttackerPower] = useState<number | null>(null)
  const [defenderPower, setDefenderPower] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const pushToast = (message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)

    setToasts((prev) => [...prev, { id, message }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  useEffect(() => {
    setResources(loadResources())
    setUnits(loadUnits())
  }, [])

  const generateEnemy = (): EnemyArmy => {
    return {
      infantry: Math.floor(Math.random() * 11) + 6,
      armored: Math.floor(Math.random() * 6) + 2,
      tank: Math.floor(Math.random() * 4) + 1,
    }
  }

  const resetBattlePanel = () => {
    setResult(null)
    setDetail(null)
    setOutcome(null)
    setReward(null)
    setAttackerPower(null)
    setDefenderPower(null)
  }

  const handleScout = () => {
    const nextEnemy = generateEnemy()
    setEnemy(nextEnemy)
    resetBattlePanel()
    pushToast('새로운 NPC 기지를 정찰했습니다.')
  }

  const handleAttack = () => {
    const totalMyUnits = units.infantry + units.armored + units.tank

    if (totalMyUnits <= 0) {
      const msg = '병력이 없습니다! 기지에서 병력을 먼저 생산하세요.'
      alert(msg)
      pushToast('출전 가능한 병력이 없습니다.')
      return
    }

    const battle = simulateBattle(units, enemy)

    setAttackerPower(battle.attackerPower)
    setDefenderPower(battle.defenderPower)

    if (battle.attackerWon) {
      const gainedReward = {
        gold: 200,
        fuel: 120,
        steel: 100,
      }

      const nextResources = {
        gold: resources.gold + gainedReward.gold,
        fuel: resources.fuel + gainedReward.fuel,
        steel: resources.steel + gainedReward.steel,
      }

      setResources(nextResources)
      saveResources(nextResources)

      const resultText = '전투 승리'
      const detailText = `적 거점을 제압하고 자원을 성공적으로 확보했습니다.`

      setResult(resultText)
      setDetail(detailText)
      setOutcome('win')
      setReward(gainedReward)

      addReport({
        id: crypto.randomUUID(),
        title: 'NPC 기지 공격',
        result: 'win',
        detail: `내 전투력: ${battle.attackerPower} / 적 전투력: ${battle.defenderPower}`,
        reward: gainedReward,
        createdAt: new Date().toLocaleString(),
      })

      pushToast('전투 승리! 자원 약탈에 성공했습니다.')
    } else {
      const nextUnits = {
        infantry: Math.max(0, units.infantry - 2),
        armored: Math.max(0, units.armored - 1),
        tank: Math.max(0, units.tank - 1),
      }

      setUnits(nextUnits)
      saveUnits(nextUnits)

      const resultText = '전투 패배'
      const detailText = '적 방어선을 돌파하지 못했고 병력 손실이 발생했습니다.'

      setResult(resultText)
      setDetail(detailText)
      setOutcome('lose')
      setReward(null)

      addReport({
        id: crypto.randomUUID(),
        title: 'NPC 기지 공격',
        result: 'lose',
        detail: `내 전투력: ${battle.attackerPower} / 적 전투력: ${battle.defenderPower}`,
        createdAt: new Date().toLocaleString(),
      })

      pushToast('전투 패배... 병력 손실이 발생했습니다.')
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <GameHeader />

      <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-2xl border border-red-500/20 bg-zinc-900/95 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur"
          >
            <p className="text-sm font-semibold text-zinc-100">{toast.message}</p>
          </div>
        ))}
      </div>

      <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">
            World Operation
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">월드맵</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 xl:grid-cols-12">
          <section className="xl:col-span-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Deployment</p>
            <h2 className="mt-1 text-2xl font-bold">내 출전 병력</h2>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-zinc-950/80 p-4">
                <span className="text-zinc-300">보병</span>
                <span className="text-xl font-bold">{units.infantry}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-zinc-950/80 p-4">
                <span className="text-zinc-300">장갑차</span>
                <span className="text-xl font-bold">{units.armored}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-zinc-950/80 p-4">
                <span className="text-zinc-300">탱크</span>
                <span className="text-xl font-bold">{units.tank}</span>
              </div>
            </div>
          </section>

          <section className="xl:col-span-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Available Resources</p>
            <h2 className="mt-1 text-2xl font-bold">내 자원</h2>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-200/80">골드</p>
                <p className="mt-1 text-2xl font-bold">💰 {resources.gold}</p>
              </div>
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                <p className="text-sm text-blue-200/80">연료</p>
                <p className="mt-1 text-2xl font-bold">⛽ {resources.fuel}</p>
              </div>
              <div className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4">
                <p className="text-sm text-zinc-300">철강</p>
                <p className="mt-1 text-2xl font-bold">🛠 {resources.steel}</p>
              </div>
            </div>
          </section>

          <section className="xl:col-span-4 rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/10 to-zinc-900 p-6">
            <p className="text-sm text-red-200/80">Enemy Target</p>
            <h2 className="mt-1 text-2xl font-bold">정찰된 NPC 기지</h2>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-zinc-950/80 p-4">
                <span className="text-zinc-300">보병</span>
                <span className="text-xl font-bold">{enemy.infantry}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-zinc-950/80 p-4">
                <span className="text-zinc-300">장갑차</span>
                <span className="text-xl font-bold">{enemy.armored}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-zinc-950/80 p-4">
                <span className="text-zinc-300">탱크</span>
                <span className="text-xl font-bold">{enemy.tank}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleScout}
                className="rounded-2xl bg-blue-600 px-4 py-3 font-bold transition hover:bg-blue-500"
              >
                다른 NPC 찾기
              </button>

              <button
                onClick={handleAttack}
                className="rounded-2xl bg-red-600 px-4 py-3 font-bold transition hover:bg-red-500"
              >
                NPC 기지 공격
              </button>
            </div>
          </section>
        </div>

        {(result || detail) && (
          <section
            className={[
              'mt-6 rounded-3xl border p-6',
              outcome === 'win'
                ? 'border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-zinc-900'
                : 'border-red-500/20 bg-gradient-to-b from-red-500/10 to-zinc-900',
            ].join(' ')}
          >
            <p className="text-sm text-zinc-400">Battle Result</p>

            <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3
                  className={[
                    'text-3xl font-black tracking-tight',
                    outcome === 'win' ? 'text-emerald-300' : 'text-red-300',
                  ].join(' ')}
                >
                  {result}
                </h3>
                {detail && <p className="mt-3 max-w-2xl text-zinc-300">{detail}</p>}
              </div>

              <div
                className={[
                  'inline-flex rounded-full px-4 py-2 text-sm font-bold',
                  outcome === 'win'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-red-500/15 text-red-300',
                ].join(' ')}
              >
                {outcome === 'win' ? '작전 성공' : '작전 실패'}
              </div>
            </div>

            {(attackerPower !== null || defenderPower !== null) && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">내 전투력</p>
                  <p className="mt-1 text-3xl font-black">{attackerPower}</p>
                </div>
                <div className="rounded-2xl bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">적 전투력</p>
                  <p className="mt-1 text-3xl font-black">{defenderPower}</p>
                </div>
              </div>
            )}

            {reward && (
              <div className="mt-6">
                <p className="text-sm text-zinc-400">Loot Acquired</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}