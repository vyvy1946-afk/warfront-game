"use client"

import Link from "next/link"
import HomeTopResourceBar from "../components/HomeTopResourceBar"

export default function HomePage() {
  return (
    <>
      <HomeTopResourceBar />

      <main className="min-h-screen bg-[#05070d] px-5 pb-28 pt-20 text-white">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-3 text-xs tracking-[0.35em] text-white/45">
            TACTICAL STRATEGY
          </div>
          <h1 className="text-4xl font-black">WAR FRONT: CRISIS</h1>
          <p className="mt-4 text-lg text-white/72">
            기지를 성장시키고, 병력을 양성하고, 월드맵에서 적 기지를 공격하세요.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Link
            href="/base"
            className="rounded-[28px] border border-blue-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6"
          >
            <div className="mb-2 text-xs tracking-[0.35em] text-white/45">BASE CONTROL</div>
            <div className="text-4xl font-black">기지 관리</div>
            <div className="mt-4 text-lg text-white/72">
              자원 생산, 병력 훈련, 건물 업그레이드를 관리합니다.
            </div>
          </Link>

          <Link
            href="/map"
            className="rounded-[28px] border border-red-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.18),_transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6"
          >
            <div className="mb-2 text-xs tracking-[0.35em] text-white/45">WORLD OPERATION</div>
            <div className="text-4xl font-black">월드맵</div>
            <div className="mt-4 text-lg text-white/72">
              NPC 기지를 공격하고 자원을 약탈합니다.
            </div>
          </Link>

          <Link
            href="/reports"
            className="rounded-[28px] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6"
          >
            <div className="mb-2 text-xs tracking-[0.35em] text-white/45">COMBAT ARCHIVE</div>
            <div className="text-4xl font-black">보고서</div>
            <div className="mt-4 text-lg text-white/72">
              전투 결과와 기록을 확인합니다.
            </div>
          </Link>
        </section>
      </main>
    </>
  )
}