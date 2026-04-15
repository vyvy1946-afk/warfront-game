import type { Metadata } from "next"
import "./globals.css"
import GameHeader from "../components/GameHeader"
import { ToastProvider } from "../components/ToastProvider"

export const metadata: Metadata = {
  title: "WAR FRONT: CRISIS",
  description: "Tactical strategy game",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#05070d] text-white">
        <ToastProvider>
          <div className="min-h-screen pb-28">{children}</div>
          <GameHeader />
        </ToastProvider>
      </body>
    </html>
  )
}