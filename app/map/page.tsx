"use client"

import { useMemo, useState } from "react"
import {
  Coins,
  Factory,
  Fuel,
  Users,
  ShieldAlert,
  Trophy,
  Siren,
  Crosshair,
  Minus,
  Plus,
  TimerReset,
} from "lucide-react"
import { useGameSync } from "../../lib/useGameSync"
import {
  NPC_BASES,
  attackNpcBase,
  getAttackCooldownRemainingMs,
  getAttackSlotLimit,
  getArmySelectionCap,
  type AttackArmy,
  UNIT_POWER,
} from "../../lib/battle"
import { useToast } from "../../components/ToastProvider"

type LastBattleStatus = {
  title: string
  result: "win" | "lose"
  rewardGold: number
  rewardIron: number
  fuelUsed: number
  lossInfantry: number
  lossSniper: number
  lossTank: number
} | null

const initialArmy: AttackArmy = {
  infantry: 0,
  sniper: 0,
  tank: 0,
}

export default function MapPage() {
  const { resources, units, buildings, training, refresh, isHydrated } =
    useGameSync()
  const { showToast } = useToast()
  const [lastBattle, setLastBattle] = useState<LastBattleStatus>(null)
  const [selectedArmy, setSelectedArmy] = useState<AttackArmy>(initialArmy)

  const playerPower = useMemo(() => {
    return (
      units.infantry * UNIT_POWER.infantry +
      units.sniper * UNIT_POWER.sniper +
      units.tank * UNIT_POWER.tank
    )
  }, [units])

  const selectedPower = useMemo(() => {
    return (
      selectedArmy.infantry * UNIT_POWER.infantry +
      selectedArmy.sniper * UNIT_POWER.sniper +
      selectedArmy.tank * UNIT_POWER.tank
    )
  }, [selectedArmy])

  const cooldownRemainSec = useMemo(() => {
    return Math.ceil(getAttackCooldownRemainingMs() / 1000)
  }, [resources, units, training])

  const slotLimit = useMemo(() => {
    return getAttackSlotLimit(buildings.barracks)
  }, [buildings.barracks])

  const armyCap = useMemo(() => {
    return getArmySelectionCap(buildings.barracks)
  }, [buildings.barracks])

  const selectedCount = useMemo(() => {
    return selectedArmy.infantry + selectedArmy.sniper + selectedArmy.tank
  }, [selectedArmy])

  const updateArmy = (
    type: keyof AttackArmy,
    delta: number,
    max: number
  ) => {
    setSelectedArmy((prev) => {
      const current = prev[type]
      const nextValue = Math.max(0, Math.min(max, current + delta))
      const candidate = { ...prev, [type]: nextValue }
      const total =
        candidate.infantry + candidate.sniper + candidate.tank

      if (total > armyCap) return prev
      return candidate
    })
  }

  const resetArmy = () => {
    setSelectedArmy(initialArmy)
  }

  const handleAttack = (baseId: string) => {
    try {
      const battle = attackNpcBase(baseId, selectedArmy)
      refresh()

      setLastBattle({
        title: battle.base.name,
        result: battle.result.result,
        rewardGold: battle.result.rewardGold,
        rewardIron: battle.result.rewardIron,
        fuelUsed: battle.result.fuelUsed,
        lossInfantry: battle.result.lossInfantry,
        lossSniper: battle.result.lossSniper,
        lossTank: battle.result.lossTank,
      })

      setSelectedArmy(initialArmy)

      showToast(
        battle.result.result === "win"
          ? `${battle.base.name} 공격 성공`
          : `${battle.base.name} 공격 실패`,
        battle.result.result === "win" ? "success" : "error"
      )
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "공격 실패",
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
      <section className="rounded-[30px] border border-red-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.18),_transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6">
        <div className="mb-3 text-xs tracking-[0.35em] text-white/45">
          WORLD OPERATION
        </div>
        <h1 className="text-4xl font-black">월드맵</h1>
        <p className="mt-4 text-lg text-white/72">
          출정 병력을 선택하고 NPC 기지를 공격합니다.
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
            병력 현황
          </div>
          <div className="mt-2 text-xl font-black">
            {units.infantry} / {units.sniper} / {units.tank}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-cyan-500/15 bg-cyan-500/[0.05] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-cyan-200" />
            <h2 className="text-2xl font-black">출정 병력 선택</h2>
          </div>

          <button
            onClick={resetArmy}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white"
          >
            초기화
          </button>
        </div>

        <div className="mb-4 rounded-[20px] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/75">
          병영 레벨 {buildings.barracks} · 출정 슬롯 {slotLimit}개 · 한 번에 최대 {armyCap}기 출정 가능
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <ArmySelector
            label="보병"
            value={selectedArmy.infantry}
            max={units.infantry}
            power={UNIT_POWER.infantry}
            onMinus={() => updateArmy("infantry", -1, units.infantry)}
            onPlus={() => updateArmy("infantry", 1, units.infantry)}
          />
          <ArmySelector
            label="저격수"
            value={selectedArmy.sniper}
            max={units.sniper}
            power={UNIT_POWER.sniper}
            onMinus={() => updateArmy("sniper", -1, units.sniper)}
            onPlus={() => updateArmy("sniper", 1, units.sniper)}
          />
          <ArmySelector
            label="탱크"
            value={selectedArmy.tank}
            max={units.tank}
            power={UNIT_POWER.tank}
            onMinus={() => updateArmy("tank", -1, units.tank)}
            onPlus={() => updateArmy("tank", 1, units.tank)}
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm text-white/60">선택 병력 수</div>
            <div className="mt-2 text-3xl font-black">{selectedCount}</div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm text-white/60">출정 전투력</div>
            <div className="mt-2 text-3xl font-black">{selectedPower}</div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm text-white/60">전체 전투력</div>
            <div className="mt-2 text-3xl font-black">{playerPower}</div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <TimerReset className="h-4 w-4" />
              공격 대기시간
            </div>
            <div className="mt-2 text-3xl font-black">
              {cooldownRemainSec > 0 ? `${cooldownRemainSec}초` : "즉시 가능"}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Crosshair className="h-5 w-5 text-white/80" />
          <h2 className="text-2xl font-black">전장 현황</h2>
        </div>
        <div className="space-y-2 text-white/75">
          <div>훈련 중: {training.training.length}건</div>
          <div>업그레이드 중: {training.upgrades.length}건</div>
          <div>병영 레벨: {buildings.barracks}</div>
        </div>

        {lastBattle && (
          <div
            className={`mt-4 rounded-[20px] border p-4 ${
              lastBattle.result === "win"
                ? "border-emerald-500/20 bg-emerald-500/10"
                : "border-red-500/20 bg-red-500/10"
            }`}
          >
            <div className="flex items-center gap-2 text-lg font-black">
              {lastBattle.result === "win" ? (
                <Trophy className="h-5 w-5 text-emerald-200" />
              ) : (
                <Siren className="h-5 w-5 text-red-200" />
              )}
              최근 공격 결과: {lastBattle.title}
            </div>
            <div className="mt-2">
              결과: {lastBattle.result === "win" ? "공격 성공" : "공격 실패"}
            </div>
            <div className="mt-1">
              이득: 금화 +{lastBattle.rewardGold} / 은화 +{lastBattle.rewardIron}
            </div>
            <div className="mt-1">소모: 연료 -{lastBattle.fuelUsed}</div>
            <div className="mt-1">
              피해: 보병 -{lastBattle.lossInfantry} / 저격수 -{lastBattle.lossSniper} / 탱크 -{lastBattle.lossTank}
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 space-y-4">
        {NPC_BASES.map((base) => {
          const fuelCost =
            20 +
            base.enemyPower +
            selectedArmy.infantry * 1 +
            selectedArmy.sniper * 2 +
            selectedArmy.tank * 4

          const disabled =
            cooldownRemainSec > 0 ||
            selectedPower <= 0 ||
            resources.fuel < fuelCost

          return (
            <div
              key={base.id}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-2xl font-black">
                    <ShieldAlert className="h-6 w-6 text-red-200" />
                    {base.name}
                    <DifficultyBadge difficulty={base.difficulty} />
                  </div>
                  <div className="mt-2 text-white/70">
                    적 전투력: {base.enemyPower}
                  </div>
                  <div className="mt-1 text-white/70">
                    보상: 금화 +{base.rewardGold}, 은화 +{base.rewardIron}
                  </div>
                  <div className="mt-1 text-white/70">
                    예상 연료 소모: {fuelCost}
                  </div>
                  <div className="mt-1 text-white/70">
                    예상 피해: 보병 {base.infantryLoss} / 저격수 {base.sniperLoss} / 탱크 {base.tankLoss}
                  </div>
                </div>

                <button
                  onClick={() => handleAttack(base.id)}
                  disabled={disabled}
                  className={`rounded-[18px] px-5 py-4 font-bold text-white transition ${
                    disabled
                      ? "cursor-not-allowed bg-white/10 text-white/40"
                      : "bg-red-600 hover:bg-red-500"
                  }`}
                >
                  {cooldownRemainSec > 0
                    ? `대기 ${cooldownRemainSec}초`
                    : selectedPower <= 0
                    ? "병력 선택 필요"
                    : resources.fuel < fuelCost
                    ? "연료 부족"
                    : "공격"}
                </button>
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}

function ArmySelector({
  label,
  value,
  max,
  power,
  onMinus,
  onPlus,
}: {
  label: string
  value: number
  max: number
  power: number
  onMinus: () => void
  onPlus: () => void
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-1 text-xs text-white/45">개별 전투력 {power}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
      <div className="mt-1 text-sm text-white/50">최대 {max}</div>
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={onMinus}
          className="rounded-xl bg-white/10 p-3 text-white"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={onPlus}
          className="rounded-xl bg-white/10 p-3 text-white"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function DifficultyBadge({
  difficulty,
}: {
  difficulty: "easy" | "normal" | "hard"
}) {
  const styles =
    difficulty === "easy"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/20"
      : difficulty === "normal"
      ? "bg-yellow-500/15 text-yellow-200 border-yellow-500/20"
      : "bg-red-500/15 text-red-200 border-red-500/20"

  const label =
    difficulty === "easy"
      ? "쉬움"
      : difficulty === "normal"
      ? "보통"
      : "어려움"

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${styles}`}>
      {label}
    </span>
  )
}