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
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            Tactical Strategy Prototype
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl">
            WAR FRONT:
            <span className="block text-blue-400">CRISIS</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            기지를 키우고, 병력을 훈련하고, 적 거점을 정찰해 자원을 빼앗는
            워크라이시스 감성의 전략 게임 프로토타입.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/base"
              className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
            >
              기지로 이동
            </Link>
            <Link
              href="/map"
              className="rounded-2xl bg-zinc-800 px-5 py-3 font-semibold transition hover:bg-zinc-700"
            >
              월드맵 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {menuCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group rounded-3xl border ${card.border} bg-gradient-to-b ${card.accent} p-6 transition hover:-translate-y-1 hover:border-zinc-500`}
            >
              <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">
                {card.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight">
                {card.title}
              </h2>
              <p className="mt-4 leading-7 text-zinc-300">{card.desc}</p>

              <div className="mt-8 inline-flex items-center rounded-xl bg-zinc-900/80 px-4 py-2 text-sm font-semibold text-zinc-200 transition group-hover:bg-zinc-800">
                열기 →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}