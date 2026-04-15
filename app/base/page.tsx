"use client"

import { useMemo, useState } from "react"
import {
  Coins,
  Factory,
  Fuel,
  Users,
  Swords,
  Crosshair,
  Truck,
  Building2,
  Pickaxe,
  FlaskConical,
  Shield,
  TimerReset,
  PackagePlus,
} from "lucide-react"
import { useGameSync } from "../../lib/useGameSync"
import {
  claimEmergencySupply,
  getEmergencySupplyRemainingMs,
  startBuildingUpgrade,
  startUnitTraining,
} from "../../lib/actions"
import { useToast } from "../../components/ToastProvider"

const unitLabelMap = {
  infantry: "보병",
  sniper: "저격수",
  tank: "탱크",
} as const

const buildingLabelMap = {
  hq: "본부",
  ironMine: "철광소",
  refinery: "정제소",
  barracks: "병영",
} as const

function formatSeconds(ms: number) {
  return Math.max(0, Math.ceil(ms / 1000))
}

function getBarracksTrainingMultiplier(level: number) {
  const reduced = 1 - Math.max(0, level - 1) * 0.08
  return Math.max(0.5, reduced)
}

function getReducedDuration(baseMs: number, barracksLevel: number) {
  return Math.round(baseMs * getBarracksTrainingMultiplier(barracksLevel))
}

