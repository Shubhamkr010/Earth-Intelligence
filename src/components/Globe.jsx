import { useEffect, useRef } from 'react'
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { usePortalStore } from '../store/usePortalStore'

setWorkerUrl(workerUrl)

const STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const HOME = { center: [80, 15.5], zoom: 2.1, pitch: 0, bearing: 0 }

function fitGlobeZoom(width, height) {
  const targetDiameter = Math.min(width, height) * 0.82
  return Math.max(0, Math.min(HOME.zoom, Math.log2((targetDiameter * Math.PI) / 512)))
}

export default function Globe() {
  const containerRef = useRef(null)
  const starsRef = useRef(null)
  const mapRef = useRef(null)
  const map = usePortalStore((state) => state.map)
  const tileUrl = usePortalStore((state) => state.tileUrl)
  const satelliteEnabled = usePortalStore((state) => state.satelliteEnabled)
  const cameraZoom = usePortalStore((state) => state.camera.zoom)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined
    const container = containerRef.current
    const instance = new MapLibreMap({ container, style: STYLE_URL, ...HOME, zoom: fitGlobeZoom(container.clientWidth, container.clientHeight), attributionControl: { compact: true }, canvasContextAttributes: { antialias: true } })
    mapRef.current = instance
    usePortalStore.getState().setMap(instance)
    let rotating = false
    let userMovedCamera = false
    let idleTimer
    let frame
    let labelFrame
    let last = performance.now()
    const countryLabelLayers = ['place_country_1', 'place_country_2']
    const baseCountryFilters = new Map()
    let hiddenCountryNames = new Set()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tick = (now) => {
      if (rotating && instance.getZoom() < 4) {
        const center = instance.getCenter()
        instance.setCenter([center.lng + ((now - last) / 1000) * 0.5, center.lat])
      }
      last = now
      frame = requestAnimationFrame(tick)
    }
    const pause = () => { rotating = false; clearTimeout(idleTimer) }
    const markCameraInteraction = () => { userMovedCamera = true; pause() }
    instance.__pauseRotation = pause
    const resume = () => {
      clearTimeout(idleTimer)
      if (!reducedMotion) idleTimer = setTimeout(() => { rotating = instance.getZoom() < 4 }, 2500)
    }
    instance.__pauseRotation = pause
    instance.__resumeRotation = resume
    const updatePoint = () => {
      const center = instance.getCenter()
      usePortalStore.getState().setCamera({ lat: center.lat, lon: center.lng, zoom: instance.getZoom(), pitch: instance.getPitch() })
      const point = usePortalStore.getState().selectedPoint
      if (!point) return
      const pixel = instance.project([point.lon, point.lat])
      usePortalStore.getState().updateScreenPoint(pixel.x, pixel.y)
    }
    const updateCountryLabelOcclusion = () => {
      if (labelFrame) return
      labelFrame = requestAnimationFrame(() => {
        labelFrame = null
        const visibleLayers = countryLabelLayers.filter((id) => instance.getLayer(id))
        if (!visibleLayers.length) return
        const panels = [...document.querySelectorAll('[data-map-obstruction]')]
          .filter((element) => element.getClientRects().length)
          .map((element) => element.getBoundingClientRect())
        const nextHidden = new Set()
        for (const feature of instance.queryRenderedFeatures({ layers: visibleLayers })) {
          if (feature.geometry?.type !== 'Point') continue
          const name = feature.properties?.['name:en'] ?? feature.properties?.name
          if (typeof name !== 'string') continue
          const { x, y } = instance.project(feature.geometry.coordinates)
          const width = Math.min(180, Math.max(32, name.length * 8))
          if (panels.some((panel) => x + width / 2 > panel.left && x - width / 2 < panel.right && y + 10 > panel.top && y - 10 < panel.bottom)) nextHidden.add(name)
        }
        if (nextHidden.size === hiddenCountryNames.size && [...nextHidden].every((name) => hiddenCountryNames.has(name))) return
        hiddenCountryNames = nextHidden
        for (const id of visibleLayers) {
          const baseFilter = baseCountryFilters.get(id)
          const filter = hiddenCountryNames.size
            ? ['all', ...(baseFilter ? [baseFilter] : []), ['!', ['in', ['coalesce', ['get', 'name:en'], ['get', 'name']], ['literal', [...hiddenCountryNames]]]]]
            : baseFilter
          instance.setFilter(id, filter)
        }
      })
    }
    const uiObserver = new MutationObserver(updateCountryLabelOcclusion)
    uiObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'data-map-obstruction'] })
    const onViewportResize = () => {
      instance.resize()
      if (!userMovedCamera && instance.getZoom() < 4) {
        instance.setZoom(fitGlobeZoom(container.clientWidth, container.clientHeight), { duration: 0 })
      }
      updateCountryLabelOcclusion()
    }
    window.addEventListener('resize', onViewportResize)
    instance.on('style.load', () => {
      instance.setProjection({ type: 'globe' })
      instance.setSky({ 'sky-color': '#0A1C30', 'horizon-color': 'rgba(95,168,201,0.12)', 'fog-color': '#0A1C30', 'fog-ground-blend': 0.7, 'horizon-fog-blend': 0.8, 'sky-horizon-blend': 0.5, 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 0.7, 9, 0] })
      for (const layer of instance.getStyle().layers ?? []) {
        try {
          if (/water/i.test(layer.id) && layer.type === 'fill') instance.setPaintProperty(layer.id, 'fill-color', '#0A1C30')
          if (/^background$/.test(layer.id) && layer.type === 'background') instance.setPaintProperty(layer.id, 'background-color', '#071422')
          if (/^landcover$|^landuse$|^landuse_residential$/.test(layer.id) && layer.type === 'fill') instance.setPaintProperty(layer.id, 'fill-color', layer.id === 'landuse_residential' ? '#263640' : '#1B2D38')
          if (/boundary|admin/i.test(layer.id) && layer.type === 'line') instance.setPaintProperty(layer.id, 'line-color', 'rgba(31,74,114,0.35)')
          if (/^place_country_/.test(layer.id) && layer.type === 'symbol') {
            baseCountryFilters.set(layer.id, layer.filter)
            instance.setLayoutProperty(layer.id, 'text-transform', 'none')
            instance.setLayoutProperty(layer.id, 'text-allow-overlap', false)
            instance.setLayoutProperty(layer.id, 'text-ignore-placement', false)
            instance.setPaintProperty(layer.id, 'text-color', 'rgba(232,240,244,0.6)')
            instance.setPaintProperty(layer.id, 'text-opacity', 0.6)
            instance.setPaintProperty(layer.id, 'text-halo-color', 'rgba(10,28,48,0.8)')
          }
        } catch { /* Vendor styles may mark some paint properties as immutable. */ }
      }
      if (instance.getLayer('place_country_2')) instance.setLayerZoomRange('place_country_2', 5, 7)
      if (instance.getSource('protomaps') && !instance.getLayer('nightside-city-lights')) {
        const cityLights = {
          id: 'nightside-city-lights',
          type: 'circle',
          source: 'protomaps',
          'source-layer': 'places',
          minzoom: 1.5,
          maxzoom: 8,
          filter: ['all', ['==', ['get', 'kind'], 'locality'], ['in', ['get', 'kind_detail'], ['literal', ['city', 'town']]], ['<=', ['coalesce', ['get', 'population_rank'], 99], 8]],
          paint: {
            'circle-color': '#F5A524',
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 1.5, 1, 3, 2, 6, 4, 8, 5],
            'circle-blur': 0.85,
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 1.5, 0.14, 5, 0.24, 8, 0.12],
          },
        }
        if (instance.getLayer('place_country_1')) instance.addLayer(cityLights, 'place_country_1')
        else instance.addLayer(cityLights)
      }
      instance.addSource('satellite-basemap-source', { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 19 })
      instance.addLayer({ id: 'satellite-basemap-layer', type: 'raster', source: 'satellite-basemap-source', minzoom: 10, paint: { 'raster-opacity': 0.75, 'raster-fade-duration': 150 }, layout: { visibility: 'none' } })
      const tileUrl = usePortalStore.getState().tileUrl
      if (tileUrl) {
        instance.addSource('alphaearth-similarity-layer', { type: 'raster', tiles: [tileUrl], tileSize: 256 })
        instance.addLayer({ id: 'alphaearth-similarity-layer', type: 'raster', source: 'alphaearth-similarity-layer', paint: { 'raster-opacity': 0.82, 'raster-fade-duration': 150 } })
      }
      if (!reducedMotion) { frame = requestAnimationFrame(tick); rotating = true }
      resume()
    })
    instance.on('click', (event) => {
      const { lng, lat } = event.lngLat
      const store = usePortalStore.getState()
      store.resolveFocusedPlace(lat, lng)
      store.runSimilaritySearch(lat, lng)
    })
    instance.on('move', updatePoint)
    instance.on('moveend', updateCountryLabelOcclusion)
    instance.on('idle', updateCountryLabelOcclusion)
    instance.on('mousedown', markCameraInteraction)
    instance.on('touchstart', markCameraInteraction)
    instance.on('wheel', markCameraInteraction)
    instance.on('dragstart', markCameraInteraction)
    instance.on('mouseup', resume)
    instance.on('touchend', resume)
    instance.on('moveend', resume)

    if (starsRef.current) {
      const canvas = starsRef.current
      const context = canvas.getContext('2d')
      const drawStars = () => {
        const { width, height } = canvas.getBoundingClientRect()
        const ratio = window.devicePixelRatio || 1
        canvas.width = width * ratio
        canvas.height = height * ratio
        context.scale(ratio, ratio)
        context.clearRect(0, 0, width, height)
        let seed = 8271
        for (let index = 0; index < 350; index += 1) {
          seed = (seed * 16807) % 2147483647
          const x = (seed / 2147483647) * width
          seed = (seed * 16807) % 2147483647
          const y = (seed / 2147483647) * height
          context.globalAlpha = 0.2 + ((seed % 300) / 1000)
          context.fillStyle = '#E8F0F4'
          context.fillRect(x, y, 1, 1)
        }
      }
      drawStars()
      window.addEventListener('resize', drawStars)
      instance.once('remove', () => window.removeEventListener('resize', drawStars))
    }
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(labelFrame)
      clearTimeout(idleTimer)
      uiObserver.disconnect()
      window.removeEventListener('resize', onViewportResize)
      usePortalStore.getState().setMap(null)
      instance.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!map || !tileUrl) return
    const attachLayer = () => {
      if (map.getSource('alphaearth-similarity-layer')) {
        map.getSource('alphaearth-similarity-layer').setTiles([tileUrl])
        return
      }
      map.addSource('alphaearth-similarity-layer', { type: 'raster', tiles: [tileUrl], tileSize: 256 })
      map.addLayer({ id: 'alphaearth-similarity-layer', type: 'raster', source: 'alphaearth-similarity-layer', paint: { 'raster-opacity': 0.82, 'raster-fade-duration': 150 } })
    }
    if (map.isStyleLoaded()) attachLayer()
    else map.once('style.load', attachLayer)
  }, [map, tileUrl])

  useEffect(() => {
    if (!map?.getLayer('satellite-basemap-layer')) return
    map.setLayoutProperty('satellite-basemap-layer', 'visibility', satelliteEnabled ? 'visible' : 'none')
  }, [map, satelliteEnabled])

  return <div className="globe-scene fixed inset-0 overflow-hidden bg-ocean-950">
    <div ref={containerRef} className="map-canvas-socket absolute inset-0" />
    <canvas ref={starsRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />
    <div aria-hidden="true" className={`atmosphere-rim pointer-events-none absolute left-1/2 top-[48%] rounded-full transition-opacity duration-500 ${cameraZoom < 4 ? 'opacity-100' : 'opacity-0'}`} />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(4,11,20,0.72)_100%)]" />
  </div>
}
