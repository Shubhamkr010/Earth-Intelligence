import { ArrowUpRight, X } from 'lucide-react'
import { usePortalStore } from '../store/usePortalStore'
import PlaceCard from './PlaceCard'

export default function InstantStatsCard() {
  const point = usePortalStore((state) => state.selectedPoint)
  const stats = usePortalStore((state) => state.instantStats)
  const year = usePortalStore((state) => state.selectedYear)
  const lens = usePortalStore((state) => state.activeLens)
  const busy = usePortalStore((state) => state.isQueryingEngine)
  const setThreshold = usePortalStore((state) => state.setThreshold)
  const threshold = usePortalStore((state) => state.similarityThreshold)
  const setDrawer = usePortalStore((state) => state.setDrawer)
  if (!point) return null

  const cardWidth = 330
  const left = point.screenX > window.innerWidth - cardWidth - 24 ? point.screenX - cardWidth - 24 : point.screenX + 24
  const top = Math.max(88, Math.min(point.screenY - 36, window.innerHeight - 310))
  const change = stats.changeSince2017Pct ?? 0
  return <>
    {Number.isFinite(point.screenX) && <svg className="pointer-events-none fixed inset-0 z-20 h-full w-full" aria-hidden="true"><line x1={point.screenX} y1={point.screenY} x2={left} y2={top + 28} stroke="var(--citylight)" strokeWidth="1" strokeDasharray="220" className="animate-[leader_200ms_ease-out_forwards]" /></svg>}
    {Number.isFinite(point.screenX) && <div onMouseEnter={() => usePortalStore.getState().map?.__pauseRotation?.()} onMouseLeave={() => usePortalStore.getState().map?.__resumeRotation?.()} className="fixed z-20 h-[18px] w-[18px] cursor-crosshair" style={{ left: point.screenX - 9, top: point.screenY - 9 }}><span className="pointer-events-none absolute inset-0 animate-[pinring_500ms_ease-out_1] rounded-full bg-citylight/15" /><span className="pointer-events-none absolute left-[5px] top-[5px] h-2 w-2 rounded-full border-2 border-ocean-950 bg-citylight" /></div>}
    <article data-map-obstruction className="surface fixed z-20 w-[min(330px,calc(100vw-32px))] rounded-card p-4 animate-[cardin_160ms_ease-out]" style={{ left: Math.max(16, Math.min(left, window.innerWidth - 346)), top }}>
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1"><PlaceCard /><p className="mt-2 text-xs leading-4 text-mist">{lensLabel(lens)} ({year})</p><p className="mt-2 font-data text-[11px] leading-4 text-mist">{point.lat.toFixed(4)}° {point.lat >= 0 ? 'N' : 'S'}, {point.lon.toFixed(4)}° {point.lon >= 0 ? 'E' : 'W'} · 10 m embedding</p></div>
        <button type="button" onClick={() => usePortalStore.setState({ selectedPoint: null })} aria-label="Close instant stats" className="text-mist hover:text-frost"><X size={16} /></button>
      </header>
      <div className="my-3 border-t border-ocean-700/70" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Matching patches" value={busy ? '…' : stats.matchingPatches?.toLocaleString() ?? '412'} />
        <Stat label="Matched area" value={`${(stats.areaHectares ?? 3840).toLocaleString()} ha`} />
        <Stat label="Change since 2017" value={`${change > 0 ? '+' : ''}${change}%`} color={change >= 0 ? 'text-kelp' : 'text-ember'} />
      </div>
      <div className="my-3 border-t border-ocean-700/70" />
      <label title="Minimum cosine similarity for matching patches" className="flex items-center justify-between gap-3 text-xs text-mist"><span>Similarity threshold</span><span className="font-data text-frost">{threshold.toFixed(2)}</span></label>
      <input title="Set the minimum cosine similarity score" type="range" min="0.75" max="0.98" step="0.01" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} aria-label="Similarity threshold" className="mt-2 h-1 w-full cursor-pointer accent-citylight" />
      <div className="mt-3 flex items-center justify-between gap-3"><button type="button" onClick={() => setDrawer(true, 'dossier')} className="flex min-h-9 flex-1 items-center justify-center gap-1 rounded-control bg-citylight px-2 text-xs font-semibold text-ocean-950 hover:brightness-105">Open dossier & export <ArrowUpRight size={14} /></button><button type="button" onClick={() => setDrawer(true, 'copilot')} className="text-xs font-medium text-citylight underline underline-offset-2">Ask Copilot</button></div>
    </article>
  </>
}

function Stat({ label, value, color = 'text-frost' }) {
  return <div className="min-w-0"><p className="min-h-8 text-[10px] leading-4 text-mist">{label}</p><p className={`font-data text-[13px] leading-4 ${color}`}>{value}</p></div>
}

function lensLabel(lens) {
  return { water: 'Water Pulse', agri: 'Agri Atlas', solar: 'Solar Tracker', sandbox: 'Similarity' }[lens] ?? lens
}
