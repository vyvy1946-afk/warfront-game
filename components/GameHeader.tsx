'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menus = [
  { href: '/', label: '홈' },
  { href: '/base', label: '기지' },
  { href: '/map', label: '월드맵' },
  { href: '/reports', label: '보고서' },
  { href: '/settings', label: '설정' },
]

export default function GameHeader() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
        <div className="grid grid-cols-5 gap-2">
          {menus.map((menu) => {
            const isActive = pathname === menu.href

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={[
                  'rounded-xl px-2 py-3 text-center text-xs font-bold transition sm:text-sm',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white',
                ].join(' ')}
              >
                {menu.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}