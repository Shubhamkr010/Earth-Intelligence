import { useCallback, useState } from 'react'
import { Globe2 } from 'lucide-react'
import Globe from './components/Globe'
import Omnibox from './components/Omnibox'
import Lenses from './components/Lenses'
import Sidebar from './components/Sidebar'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const handleReady = useCallback(() => setMapReady(true), [])
  const shift = sidebarOpen && window.innerWidth >= 768 ? -200 : 0

  return (
    <div className="relative h-full w-full overflow-hidden bg-space">
      <Globe onReady={handleReady} />

      <div
        className={`pointer-events-none absolute left-6 top-6 z-20 flex items-center gap-2 transition-opacity duration-500 ${
          sidebarOpen ? 'opacity-0 xl:opacity-100' : 'opacity-100'
        }`}
      >
        <Globe2 size={14} className="text-neon" />
        <span className="hud-label">Earth Intelligence Portal</span>
        <span className="ml-2 font-mono text-[10px] text-zinc-600">
          {mapReady ? 'LINK · ONLINE' : 'LINK · SYNCING'}
        </span>
      </div>

      <Omnibox
        shift={shift}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onSearch={(q) => console.log('[Search]', q)}
      />
      <Lenses shift={shift} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  )
}
