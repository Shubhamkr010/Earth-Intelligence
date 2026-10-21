import { useState } from 'react'
import { ArrowDownToLine, ArrowRight, FileText, Send, X } from 'lucide-react'
import { usePortalStore } from '../store/usePortalStore'

const STARTERS = ['Show how water reservoirs changed in Nellore since 2018', 'Where are the largest solar farms in Rajasthan?', 'Find aquaculture pond expansion along the Andhra coast']

export default function Sidebar() {
  const open = usePortalStore((state) => state.rightDrawerOpen)
  const tab = usePortalStore((state) => state.rightDrawerTab)
  const setDrawer = usePortalStore((state) => state.setDrawer)
  const messages = usePortalStore((state) => state.messages)
  const logs = usePortalStore((state) => state.actionLog)
  const stats = usePortalStore((state) => state.instantStats)
  const selectedPoint = usePortalStore((state) => state.selectedPoint)
  const year = usePortalStore((state) => state.selectedYear)
  const lens = usePortalStore((state) => state.activeLens)
  const askCopilot = usePortalStore((state) => state.askCopilot)
  const [draft, setDraft] = useState('')

  const send = async (event) => {
    event.preventDefault()
    const prompt = draft.trim()
    if (!prompt) return
    setDraft('')
    await askCopilot(prompt)
  }

  return <>
    {!open && <button data-map-obstruction type="button" title="Open region dossier" onClick={() => setDrawer(true, 'dossier')} className="control-button surface absolute right-4 top-4 z-20 flex h-10 items-center gap-2 rounded-control px-3 text-sm text-frost"><FileText size={15} className="text-mist" /> Dossier</button>}
    {open && <>
      <button type="button" aria-label="Close right panel" onClick={() => setDrawer(false)} className="fixed inset-0 z-20 cursor-default bg-ocean-950/20 lg:hidden" />
      <aside data-map-obstruction className="surface fixed bottom-4 right-4 top-4 z-30 flex w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-panel transition-[transform,opacity] duration-[280ms] ease-out">
        <header className="border-b border-ocean-700/70 p-5">
          <div className="mb-4 flex items-center"><div className="flex-1"><h2 className="text-lg font-semibold text-frost">Earth intelligence</h2><p className="mt-1 text-xs text-mist">{selectedPoint ? `${selectedPoint.lat.toFixed(2)}°, ${selectedPoint.lon.toFixed(2)}° · ${lens} · ${year}` : 'Global analysis workspace'}</p></div><button type="button" onClick={() => setDrawer(false)} aria-label="Close panel" className="text-mist hover:text-frost"><X size={17} /></button></div>
          <div role="tablist" aria-label="Right panel sections" className="grid grid-cols-2 rounded-control bg-ocean-950/70 p-1">
            <button role="tab" aria-selected={tab === 'copilot'} onClick={() => setDrawer(true, 'copilot')} className={`rounded-control px-3 py-2 text-sm ${tab === 'copilot' ? 'bg-ocean-800 text-frost' : 'text-mist'}`}>AI Copilot</button>
            <button role="tab" aria-selected={tab === 'dossier'} onClick={() => setDrawer(true, 'dossier')} className={`rounded-control px-3 py-2 text-sm ${tab === 'dossier' ? 'bg-ocean-800 text-frost' : 'text-mist'}`}>Region Dossier</button>
          </div>
        </header>
        {tab === 'copilot' ? <>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
            {selectedPoint && <div className="flex items-center gap-2 rounded-control border border-ocean-700 px-3 py-2 text-xs text-mist">Context: {stats.region} ({selectedPoint.lat.toFixed(2)}, {selectedPoint.lon.toFixed(2)}) · {lens} · {year}<button type="button" onClick={() => usePortalStore.setState({ selectedPoint: null })} aria-label="Clear spatial context" className="ml-auto"><X size={13} /></button></div>}
            {logs.length > 0 && <div className="space-y-1.5">{logs.map((log, index) => <p key={`${log}-${index}`} className="font-data text-[11px] leading-4 text-mist"><span className="mr-2 text-citylight">•</span>{log}</p>)}</div>}
            {messages.length === 1 && <div className="space-y-2"><p className="text-xs text-mist">Suggested questions</p>{STARTERS.map((prompt) => <button key={prompt} type="button" onClick={() => askCopilot(prompt)} className="block w-full rounded-control border border-ocean-700 px-3 py-2.5 text-left text-xs leading-4 text-frost hover:bg-ocean-800">{prompt}</button>)}</div>}
            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'border-l-2 border-ocean-700 pl-3' : 'pl-1'}><p className="max-w-[68ch] whitespace-pre-wrap text-sm leading-[23px] text-frost">{linkPlaces(message.text, (place) => { const region = locateMention(place); usePortalStore.getState().flyToLocation(region.lat, region.lon, 10.5, region.name) })}</p>{message.citations?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{message.citations.map((citation) => <span key={citation} className="rounded-control bg-ocean-800 px-2 py-1 font-data text-[10px] text-mist">{citation}</span>)}</div>}</div>)}
          </div>
          <form onSubmit={send} className="m-4 flex items-end gap-2 rounded-control border border-ocean-700 bg-ocean-950/60 p-2 focus-within:border-citylight"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(event) } }} rows={1} placeholder="Ask about a place or pattern..." className="max-h-28 min-h-9 flex-1 resize-y bg-transparent px-1 py-2 text-sm text-frost outline-none placeholder:text-mist/70" /><button type="submit" disabled={!draft.trim()} aria-label="Send prompt" className="flex h-9 w-9 items-center justify-center rounded-control bg-citylight text-ocean-950 disabled:opacity-40"><Send size={15} /></button></form>
        </> : <Dossier stats={stats} year={year} />}
      </aside>
    </>}
  </>
}

