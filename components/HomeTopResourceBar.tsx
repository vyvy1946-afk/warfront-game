"use client"

import { useEffect, useRef, useState } from "react"
import { Coins, Factory, Fuel } from "lucide-react"
import { useGameSync } from "../lib/useGameSync"
import { getResourceRatesPerSecond } from "../lib/gameSync"

function usePulseOnChange(value: number) {
  const prevRef = useRef(value)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (prevRef.current !== value) {
      setActive(true)
      const timer = window.setTimeout(() => setActive(false), 450)
      prevRef.current = value
      return () => window.clearTimeout(timer)
    }
  }, [value])

  return active
}

export default function HomeTopResourceBar() {
  const { resources, buildings, isHydrated } = useGameSync()

  const goldPulse = usePulseOnChange(resources.gold)
  const ironPulse = usePulseOnChange(resources.iron)
  const fuelPulse = usePulseOnChange(resources.fuel)

  if (!isHydrated) return null

  const rates = getResourceRatesPerSecond(buildings)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-500/10 bg-[#05070d]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="text-[11px] font-bold tracking-[0.35em] text-white/35">
          RESOURCE STATUS
        </div>

        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-2 transition-all duration-300 ${
              goldPulse
                ? "scale-105 border-yellow-300/50 bg-yellow-400/15 shadow-[0_0_18px_rgba(250,204,21,0.22)]"
                : "border-yellow-500/20 bg-yellow-500/10"
            }`}
          >
            <Coins className="h-4 w-4 text-yellow-300" />
            <span className="text-xs font-semibold text-yellow-200/80">금화</span>
            <span className="text-sm font-black text-white">{resources.gold}</span>
            <span className="text-[11px] text-yellow-200/65">
              (+{rates.gold.toFixed(1)}/초)
            </span>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-2 transition-all duration-300 ${
              ironPulse
                ? "scale-105 border-sky-300/50 bg-sky-400/15 shadow-[0_0_18px_rgba(56,189,248,0.22)]"
                : "border-sky-500/20 bg-sky-500/10"
            }`}
          >
            <Factory className="h-4 w-4 text-sky-300" />
            <span className="text-xs font-semibold text-sky-200/80">은화</span>
            <span className="text-sm font-black text-white">{resources.iron}</span>
            <span className="text-[11px] text-sky-200/65">
              (+{rates.iron.toFixed(1)}/초)
            </span>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-2 transition-all duration-300 ${
              fuelPulse
                ? "scale-105 border-orange-300/50 bg-orange-400/15 shadow-[0_0_18px_rgba(251,146,60,0.22)]"
                : "border-orange-500/20 bg-orange-500/10"
            }`}
          >
            <Fuel className="h-4 w-4 text-orange-300" />
            <span className="text-xs font-semibold text-orange-200/80">연료</span>
            <span className="text-sm font-black text-white">{resources.fuel}</span>
            <span className="text-[11px] text-orange-200/65">
              (+{rates.fuel.toFixed(1)}/초)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}