import { create } from 'zustand'
import tzLookup from 'tz-lookup'
import { MOCK_STATS, requestCopilot, requestSimilarity } from '../lib/api'

let similarityRequestId = 0
let reverseGeocodeRequestId = 0
let reverseGeocodeController
let lastReverseGeocodeAt = 0

function localTimeAt(timeZone) {
  try {
    return new Intl.DateTimeFormat('en', { timeZone, hour: 'numeric', minute: '2-digit' }).format(new Date())
  } catch {
    return new Intl.DateTimeFormat('en', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit' }).format(new Date())
  }
}

export const usePortalStore = create((set, get) => ({
  map: null,
  camera: { lat: 15.5, lon: 80, zoom: 2.1, pitch: 25 },
  focusedPlace: null,
  selectedPoint: null,
  activeLens: 'water',
  selectedYear: 2024,
  compareWith2017: true,
  similarityThreshold: 0.85,
  tileUrl: null,
  satelliteEnabled: false,
  isQueryingEngine: false,
  instantStats: MOCK_STATS,
  rightDrawerOpen: false,
  rightDrawerTab: 'copilot',
  exportModalOpen: false,
  messages: [{ role: 'assistant', text: 'Choose a region, activate a lens, or ask a question about Earth.' }],
  actionLog: [],
  setMap: (map) => set({ map }),
  setCamera: (camera) => set({ camera }),
  toggleSatellite: () => set((state) => ({ satelliteEnabled: !state.satelliteEnabled })),
  updateScreenPoint: (screenX, screenY) => set((state) => state.selectedPoint ? { selectedPoint: { ...state.selectedPoint, screenX, screenY } } : state),
  setDrawer: (open, tab = get().rightDrawerTab) => set({ rightDrawerOpen: open, rightDrawerTab: tab }),
  setLens: (lens) => {
    set({ activeLens: lens })
    const point = get().selectedPoint
    if (point) get().runSimilaritySearch(point.lat, point.lon)
  },
  setYear: (year) => {
    set({ selectedYear: year })
    const point = get().selectedPoint
    if (point) get().runSimilaritySearch(point.lat, point.lon)
  },
  setThreshold: (similarityThreshold) => {
    set({ similarityThreshold })
    const point = get().selectedPoint
    if (point) get().runSimilaritySearch(point.lat, point.lon)
  },
  flyToLocation: (lat, lon, zoom = 10, name = 'Selected region') => {
    const { map, rightDrawerOpen } = get()
    set({ focusedPlace: { name, lat, lon } })
    map?.flyTo({ center: [lon, lat], zoom, pitch: zoom > 5 ? 40 : 25, speed: 1.3, curve: 1.42, essential: true, padding: { right: rightDrawerOpen ? 420 : 0 } })
  },
  resolveFocusedPlace: async (lat, lon) => {
    const requestId = ++reverseGeocodeRequestId
    reverseGeocodeController?.abort()
    const controller = new AbortController()
    reverseGeocodeController = controller
    let timeZone = 'UTC'
    try { timeZone = tzLookup(lat, lon) } catch { /* Keep UTC for coordinates without a mapped timezone. */ }

    set({ focusedPlace: { name: 'Resolving location…', region: '', country: '', lat, lon, timeZone, localTime: localTimeAt(timeZone), loading: true } })
    const delay = Math.max(0, 1000 - (Date.now() - lastReverseGeocodeAt))
    if (delay) await new Promise((resolve) => window.setTimeout(resolve, delay))
    if (requestId !== reverseGeocodeRequestId) return

    lastReverseGeocodeAt = Date.now()
    let location = null
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=10&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`Reverse geocoding failed: ${response.status}`)
      location = await response.json()
    } catch {
      if (controller.signal.aborted || requestId !== reverseGeocodeRequestId) return
    }
    if (requestId !== reverseGeocodeRequestId) return

    const address = location?.address ?? {}
    const locality = address.city ?? address.town ?? address.village ?? address.municipality ?? address.hamlet ?? address.suburb ?? address.county ?? address.state_district ?? ''
    const state = address.state ?? address.province ?? ''
    const country = address.country ?? ''
    const parts = [...new Set([locality, state, country].filter(Boolean))]
    const name = parts.length ? parts.join(', ') : location?.display_name?.split(',').slice(-3).join(', ').trim() || 'Unknown location'
    set({ focusedPlace: { name, locality, region: state, country, lat, lon, timeZone, localTime: localTimeAt(timeZone), loading: false } })
  },
  runSimilaritySearch: async (lat, lon) => {
    const requestId = ++similarityRequestId
    const projected = get().map?.project([lon, lat])
    set({ selectedPoint: { lat, lon, screenX: projected?.x, screenY: projected?.y }, isQueryingEngine: true })
    const { selectedYear, activeLens, similarityThreshold } = get()
    const result = await requestSimilarity({ lat, lon, year: selectedYear, lens: activeLens, threshold: similarityThreshold })
    if (requestId !== similarityRequestId) return
    set({ tileUrl: result.tile_url ?? null, instantStats: { ...(result.stats ?? MOCK_STATS), topCoordinates: result.top_10_sample ?? result.stats?.topCoordinates ?? MOCK_STATS.topCoordinates }, isQueryingEngine: false })
    if (result.tile_url) get().map?.getSource('alphaearth-similarity-layer')?.setTiles([result.tile_url])
  },
  askCopilot: async (message) => {
    const { selectedPoint, selectedYear, activeLens } = get()
    set((state) => ({ messages: [...state.messages, { role: 'user', text: message }], actionLog: [] }))
    const result = await requestCopilot(message, { lat: selectedPoint?.lat, lon: selectedPoint?.lon, year: selectedYear, lens: activeLens })
    for (const call of result.tool_calls ?? []) {
      const args = call.args ?? {}
      const log = call.tool === 'flyToLocation'
        ? `Calling flyToLocation(${args.lat}, ${args.lon}, zoom=${args.zoom})`
        : call.tool === 'setLens' ? `Activating lens: ${args.lens}` : `Setting archive year: ${args.year}`
      set((state) => ({ actionLog: [...state.actionLog, log] }))
      if (call.tool === 'flyToLocation') get().flyToLocation(args.lat, args.lon, args.zoom, args.name)
      if (call.tool === 'setLens') get().setLens(args.lens)
      if (call.tool === 'setYear') get().setYear(args.year)
    }
    set((state) => ({ messages: [...state.messages, { role: 'assistant', text: result.reply, citations: result.citations ?? [] }] }))
  },
}))