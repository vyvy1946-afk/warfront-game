'use client'

import { useEffect, useState } from 'react'
import GameHeader from '../../components/GameHeader'
import { RESOURCES, UNITS } from '../../lib/gameConfig'
import { calculateProduction } from '../../lib/economy'
import {
  loadResources,
  saveResources,
  loadUnits,
  saveUnits,
  loadBuildings,
  saveBuildings,
  defaultBuildings,
  type Buildings,
} from '../../lib/storage'
import { BUILDING_COST } from '../../lib/buildings'

type UnitType = 'infantry' | 'armored' | 'tank'
type BuildingType = 'gold_mine' | 'oil_refinery' | 'steel_factory'

type Toast = {
  id: number
  message: string
}

const TRAIN_TIME: Record<UnitType, number> = {
  infantry: 5000,
  armored: 10000,
  tank: 15000,
}

const UNIT_LABELS: Record<UnitType, string> = {
  infantry: '보병',
  armored: '장갑차',
  tank: '탱크',
}

const BUILDING_LABELS: Record<BuildingType, string> = {
  gold_mine: '금광',
  oil_refinery: '정유소',
  steel_factory: '제철소',
}

export default function BasePage() {
  const [resources, setResources] = useState(RESOURCES)
  const [units, setUnits] = useState({
    infantry: 0,
    armored: 0,
    tank: 0,
  })
  const [training, setTraining] = useState<{
    infantry: number[]
    armored: number[]
    tank: number[]
  }>({
    infantry: [],
    armored: [],
    tank: [],
  })
  const [buildings, setBuildings] = useState<Buildings>(defaultBuildings)
  const [loaded, setLoaded] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [toasts, setToasts] = useState<Toast[]>([])

  const pushToast = (message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)

    setToasts((prev) => [...prev, { id, message }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  useEffect(() => {
    const savedResources = loadResources()
    const savedUnits = loadUnits()
    const savedBuildings = loadBuildings()

    setResources(savedResources)
    setUnits(savedUnits)
    setBuildings(savedBuildings)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    saveResources(resources)
  }, [resources, loaded])

  useEffect(() => {
    if (!loaded) return
    saveUnits(units)
  }, [units, loaded])

  useEffect(() => {
    if (!loaded) return
    saveBuildings(buildings)
  }, [buildings, loaded])

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now()
      setNow(currentTime)

      setBuildings((prev) => {
        let changed = false

        const next: Buildings = {
          gold_mine: { ...prev.gold_mine },
          oil_refinery: { ...prev.oil_refinery },
          steel_factory: { ...prev.steel_factory },
        }

        ;(Object.keys(next) as BuildingType[]).forEach((key) => {
          const building = next[key]

          if (
            building.upgradingUntil !== null &&
            currentTime >= building.upgradingUntil
          ) {
            next[key] = {
              level: building.level + 1,
              upgradingUntil: null,
            }
            changed = true
            pushToast(`${BUILDING_LABELS[key]} 업그레이드 완료! Lv.${building.level + 1}`)
          }
        })

        return changed ? next : prev
      })

      setTraining((prev) => {
        const next = {
          infantry: [...prev.infantry],
          armored: [...prev.armored],
          tank: [...prev.tank],
        }

        let gainedInfantry = 0
        let gainedArmored = 0
        let gainedTank = 0
        let changed = false

        ;(['infantry', 'armored', 'tank'] as UnitType[]).forEach((type) => {
          const remaining = next[type].filter((finishTime) => finishTime > currentTime)
          const completed = next[type].length - remaining.length

          if (completed > 0) {
            changed = true

            if (type === 'infantry') gainedInfantry += completed
            if (type === 'armored') gainedArmored += completed
            if (type === 'tank') gainedTank += completed

            for (let i = 0; i < completed; i += 1) {
              pushToast(`${UNIT_LABELS[type]} 훈련 완료!`)
            }
          }

          next[type] = remaining
        })

        if (gainedInfantry > 0 || gainedArmored > 0 || gainedTank > 0) {
          setUnits((prevUnits) => ({
            infantry: prevUnits.infantry + gainedInfantry,
            armored: prevUnits.armored + gainedArmored,
            tank: prevUnits.tank + gainedTank,
          }))
        }

        return changed ? next : prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const productionBuildings = {
    gold_mine: buildings.gold_mine.level,
    oil_refinery: buildings.oil_refinery.level,
    steel_factory: buildings.steel_factory.level,
  }

  const handleProduction = () => {
    const gained = calculateProduction(1, productionBuildings)

    setResources((prev) => ({
      gold: prev.gold + gained.gold,
      fuel: prev.fuel + gained.fuel,
      steel: prev.steel + gained.steel,
    }))

    pushToast('자원 생산 완료!')
  }

  const trainUnit = (type: UnitType) => {
    const cost = UNITS[type].cost

    if (
      resources.gold < cost.gold ||
      resources.fuel < cost.fuel ||
      resources.steel < cost.steel
    ) {
      alert('자원이 부족합니다!')
      return
    }

    setResources((prev) => ({
      gold: prev.gold - cost.gold,
      fuel: prev.fuel - cost.fuel,
      steel: prev.steel - cost.steel,
    }))

    const finishTime = Date.now() + TRAIN_TIME[type]

    setTraining((prev) => ({
      ...prev,
      [type]: [...prev[type], finishTime],
    }))

    pushToast(`${UNIT_LABELS[type]} 훈련 시작`)
  }

  const upgradeBuilding = (type: BuildingType) => {
    const building = buildings[type]

    if (building.upgradingUntil) {
      alert('이미 업그레이드 중입니다!')
      return
    }

    const cost = BUILDING_COST[type](building.level)

    if (
      resources.gold < cost.gold ||
      resources.fuel < cost.fuel ||
      resources.steel < cost.steel
    ) {
      alert('자원이 부족합니다!')
      return
    }

    setResources((prev) => ({
      gold: prev.gold - cost.gold,
      fuel: prev.fuel - cost.fuel,
      steel: prev.steel - cost.steel,
    }))

    const finishTime = Date.now() + 10000

    setBuildings((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        upgradingUntil: finishTime,
      },
    }))

    pushToast(`${BUILDING_LABELS[type]} 업그레이드 시작`)
  }

  const resetGame = () => {
    setResources(RESOURCES)
    setUnits({
      infantry: 0,
      armored: 0,
      tank: 0,
    })
    setTraining({
      infantry: [],
      armored: [],
      tank: [],
    })
    setBuildings(defaultBuildings)
    pushToast('기지를 초기화했습니다.')
  }

  const getRemainingSeconds = (finishTime: number | null) => {
    if (!finishTime) return 0
    return Math.max(0, Math.ceil((finishTime - now) / 1000))
  }

  const getFirstTrainingSeconds = (type: UnitType) => {
    if (training[type].length === 0) return 0
    return Math.max(0, Math.ceil((training[type][0] - now) / 1000))
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <GameHeader />

      <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-2xl border border-blue-500/20 bg-zinc-900/95 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur"
          >
            <p className="text-sm font-semibold text-zinc-100">{toast.message}</p>
          </div>
        ))}
      </div>

      <section className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">
            Base Control
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">기지 관리</h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            자원을 생산하고, 병력을 훈련하고, 생산 시설을 강화해 전쟁 수행 능력을 높이세요.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5">
            <p className="text-sm text-yellow-200/80">골드</p>
            <p className="mt-2 text-3xl font-black">💰 {resources.gold}</p>
          </div>
          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
            <p className="text-sm text-blue-200/80">연료</p>
            <p className="mt-2 text-3xl font-black">⛽ {resources.fuel}</p>
          </div>
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-300">철강</p>
            <p className="mt-2 text-3xl font-black">🛠 {resources.steel}</p>
          </div>
        </section>

        <section className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={handleProduction}
            className="rounded-2xl bg-blue-600 px-5 py-3 font-bold transition hover:bg-blue-500"
          >
            1시간 생산하기
          </button>

          <button
            onClick={resetGame}
            className="rounded-2xl bg-zinc-700 px-5 py-3 font-bold transition hover:bg-zinc-600"
          >
            초기화
          </button>
        </section>

        <div className="grid gap-6 xl:grid-cols-12">
          <section className="xl:col-span-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Army Status</p>
            <h2 className="mt-1 text-2xl font-bold">병력 현황</h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-zinc-950/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">보병</span>
                  <span className="text-xl font-bold">{units.infantry}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-950/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">장갑차</span>
                  <span className="text-xl font-bold">{units.armored}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-950/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">탱크</span>
                  <span className="text-xl font-bold">{units.tank}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="mb-3 text-sm font-semibold text-zinc-300">훈련 대기열</p>
              <div className="space-y-2 text-sm text-zinc-300">
                <p>
                  보병: {training.infantry.length}
                  {training.infantry.length > 0 &&
                    ` (${getFirstTrainingSeconds('infantry')}초 남음)`}
                </p>
                <p>
                  장갑차: {training.armored.length}
                  {training.armored.length > 0 &&
                    ` (${getFirstTrainingSeconds('armored')}초 남음)`}
                </p>
                <p>
                  탱크: {training.tank.length}
                  {training.tank.length > 0 &&
                    ` (${getFirstTrainingSeconds('tank')}초 남음)`}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                onClick={() => trainUnit('infantry')}
                className="rounded-2xl bg-green-600 px-4 py-3 font-bold transition hover:bg-green-500"
              >
                보병 생산
              </button>

              <button
                onClick={() => trainUnit('armored')}
                className="rounded-2xl bg-amber-500 px-4 py-3 font-bold text-black transition hover:bg-amber-400"
              >
                장갑차 생산
              </button>

              <button
                onClick={() => trainUnit('tank')}
                className="rounded-2xl bg-red-600 px-4 py-3 font-bold transition hover:bg-red-500"
              >
                탱크 생산
              </button>
            </div>
          </section>

          <section className="xl:col-span-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Base Facilities</p>
            <h2 className="mt-1 text-2xl font-bold">건물 현황</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl border border-yellow-500/20 bg-gradient-to-b from-yellow-500/10 to-zinc-900 p-5">
                <p className="text-sm text-yellow-200/80">금광</p>
                <p className="mt-2 text-3xl font-black">
                  Lv.{buildings.gold_mine.level}
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  시간당 골드 생산 효율 증가
                </p>

                {buildings.gold_mine.upgradingUntil && (
                  <p className="mt-3 text-sm font-semibold text-yellow-300">
                    업그레이드 중...{' '}
                    {getRemainingSeconds(buildings.gold_mine.upgradingUntil)}초 남음
                  </p>
                )}

                <button
                  disabled={!!buildings.gold_mine.upgradingUntil}
                  onClick={() => upgradeBuilding('gold_mine')}
                  className="mt-5 w-full rounded-2xl bg-yellow-500 px-4 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:bg-zinc-700 disabled:text-zinc-300"
                >
                  금광 업그레이드
                </button>
              </div>

              <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-500/10 to-zinc-900 p-5">
                <p className="text-sm text-blue-200/80">정유소</p>
                <p className="mt-2 text-3xl font-black">
                  Lv.{buildings.oil_refinery.level}
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  시간당 연료 생산 효율 증가
                </p>

                {buildings.oil_refinery.upgradingUntil && (
                  <p className="mt-3 text-sm font-semibold text-blue-300">
                    업그레이드 중...{' '}
                    {getRemainingSeconds(buildings.oil_refinery.upgradingUntil)}초 남음
                  </p>
                )}

                <button
                  disabled={!!buildings.oil_refinery.upgradingUntil}
                  onClick={() => upgradeBuilding('oil_refinery')}
                  className="mt-5 w-full rounded-2xl bg-blue-500 px-4 py-3 font-bold text-white transition hover:bg-blue-400 disabled:bg-zinc-700 disabled:text-zinc-300"
                >
                  정유소 업그레이드
                </button>
              </div>

              <div className="rounded-3xl border border-zinc-700 bg-gradient-to-b from-zinc-700/20 to-zinc-900 p-5">
                <p className="text-sm text-zinc-300">제철소</p>
                <p className="mt-2 text-3xl font-black">
                  Lv.{buildings.steel_factory.level}
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  시간당 철강 생산 효율 증가
                </p>

                {buildings.steel_factory.upgradingUntil && (
                  <p className="mt-3 text-sm font-semibold text-zinc-300">
                    업그레이드 중...{' '}
                    {getRemainingSeconds(buildings.steel_factory.upgradingUntil)}초 남음
                  </p>
                )}

                <button
                  disabled={!!buildings.steel_factory.upgradingUntil}
                  onClick={() => upgradeBuilding('steel_factory')}
                  className="mt-5 w-full rounded-2xl bg-zinc-500 px-4 py-3 font-bold text-white transition hover:bg-zinc-400 disabled:bg-zinc-700 disabled:text-zinc-300"
                >
                  제철소 업그레이드
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
              <p className="text-sm text-zinc-400">Production Summary</p>
              <h3 className="mt-1 text-xl font-bold">현재 생산 효율</h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-zinc-900 p-4">
                  <p className="text-sm text-zinc-400">골드 / 1시간</p>
                  <p className="mt-1 text-2xl font-bold">
                    {100 * buildings.gold_mine.level}
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-900 p-4">
                  <p className="text-sm text-zinc-400">연료 / 1시간</p>
                  <p className="mt-1 text-2xl font-bold">
                    {60 * buildings.oil_refinery.level}
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-900 p-4">
                  <p className="text-sm text-zinc-400">철강 / 1시간</p>
                  <p className="mt-1 text-2xl font-bold">
                    {40 * buildings.steel_factory.level}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}