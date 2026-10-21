import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { usePortalStore } from '../store/usePortalStore'

const YEARS = Array.from({ length: 9 }, (_, index) => 2017 + index)

export default function TimelineScrubber() {
  const year = usePortalStore((state) => state.selectedYear)
  const setYear = usePortalStore((state) => state.setYear)
  const compare = usePortalStore((state) => state.compareWith2017)
  const toggleCompare = () => usePortalStore.setState({ compareWith2017: !compare })
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => setYear(year >= 2025 ? 2017 : year + 1), 900)
    return () => window.clearInterval(timer)
  }, [playing, year, setYear])

  return <section data-map-obstruction aria-label="Time travel scrubber" className="orbital-enter surface absolute bottom-4 left-1/2 z-20 w-[min(480px,calc(100vw-32px))] -translate-x-1/2 rounded-card px-3 py-2.5 sm:px-4">
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause year playback' : 'Play year sequence'} className="control-button flex h-8 w-8 shrink-0 items-center justify-center text-frost">{playing ? <Pause size={15} /> : <Play size={15} />}</button>
      <div className="relative flex-1 pb-3">
        <div className="grid grid-cols-9 gap-1">
          {YEARS.map((value) => <button type="button" key={value} onClick={() => setYear(value)} aria-label={`Select ${value}`} title={`Archive year ${value}`} aria-pressed={year === value} className={`h-6 rounded-control font-data text-[9px] tabular-nums transition-colors sm:text-[11px] ${year === value ? 'font-medium text-citylight' : 'text-mist hover:text-frost'}`}><span className="sm:hidden">{String(value).slice(2)}</span><span className="hidden sm:inline">{value}</span></button>)}
        </div>
        <div aria-hidden="true" className="absolute bottom-[5px] left-0 right-0 h-px bg-ocean-700" />
        <div aria-hidden="true" className="absolute bottom-[2px] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-citylight shadow-[0_0_8px_rgba(245,165,36,0.35)] transition-[left] duration-200" style={{ left: `${((year - 2017 + 0.5) / YEARS.length) * 100}%` }} />
      </div>
      <button type="button" role="switch" aria-label="Compare against 2017" aria-checked={compare} title="Toggle net change against 2017" onClick={toggleCompare} className="flex shrink-0 items-center gap-1.5 rounded-control px-1 text-[10px] font-medium sm:gap-2 sm:text-xs"><span className={compare ? 'text-kelp' : 'text-mist'}>Δ vs 2017</span><span aria-hidden="true" className={`relative h-4 w-7 rounded-full transition-colors ${compare ? 'bg-kelp/50' : 'bg-ocean-700'}`}><span className={`absolute top-0.5 h-3 w-3 rounded-full bg-frost transition-[left] ${compare ? 'left-3.5' : 'left-0.5'}`} /></span></button>
    </div>
  </section>
}
