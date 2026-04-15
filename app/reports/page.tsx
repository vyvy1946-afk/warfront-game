"use client"

import { useEffect, useState } from "react"
import {
  ScrollText,
  Trophy,
  CircleX,
  Coins,
  Factory,
  Fuel,
  Users,
} from "lucide-react"
import { loadReports, type BattleReport } from "../../lib/gameSync"
import { GAME_UPDATED_EVENT } from "../../lib/gameState"
import { useGameSync } from "../../lib/useGameSync"

export default function ReportsPage() {
  const { isHydrated } = useGameSync()
  const [reports, setReports] = useState<BattleReport[]>([])

  useEffect(() => {
    if (!isHydrated) return

    const refreshReports = () => setReports(loadReports())
    refreshReports()

    window.addEventListener(GAME_UPDATED_EVENT, refreshReports)
    return () => {
      window.removeEventListener(GAME_UPDATED_EVENT, refreshReports)
    }
  }, [isHydrated])

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
      <section className="rounded-[30px] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6">
        <div className="mb-3 text-xs tracking-[0.35em] text-white/45">
          COMBAT ARCHIVE
        </div>
        <h1 className="text-4xl font-black">보고서</h1>
        <p className="mt-4 text-lg text-white/72">
          전투 기록과 전리품 결과를 확인합니다.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        {reports.length === 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-white/55">
            아직 전투 보고서가 없습니다.
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center gap-2 text-xl font-black">
                <ScrollText className="h-5 w-5 text-white/85" />
                {report.title}
              </div>

              <div className="mt-3 flex items-center gap-2 text-white/75">
                {report.result === "win" ? (
                  <Trophy className="h-4 w-4 text-emerald-300" />
                ) : (
                  <CircleX className="h-4 w-4 text-red-300" />
                )}
                결과: {report.result === "win" ? "승리" : "패배"}
              </div>

              <div className="mt-2 flex items-center gap-2 text-white/75">
                <Coins className="h-4 w-4 text-yellow-300" />
                금화 획득: +{report.rewardGold}
              </div>

              <div className="mt-1 flex items-center gap-2 text-white/75">
                <Factory className="h-4 w-4 text-sky-300" />
                은화 획득: +{report.rewardIron}
              </div>

              <div className="mt-1 flex items-center gap-2 text-white/75">
                <Fuel className="h-4 w-4 text-orange-300" />
                연료 소모: -{report.fuelUsed}
              </div>

              <div className="mt-3 flex items-center gap-2 text-white/60">
                <Users className="h-4 w-4 text-white/60" />
                병력 손실
              </div>
              <div className="mt-1 text-white/75">
                보병 -{report.lossInfantry} / 저격수 -{report.lossSniper} / 탱크 -{report.lossTank}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  )
}