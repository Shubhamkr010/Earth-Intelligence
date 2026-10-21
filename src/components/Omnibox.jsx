import { useEffect, useRef, useState } from 'react'
import { Command, Layers, Search, Sparkles, X } from 'lucide-react'
import { findRegion } from '../lib/api'
import { usePortalStore } from '../store/usePortalStore'

const coordinatePattern = /^\s*(-?\d+(?:\.\d+)?)\s*°?\s*([NS])?\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EW])?\s*$/i
const places = ['Nellore, Andhra Pradesh', 'Warangal, Telangana', 'Bhadla Solar Park, Rajasthan', 'Andhra Coast']

export default function Omnibox() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const { setDrawer, flyToLocation, runSimilaritySearch, askCopilot } = usePortalStore()
  const satelliteEnabled = usePortalStore((state) => state.satelliteEnabled)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') || event.key === '/') {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    const value = query.trim()
    if (!value) return
    const coordinateMatch = value.match(coordinatePattern)
    if (coordinateMatch) {
      const latitude = Number(coordinateMatch[1]) * (coordinateMatch[2]?.toUpperCase() === 'S' ? -1 : 1)
      const longitude = Number(coordinateMatch[3]) * (coordinateMatch[4]?.toUpperCase() === 'W' ? -1 : 1)
      if (Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
        flyToLocation(latitude, longitude, 13, 'Selected coordinate')
        runSimilaritySearch(latitude, longitude)
      }
    } else if (/\b(show|find|compare|where|how|what|analy[sz]e|changed|since)\b/i.test(value)) {
      setDrawer(true, 'copilot')
      await askCopilot(value)
    } else {
      const region = findRegion(value)
      flyToLocation(region.lat, region.lon, 10, region.name)
      runSimilaritySearch(region.lat, region.lon)
    }
    setQuery('')
    setFocused(false)
    inputRef.current?.blur()
  }

  const suggestions = query ? places.filter((place) => place.toLowerCase().includes(query.toLowerCase())).slice(0, 5) : []
  return <div data-map-obstruction className="orbital-enter absolute left-1/2 top-16 z-20 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 sm:top-4">
    <form onSubmit={submit} className={`surface flex h-12 items-center gap-3 rounded-card px-4 transition-colors ${focused ? 'border-citylight' : ''}`}>
      <Search size={17} className="shrink-0 text-mist" />
      <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 120)} placeholder="Search a region, paste coordinates, or ask the AI Copilot..." className="citylight-focus min-w-0 flex-1 bg-transparent text-sm text-frost outline-none placeholder:text-mist/70" aria-label="Search a region, coordinates, or ask the AI Copilot" />
      {query && <button type="button" title="Clear search" onClick={() => setQuery('')} className="text-mist hover:text-frost"><X size={15} /></button>}
      <kbd className="hidden items-center gap-1 rounded-control border border-ocean-700 px-2 py-1 font-data text-[10px] text-mist sm:flex"><Command size={11} /> K</kbd>
      <button type="button" title={satelliteEnabled ? 'Hide satellite imagery' : 'Show satellite imagery at zoom 10+'} aria-pressed={satelliteEnabled} onClick={() => usePortalStore.getState().toggleSatellite()} className={`control-button flex h-8 w-8 items-center justify-center ${satelliteEnabled ? 'border-tide text-tide' : 'border-transparent text-mist'}`}><Layers size={16} /></button>
      <button type="button" title="Open AI Copilot" onClick={() => setDrawer(true, 'copilot')} className="control-button flex h-8 w-8 items-center justify-center border-citylight/70 text-citylight"><Sparkles size={16} /></button>
    </form>
    {focused && suggestions.length > 0 && <div className="surface mt-2 overflow-hidden rounded-control p-1">
      <p className="px-3 py-2 text-xs text-mist">Locations</p>
      {suggestions.map((place) => <button key={place} type="button" onMouseDown={() => { setQuery(place); const region = findRegion(place); flyToLocation(region.lat, region.lon, 10, region.name); runSimilaritySearch(region.lat, region.lon); setQuery('') }} className="block w-full rounded-control px-3 py-2 text-left text-sm text-frost hover:bg-ocean-800">{place}</button>)}
    </div>}
  </div>
}
