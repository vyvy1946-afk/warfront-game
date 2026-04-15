"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const menus = [
  { label: "홈", href: "/" },
  { label: "기지", href: "/base" },
  { label: "월드맵", href: "/map" },
  { label: "보고서", href: "/reports" },
  { label: "설정", href: "/settings" },
]

export default function GameHeader() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#05070d]/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto grid max-w-5xl grid-cols-5 gap-2">
        {menus.map((menu) => {
          const active = pathname === menu.href

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`rounded-2xl px-3 py-4 text-center text-base font-bold transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-white/85 hover:bg-white/10"
              }`}
            >
              {menu.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}