export default function BasePage() {
  const { resources, units, buildings, training, refresh, isHydrated } =
    useGameSync()
  const { showToast } = useToast()
  const [supplyMessage, setSupplyMessage] = useState("")

  const supplyRemainSec = useMemo(() => {
    return formatSeconds(getEmergencySupplyRemainingMs())
  }, [resources, buildings, training])

  const infantryDuration = useMemo(
    () => getReducedDuration(30_000, buildings.barracks),
    [buildings.barracks]
  )
  const sniperDuration = useMemo(
    () => getReducedDuration(45_000, buildings.barracks),
    [buildings.barracks]
  )
  const tankDuration = useMemo(
    () => getReducedDuration(70_000, buildings.barracks),
    [buildings.barracks]
  )

  const barracksReductionRate = useMemo(() => {
    const multiplier = getBarracksTrainingMultiplier(buildings.barracks)
    return Math.round((1 - multiplier) * 100)
  }, [buildings.barracks])

  const handleTrain = (
    unitType: "infantry" | "sniper" | "tank",
    costGold: number,
    costIron: number,
    costFuel: number,
    durationMs: number
  ) => {
    try {
      startUnitTraining({
        unitType,
        amount: 1,
        costGold,
        costIron,
        costFuel,
        durationMs,
      })
      refresh()
      showToast(`${unitLabelMap[unitType]} 생산을 시작했습니다.`, "success")
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "훈련 시작 실패",
        "error"
      )
    }
  }

  const handleUpgrade = (
    buildingType: "hq" | "ironMine" | "refinery" | "barracks",
    costGold: number,
    costIron: number,
    durationMs: number
  ) => {
    try {
      startBuildingUpgrade({
        buildingType,
        costGold,
        costIron,
        durationMs,
      })
      refresh()
      showToast(
        `${buildingLabelMap[buildingType]} 업그레이드를 시작했습니다.`,
        "success"
      )
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "업그레이드 실패",
        "error"
      )
    }
  }

  const handleEmergencySupply = () => {
    try {
      const result = claimEmergencySupply()
      setSupplyMessage(
        `긴급 보급 도착: 금화 +${result.gold}, 은화 +${result.iron}, 연료 +${result.fuel}`
      )
      refresh()
      showToast("긴급 보급을 수령했습니다.", "success")
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "보급 요청 실패",
        "error"
      )
    }
  }

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[#05070d] px-5 py-6 text-white">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-white/60">데이터 불러오는 중...</div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#05070d] px-5 py-6 text-white">
      <section className="rounded-[30px] border border-blue-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.25),_transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <div className="mb-3 text-xs tracking-[0.35em] text-white/45">
          BASE CONTROL
        </div>
        <h1 className="text-4xl font-black">기지 관리</h1>
        <p className="mt-4 text-lg text-white/72">
          자원 생산, 병력 훈련, 건물 업그레이드를 관리합니다.
        </p>
        <p className="mt-2 text-sm text-white/55">
          자동 생산: 본부에서 금화, 철광소에서 은화, 정제소에서 연료가 시간마다 누적됩니다.
        </p>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-[24px] border border-yellow-500/20 bg-yellow-500/10 p-4">
          <div className="flex items-center gap-2 text-sm text-yellow-200/70">
            <Coins className="h-4 w-4 text-yellow-300" />
            보유 금화
          </div>
          <div className="mt-2 text-3xl font-black">{resources.gold}</div>
        </div>

        <div className="rounded-[24px] border border-sky-500/20 bg-sky-500/10 p-4">
          <div className="flex items-center gap-2 text-sm text-sky-200/70">
            <Factory className="h-4 w-4 text-sky-300" />
            보유 은화
          </div>
          <div className="mt-2 text-3xl font-black">{resources.iron}</div>
        </div>

        <div className="rounded-[24px] border border-orange-500/20 bg-orange-500/10 p-4">
          <div className="flex items-center gap-2 text-sm text-orange-200/70">
            <Fuel className="h-4 w-4 text-orange-300" />
            보유 연료
          </div>
          <div className="mt-2 text-3xl font-black">{resources.fuel}</div>
        </div>

        <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 text-sm text-emerald-200/70">
            <Users className="h-4 w-4 text-emerald-300" />
            보유 유닛
          </div>
          <div className="mt-2 text-2xl font-black">
            {units.infantry} / {units.sniper} / {units.tank}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-cyan-500/15 bg-cyan-500/[0.06] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-cyan-300" />
              <h2 className="text-2xl font-black">긴급 보급</h2>
            </div>
            <p className="mt-2 text-sm text-white/65">
              금화, 은화, 연료가 부족할 때 60초마다 추가 보급을 받을 수 있습니다.
            </p>
            {supplyMessage && (
              <div className="mt-2 text-sm text-emerald-300">{supplyMessage}</div>
            )}
          </div>

          <button
            onClick={handleEmergencySupply}
            className="rounded-[20px] bg-cyan-600 px-5 py-4 font-bold text-white transition hover:bg-cyan-500"
          >
            {supplyRemainSec > 0
              ? `보급 대기 ${supplyRemainSec}초`
              : "긴급 보급 요청"}
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black">유닛 생산</h2>
            <p className="mt-2 text-sm text-white/60">
              병영 레벨 {buildings.barracks} · 현재 생산 시간 단축 {barracksReductionRate}%
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <button
            onClick={() => handleTrain("infantry", 120, 60, 10, infantryDuration)}
            className="rounded-[22px] border border-blue-500/20 bg-blue-600 px-5 py-4 text-left font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,0.18)]"
          >
            <div className="flex items-center gap-2 text-xl">
              <UnitIcon type="infantry" />
              보병 생산
            </div>
            <div className="mt-3 text-sm text-white/80">
              필요 재화: 금화 120 / 은화 60 / 연료 10
            </div>
            <div className="mt-1 text-sm text-white/80">
              소요 시간: {formatSeconds(infantryDuration)}초
            </div>
          </button>

          <button
            onClick={() => handleTrain("sniper", 220, 140, 20, sniperDuration)}
            className="rounded-[22px] border border-violet-500/20 bg-violet-600 px-5 py-4 text-left font-bold text-white shadow-[0_10px_30px_rgba(124,58,237,0.18)]"
          >
            <div className="flex items-center gap-2 text-xl">
              <UnitIcon type="sniper" />
              저격수 생산
            </div>
            <div className="mt-3 text-sm text-white/80">
              필요 재화: 금화 220 / 은화 140 / 연료 20
            </div>
            <div className="mt-1 text-sm text-white/80">
              소요 시간: {formatSeconds(sniperDuration)}초
            </div>
          </button>

          <button
            onClick={() => handleTrain("tank", 500, 320, 40, tankDuration)}
            className="rounded-[22px] border border-emerald-500/20 bg-emerald-600 px-5 py-4 text-left font-bold text-white shadow-[0_10px_30px_rgba(5,150,105,0.18)]"
          >
            <div className="flex items-center gap-2 text-xl">
              <UnitIcon type="tank" />
              탱크 생산
            </div>
            <div className="mt-3 text-sm text-white/80">
              필요 재화: 금화 500 / 은화 320 / 연료 40
            </div>
            <div className="mt-1 text-sm text-white/80">
              소요 시간: {formatSeconds(tankDuration)}초
            </div>
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 text-2xl font-black">건물 업그레이드</h2>

        <div className="grid gap-3 md:grid-cols-4">
          <button
            onClick={() => handleUpgrade("hq", 700, 450, 90_000)}
            className="rounded-[22px] border border-red-500/20 bg-red-600 px-5 py-4 text-left font-bold text-white"
          >
            <div className="flex items-center gap-2 text-xl">
              <BuildingIcon type="hq" />
              본부 업그레이드
            </div>
            <div className="mt-3 text-sm text-white/80">현재 Lv.{buildings.hq}</div>
            <div className="mt-1 text-sm text-white/80">필요 재화: 금화 700 / 은화 450</div>
            <div className="mt-1 text-sm text-white/80">소요 시간: 90초</div>
            <div className="mt-3 text-xs text-white/70">
              효과: 금화 자동 생산량이 증가합니다.
            </div>
          </button>

          <button
            onClick={() => handleUpgrade("ironMine", 350, 220, 45_000)}
            className="rounded-[22px] border border-orange-500/20 bg-orange-600 px-5 py-4 text-left font-bold text-white"
          >
            <div className="flex items-center gap-2 text-xl">
              <BuildingIcon type="ironMine" />
              철광소 업그레이드
            </div>
            <div className="mt-3 text-sm text-white/80">현재 Lv.{buildings.ironMine}</div>
            <div className="mt-1 text-sm text-white/80">필요 재화: 금화 350 / 은화 220</div>
            <div className="mt-1 text-sm text-white/80">소요 시간: 45초</div>
            <div className="mt-3 text-xs text-white/70">
              효과: 은화 자동 생산량이 증가합니다.
            </div>
          </button>

          <button
            onClick={() => handleUpgrade("refinery", 420, 260, 55_000)}
            className="rounded-[22px] border border-cyan-500/20 bg-cyan-600 px-5 py-4 text-left font-bold text-white"
          >
            <div className="flex items-center gap-2 text-xl">
              <BuildingIcon type="refinery" />
              정제소 업그레이드
            </div>
            <div className="mt-3 text-sm text-white/80">현재 Lv.{buildings.refinery}</div>
            <div className="mt-1 text-sm text-white/80">필요 재화: 금화 420 / 은화 260</div>
            <div className="mt-1 text-sm text-white/80">소요 시간: 55초</div>
            <div className="mt-3 text-xs text-white/70">
              효과: 연료 자동 생산량이 증가합니다.
            </div>
          </button>

          <button
            onClick={() => handleUpgrade("barracks", 500, 280, 60_000)}
            className="rounded-[22px] border border-indigo-500/20 bg-indigo-600 px-5 py-4 text-left font-bold text-white"
          >
            <div className="flex items-center gap-2 text-xl">
              <BuildingIcon type="barracks" />
              병영 업그레이드
            </div>
            <div className="mt-3 text-sm text-white/80">현재 Lv.{buildings.barracks}</div>
            <div className="mt-1 text-sm text-white/80">필요 재화: 금화 500 / 은화 280</div>
            <div className="mt-1 text-sm text-white/80">소요 시간: 60초</div>
            <div className="mt-3 text-xs text-white/70">
              효과: 유닛 생산 시간이 단축됩니다.
            </div>
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center gap-2">
          <TimerReset className="h-5 w-5 text-white/75" />
          <h2 className="text-2xl font-black">진행 중</h2>
        </div>

        <div className="space-y-3">
          {training.training.map((item) => (
            <div
              key={item.id}
              className="rounded-[20px] border border-blue-500/20 bg-blue-500/10 p-4"
            >
              <div className="flex items-center gap-2 font-bold">
                <UnitIcon type={item.unitType} />
                {unitLabelMap[item.unitType]} x{item.amount}
              </div>
              <div className="mt-1 text-white/70">
                남은시간: {Math.max(0, Math.ceil((item.endsAt - Date.now()) / 1000))}초
              </div>
            </div>
          ))}

          {training.upgrades.map((item) => (
            <div
              key={item.id}
              className="rounded-[20px] border border-orange-500/20 bg-orange-500/10 p-4"
            >
              <div className="flex items-center gap-2 font-bold">
                <BuildingIcon type={item.buildingType} />
                {buildingLabelMap[item.buildingType]} → Lv.{item.targetLevel}
              </div>
              <div className="mt-1 text-white/70">
                남은시간: {Math.max(0, Math.ceil((item.endsAt - Date.now()) / 1000))}초
              </div>
            </div>
          ))}

          {training.training.length === 0 && training.upgrades.length === 0 && (
            <div className="rounded-[20px] border border-white/10 bg-black/20 p-5 text-white/55">
              현재 진행 중인 작업이 없습니다.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function BuildingIcon({ type }: { type: "hq" | "ironMine" | "refinery" | "barracks" }) {
  if (type === "hq") return <Building2 className="h-5 w-5 text-red-200" />
  if (type === "ironMine") return <Pickaxe className="h-5 w-5 text-orange-200" />
  if (type === "refinery") return <FlaskConical className="h-5 w-5 text-cyan-200" />
  return <Shield className="h-5 w-5 text-indigo-200" />
}

function UnitIcon({ type }: { type: "infantry" | "sniper" | "tank" }) {
  if (type === "infantry") return <Swords className="h-5 w-5 text-blue-200" />
  if (type === "sniper") return <Crosshair className="h-5 w-5 text-violet-200" />
  return <Truck className="h-5 w-5 text-emerald-200" />
}