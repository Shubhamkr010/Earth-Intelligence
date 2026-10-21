import { Globe2 } from 'lucide-react'
import Globe from './components/Globe'
import Omnibox from './components/Omnibox'
import Lenses from './components/Lenses'
import Sidebar from './components/Sidebar'
import TimelineScrubber from './components/TimelineScrubber'
import InstantStatsCard from './components/InstantStatsCard'
import ExportModal from './components/ExportModal'
import { usePortalStore } from './store/usePortalStore'

export default function App() {
  const selectedPoint = usePortalStore((state) => state.selectedPoint)
  const selectedYear = usePortalStore((state) => state.selectedYear)
  const activeLens = usePortalStore((state) => state.activeLens)
  const similarityThreshold = usePortalStore((state) => state.similarityThreshold)
  const camera = usePortalStore((state) => state.camera)
  return (
    <div className="relative h-full w-full overflow-hidden bg-ocean-950">
      <Globe />
      <div data-map-obstruction className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 sm:left-6 sm:top-6">
        <Globe2 size={15} className="text-citylight" />
        <span className="hidden text-sm font-semibold text-frost sm:inline">Earth Intelligence</span>
        <span className="hidden rounded-control border border-ocean-700 bg-ocean-900/80 px-2 py-1 font-data text-[10px] text-mist sm:inline">AlphaEarth v1 · 10 m</span>
      </div>
      <Omnibox />
      <Lenses />
      <InstantStatsCard />
      <TimelineScrubber />
      <div data-map-obstruction title="Coordinates · zoom · archive year · active lens · similarity threshold" aria-label={`Coordinates ${selectedPoint ? `${selectedPoint.lat.toFixed(4)}, ${selectedPoint.lon.toFixed(4)}` : '15.5000, 80.0000'}, zoom ${camera.zoom.toFixed(1)}, year ${selectedYear}, lens ${activeLens}, similarity threshold ${similarityThreshold.toFixed(2)}`} className="surface absolute bottom-4 left-4 z-20 hidden rounded-control px-3 py-2 font-data text-[10px] tabular-nums text-mist sm:block">
        {`${selectedPoint ? `${selectedPoint.lat.toFixed(4)}, ${selectedPoint.lon.toFixed(4)}` : '15.5000, 80.0000'} · z ${camera.zoom.toFixed(1)} · ${selectedYear} · ${activeLens} · Similarity ≥ ${similarityThreshold.toFixed(2)}`}
      </div>
      <Sidebar />
      <ExportModal />
    </div>
  )
}