function Dossier({ stats, year }) {
  const series = stats.yearlySeries ?? []
  const max = Math.max(...series.map((item) => item.area), 1)
  const rows = stats.topCoordinates ?? []
  const downloadSample = () => {
    const header = 'WATERMARK,Rank,Latitude,Longitude,Cosine Similarity,Estimated Area ha'
    const lines = rows.slice(0, 10).map((row) => `SAMPLE ONLY,${row.rank},${row.lat},${row.lon},${row.similarity},${row.area}`)
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'earth-intelligence-sample.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }
  return <>
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
      <header><h3 className="text-2xl font-semibold leading-[30px] text-frost">{stats.region?.split(',')[0] ?? 'Selected region'}</h3><p className="mt-1 font-data text-[11px] text-mist">2017–2025 · 10 m · Active year {year}</p></header>
      <section><h4 className="mb-3 text-sm font-medium text-frost">Matched area trajectory</h4><div className="flex h-28 items-end gap-2 border-b border-ocean-700/70 pb-2">{series.map((item) => <div key={item.year} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><div title={`${item.year}: ${item.area} ha`} className={`w-full max-w-7 rounded-t-sm ${item.year === year ? 'bg-citylight' : 'bg-tide/80'}`} style={{ height: `${Math.max(8, item.area / max * 84)}%` }} /><span className="font-data text-[9px] text-mist">{String(item.year).slice(2)}</span></div>)}</div></section>
      <section><div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-medium text-frost">Top matching coordinates</h4><span className="font-data text-[10px] text-mist">10 / {stats.matchingPatches ?? 412}</span></div><div className="overflow-x-auto"><table className="w-full text-left font-data text-[10px] tabular-nums"><thead className="text-mist"><tr><th className="pb-2 font-normal">#</th><th className="pb-2 font-normal">Lat / Lon</th><th className="pb-2 text-right font-normal">Cosine</th><th className="pb-2 text-right font-normal">ha</th></tr></thead><tbody>{rows.slice(0, 10).map((row) => <tr key={row.rank} className="border-t border-ocean-700/50 text-frost"><td className="py-2">{row.rank}</td><td className="py-2">{row.lat}, {row.lon}</td><td className="py-2 text-right">{row.similarity}</td><td className="py-2 text-right">{row.area}</td></tr>)}</tbody></table></div><p className="mt-2 border-t border-ocean-700/50 pt-2 text-xs leading-4 text-mist">+ {(stats.matchingPatches ?? 412) - rows.length} additional matching patches in this district (Full export required)</p></section>
      <p className="text-[11px] leading-4 text-mist">Source: Google DeepMind AlphaEarth Foundations (GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL), 10 m resolution, 64-D unit-norm cosine similarity.</p>
    </div>
    <footer className="space-y-2 border-t border-ocean-700/70 p-4"><button type="button" onClick={downloadSample} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-control border border-ocean-700 bg-ocean-800 text-xs text-frost hover:bg-ocean-700"><ArrowDownToLine size={14} />Download 2 km x 2 km sample (.csv)</button><button type="button" onClick={() => usePortalStore.setState({ exportModalOpen: true })} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-control bg-citylight px-3 text-xs font-semibold text-ocean-950 hover:brightness-105">Export full district (.geojson / .csv / PDF)<ArrowRight size={14} /></button></footer>
  </>
}

function locateMention(place) {
  return /bhadla|rajasthan/i.test(place) ? { lat: 27.5385, lon: 71.9158, name: 'Bhadla Solar Park, Rajasthan' } : /warangal/i.test(place) ? { lat: 17.9689, lon: 79.5941, name: 'Warangal, Telangana' } : { lat: 14.4426, lon: 79.9865, name: 'Nellore, Andhra Pradesh' }
}

function linkPlaces(text, onSelect) {
  const places = /(Somasila Reservoir|Kandaleru|Nellore|Warangal|Bhadla Solar Park|Rajasthan)/gi
  return text.split(places).map((part, index) => /^(Somasila Reservoir|Kandaleru|Nellore|Warangal|Bhadla Solar Park|Rajasthan)$/i.test(part) ? <button key={`${part}-${index}`} type="button" onClick={() => onSelect(part)} className="text-citylight underline underline-offset-2">{part}</button> : part)
}
