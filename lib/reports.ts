export type BattleReport = {
  id: string
  title: string
  result: 'win' | 'lose'
  detail: string
  reward?: {
    gold: number
    fuel: number
    steel: number
  }
  createdAt: string
}

const REPORTS_KEY = 'wf_reports'

export function loadReports(): BattleReport[] {
  if (typeof window === 'undefined') return []

  const saved = localStorage.getItem(REPORTS_KEY)
  if (!saved) return []

  try {
    return JSON.parse(saved)
  } catch {
    return []
  }
}

export function saveReports(reports: BattleReport[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
}

export function addReport(report: BattleReport) {
  const reports = loadReports()
  const next = [report, ...reports]
  saveReports(next)
}

export function clearReports() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(REPORTS_KEY)
}