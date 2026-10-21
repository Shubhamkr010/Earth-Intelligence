import { useState } from 'react'
import { ChevronLeft, ChevronRight, Crosshair, Droplets, Sprout, Sun } from 'lucide-react'
import { usePortalStore } from '../store/usePortalStore'

const LENSES = [
  { id: 'water', label: 'Water & Reservoir Pulse', subtitle: 'Surface tanks, lakes, & seasonal storage', Icon: Droplets },
  { id: 'agri', label: 'Agri & Aquaculture Atlas', subtitle: 'Cropland, orchards, & shrimp/fish ponds', Icon: Sprout },
  { id: 'solar', label: 'Solar & Green Canopy Tracker', subtitle: 'Solar parks, clean energy, & afforestation', Icon: Sun },
  { id: 'sandbox', label: 'Visual Similarity Sandbox', subtitle: 'Click any 10 m spot to find similar terrain', Icon: Crosshair },
]

export default function Lenses() {
  const [expanded, setExpanded] = useState(false)
  const active = usePortalStore((state) => state.activeLens)
  const setLens = usePortalStore((state) => state.setLens)
  return <aside data-map-obstruction className="orbital-enter absolute left-4 top-1/2 z-20 -translate-y-1/2">
    <div className={`surface flex flex-col gap-2 rounded-card p-2 transition-[width] duration-200 ${expanded ? 'w-[min(260px,calc(100vw-32px))]' : 'w-14'}`}>
      <div className="flex items-center justify-between px-1 py-1">
        {expanded && <span className="text-sm font-medium text-frost">Smart lenses</span>}
        <button type="button" onClick={() => setExpanded((value) => !value)} className="control-button flex h-8 w-8 items-center justify-center border-transparent text-mist" title={expanded ? 'Collapse lenses' : 'Expand lenses'} aria-label={expanded ? 'Collapse lenses' : 'Expand lenses'}>{expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</button>
      </div>
      {LENSES.map(({ id, label, subtitle, Icon }) => <button key={id} type="button" onClick={() => setLens(id)} title={label} aria-label={label} aria-pressed={active === id} className={`flex min-h-10 items-center gap-3 rounded-control border px-2 text-left transition-colors ${active === id ? 'border-citylight/60 bg-citylight/10' : 'border-transparent hover:bg-ocean-800/70'}`}>
        <Icon size={18} className={`shrink-0 ${active === id ? 'text-citylight' : 'text-mist'}`} />
        {expanded && <span className="min-w-0"><span className="block text-xs font-medium leading-4 text-frost">{label}</span><span className="mt-1 block text-[11px] leading-4 text-mist">{subtitle}</span></span>}
      </button>)}
      {active && expanded && <div className="mt-1 border-t border-ocean-700/70 px-1 pt-3"><div className="mb-2 flex justify-between font-data text-[11px] text-mist"><span>0.75</span><span>Similarity</span><span>1.00</span></div><div className="h-1.5 w-full rounded-full bg-gradient-to-r from-ocean-800 via-tide to-ice" /></div>}
    </div>
  </aside>
}
