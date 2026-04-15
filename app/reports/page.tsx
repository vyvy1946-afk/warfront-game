'use client'

import { useEffect, useMemo, useState } from 'react'
import GameHeader from '../../components/GameHeader'
import {
  loadReports,
  type BattleReport,
} from '../../lib/reports'

export default function ReportsPage() {
  const [reports, setReports] = useState<BattleReport[]>([])

  useEffect(() => {
    setReports(loadReports())
  }, [])

  const summary = useMemo(() => {
    const wins = reports.filter((report) => report.result === 'win').length
    const losses = reports.filter((report) => report.result === 'lose').length

    const totalGold = reports.reduce((sum, report) => sum + (report.reward?.gold ?? 0), 0)
    const totalFuel = reports.reduce((sum, report) => sum + (report.reward?.fuel ?? 0), 0)
    const totalSteel = reports.reduce((sum, report) => sum + (report.reward?.steel ?? 0), 0)

    return {
      total: reports.length,
      wins,
      losses,
      totalGold,
      totalFuel,
      totalSteel,
    }
  }, [reports])

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-white">
      <GameHeader />

      <section className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 sm:text-sm sm:tracking-[0.25em]">
            Combat Archive
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            보고서
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            전투 결과와 전리품을 확인하고 지난 교전 기록을 추적할 수 있습니다.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="mb-8 grid gap-3 sm:gap-4 md:grid-cols-5">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
            <p className="text-sm text-zinc-400">총 보고서</p>
            <p className="mt-2 text-2xl font-black sm:text-3xl">{summary.total}</p>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:p-5">
            <p className="text-sm text-emerald-200/80">승리</p>
            <p className="mt-2 text-2xl font-black text-emerald-300 sm:text-3xl">
              {summary.wins}
            </p>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 sm:p-5">
            <p className="text-sm text-red-200/80">패배</p>
            <p className="mt-2 text-2xl font-black text-red-300 sm:text-3xl">
              {summary.losses}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-4 sm:p-5">
            <p className="text-sm text-yellow-200/80">누적 골드</p>
            <p className="mt-2 text-2xl font-black sm:text-3xl">+{summary.totalGold}</p>
          </div>

          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-4 sm:p-5">
            <p className="text-sm text-blue-200/80">누적 연료/철강</p>
            <p className="mt-2 text-2xl font-black sm:text-3xl">
              +{summary.totalFuel + summary.totalSteel}
            </p>
          </div>
        </section>

        {reports.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-xl font-bold text-zinc-200">
              아직 전투 보고서가 없습니다.
            </p>
            <p className="mt-3 text-zinc-500">
              월드맵에서 NPC 기지를 공격하면 작전 기록이 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <section className="grid gap-5">
            {reports.map((report) => {
              const isWin = report.result === 'win'

              return (
                <article
                  key={report.id}
                  className={[
                    'rounded-3xl border p-4 sm:p-6 shadow-2xl shadow-black/20',
                    isWin
                      ? 'border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-zinc-900'
                      : 'border-red-500/20 bg-gradient-to-b from-red-500/10 to-zinc-900',
                  ].join(' ')}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">{report.createdAt}</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                        {report.title}
                      </h2>
                      <p className="mt-3 max-w-3xl whitespace-pre-line text-zinc-300">
                        {report.detail}
                      </p>
                    </div>

                    <div
                      className={[
                        'inline-flex rounded-full px-4 py-2 text-sm font-bold',
                        isWin
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-red-500/15 text-red-300',
                      ].join(' ')}
                    >
                      {isWin ? '작전 성공' : '작전 실패'}
                    </div>
                  </div>

                  {report.reward ? (
                    <div className="mt-6">
                      <p className="text-sm text-zinc-400">Loot Acquired</p>

                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                          <p className="text-sm text-yellow-200/80">골드</p>
                          <p className="mt-1 text-2xl font-black">
                            +{report.reward.gold}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                          <p className="text-sm text-blue-200/80">연료</p>
                          <p className="mt-1 text-2xl font-black">
                            +{report.reward.fuel}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4">
                          <p className="text-sm text-zinc-300">철강</p>
                          <p className="mt-1 text-2xl font-black">
                            +{report.reward.steel}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <p className="text-sm text-zinc-400">Loss Summary</p>
                      <p className="mt-2 text-zinc-300">
                        전리품 획득 없이 전투가 종료되었습니다. 병력 손실 여부를
                        기지 현황에서 확인하세요.
                      </p>
                    </div>
                  )}
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}