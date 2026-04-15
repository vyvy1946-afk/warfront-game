'use client'

import { useRouter } from 'next/navigation'
import GameHeader from '../../components/GameHeader'
import { resetAllGameData } from '../../lib/storage'

export default function SettingsPage() {
  const router = useRouter()

  const handleReset = () => {
    const ok = window.confirm(
      '정말 게임 데이터를 모두 초기화할까요?\n자원, 병력, 건물, 훈련, 보고서가 전부 삭제됩니다.'
    )

    if (!ok) return

    resetAllGameData()
    alert('게임 데이터를 초기화했습니다.')
    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-white">
      <GameHeader />

      <section className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 sm:text-sm sm:tracking-[0.25em]">
            Settings
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            설정
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            게임 데이터를 관리하고 전체 초기화를 진행할 수 있습니다.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/10 to-zinc-900 p-6">
          <p className="text-sm text-red-200/80">Danger Zone</p>
          <h2 className="mt-2 text-2xl font-black">게임 초기화</h2>
          <p className="mt-3 text-zinc-300">
            현재 저장된 자원, 병력, 건물, 훈련 대기열, 보고서를 모두 삭제합니다.
          </p>

          <button
            onClick={handleReset}
            className="mt-6 rounded-2xl bg-red-600 px-5 py-3 font-bold transition hover:bg-red-500"
          >
            게임 전체 초기화
          </button>
        </div>
      </div>
    </main>
  )
}