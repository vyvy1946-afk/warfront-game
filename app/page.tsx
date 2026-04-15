'use client'

import Link from 'next/link'
import GameHeader from '../components/GameHeader'

const menuCards = [
  {
    href: '/base',
    eyebrow: 'Base Control',
    title: '기지 관리',
    desc: '자원 생산, 병력 훈련, 건물 업그레이드를 관리합니다.',
    accent: 'from-blue-500/20 to-zinc-900',
    border: 'border-blue-500/20',
  },
  {
    href: '/map',
    eyebrow: 'World Operation',
    title: '월드맵',
    desc: '정찰한 NPC 기지를 공격하고 자원을 약탈합니다.',
    accent: 'from-red-500/20 to-zinc-900',
    border: 'border-red-500/20',
  },
  {
    href: '/reports',
    eyebrow: 'Combat Archive',
    title: '보고서',
    desc: '전투 기록과 전리품 결과를 확인합니다.',
    accent: 'from-emerald-500/20 to-zinc-900',
    border: 'border-emerald-500/20',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <GameHeader />

      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.16),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-400 sm:text-sm sm:tracking-[0.3em]">
            Tactical Strategy Prototype
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            WAR FRONT:
            <span className="block text-blue-400">CRISIS</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
            기지를 키우고, 병력을 훈련하고, 적 거점을 정찰해 자원을 빼앗는
            워크라이시스 감성의 전략 게임 프로토타입.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
            <Link
              href="/base"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-center font-semibold transition hover:bg-blue-500"
            >
              기지로 이동
            </Link>
            <Link
              href="/map"
              className="rounded-2xl bg-zinc-800 px-5 py-3 text-center font-semibold transition hover:bg-zinc-700"
            >
              월드맵 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {menuCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group rounded-3xl border ${card.border} bg-gradient-to-b ${card.accent} p-5 transition hover:-translate-y-1 hover:border-zinc-500 sm:p-6`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 sm:text-sm sm:tracking-[0.25em]">
                {card.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:mt-4 sm:text-3xl">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300 sm:mt-4 sm:text-base sm:leading-7">
                {card.desc}
              </p>

              <div className="mt-6 inline-flex items-center rounded-xl bg-zinc-900/80 px-4 py-2 text-sm font-semibold text-zinc-200 transition group-hover:bg-zinc-800 sm:mt-8">
                열기 →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}