"use client"

import { useMemo } from "react"
import {
  Settings2,
  Trash2,
  RotateCcw,
  DatabaseZap,
  Coins,
  Factory,
  Fuel,
} from "lucide-react"
import { loadReports, saveReports, saveTrainingQueues } from "../../lib/gameSync"
import { clearAllGameData, emitGameUpdated } from "../../lib/gameState"
import { useGameSync } from "../../lib/useGameSync"
import { useToast } from "../../components/ToastProvider"

export default function SettingsPage() {
  const { resources, units, buildings, training, refresh, isHydrated } =
    useGameSync()
  const { showToast } = useToast()

  const reportCount = useMemo(
    () => loadReports().length,
    [resources, units, buildings, training]
  )

  const handleClearReports = () => {
    const ok = window.confirm("전투 보고서를 모두 삭제할까요?")
    if (!ok) return
    saveReports([])
    emitGameUpdated()
    refresh()
    showToast("보고서를 모두 삭제했습니다.", "success")
  }

  const handleClearQueues = () => {
    const ok = window.confirm("진행 중인 생산/업그레이드를 모두 취소할까요?")
    if (!ok) return
    saveTrainingQueues({ training: [], upgrades: [] })
    emitGameUpdated()
    refresh()
    showToast("진행 중인 대기열을 초기화했습니다.", "success")
  }

  const handleResetGame = () => {
    const ok = window.confirm("정말 게임 데이터를 초기화할까요?")
    if (!ok) return
    clearAllGameData()
    showToast("게임 데이터를 초기화했습니다.", "success")
    window.location.href = "/"
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
      <section className="rounded-[30px] border border-violet-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.18),_transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6">
        <div className="mb-3 text-xs tracking-[0.35em] text-white/45">
          SYSTEM CONTROL
        </div>
        <div className="flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-violet-200" />
          <h1 className="text-4xl font-black">설정</h1>
        </div>
        <p className="mt-4 text-lg text-white/72">
          저장 데이터와 진행 중인 항목을 관리합니다.
        </p>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 text-2xl font-black">현재 저장 상태</h2>
        <div className="space-y-2 text-white/75">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-300" />
            금화: {resources.gold}
          </div>
          <div className="flex items-center gap-2">
            <Factory className="h-4 w-4 text-sky-300" />
            은화: {resources.iron}
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-orange-300" />
            연료: {resources.fuel}
          </div>
          <div>보병: {units.infantry}</div>
          <div>저격수: {units.sniper}</div>
          <div>탱크: {units.tank}</div>
          <div>본부 레벨: {buildings.hq}</div>
          <div>철광소 레벨: {buildings.ironMine}</div>
          <div>정제소 레벨: {buildings.refinery}</div>
          <div>병영 레벨: {buildings.barracks}</div>
          <div>진행 중 훈련: {training.training.length}건</div>
          <div>진행 중 업그레이드: {training.upgrades.length}건</div>
          <div>보고서 수: {reportCount}건</div>
        </div>
      </section>

      <section className="mt-6 space-y-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
        <button
          onClick={handleClearReports}
          className="flex w-full items-center gap-3 rounded-[20px] bg-white/10 px-4 py-4 text-left font-bold text-white"
        >
          <Trash2 className="h-5 w-5 text-red-300" />
          보고서 전체 삭제
        </button>

        <button
          onClick={handleClearQueues}
          className="flex w-full items-center gap-3 rounded-[20px] bg-white/10 px-4 py-4 text-left font-bold text-white"
        >
          <RotateCcw className="h-5 w-5 text-yellow-300" />
          생산 / 업그레이드 대기열 초기화
        </button>

        <button
          onClick={handleResetGame}
          className="flex w-full items-center gap-3 rounded-[20px] bg-red-600 px-4 py-4 text-left font-bold text-white"
        >
          <DatabaseZap className="h-5 w-5 text-white" />
          게임 전체 초기화
        </button>
      </section>
    </main>
  )
}