'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menus = [
  { href: '/', label: '홈' },
  { href: '/base', label: '기지' },
  { href: '/map', label: '월드맵' },
  { href: '/reports', label: '보고서' },
]

export default function GameHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Tactical Strategy
            </span>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition">
              WAR FRONT: CRISIS
            </span>
          </div>
        </Link>

        <nav className="flex flex-wrap gap-2">
          {menus.map((menu) => {
            const isActive = pathname === menu.href

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={[
                  'rounded-xl px-4 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white',
                ].join(' ')}
              >
                {menu.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}