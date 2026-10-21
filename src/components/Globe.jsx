import { useEffect, useRef } from 'react'
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'

setWorkerUrl(workerUrl)

const STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const HOME = { center: [80.0, 14.4], zoom: 2.4, pitch: 0, bearing: 0 }
const IDLE_DELAY_MS = 2500
const DEG_PER_SEC = 1.2

export default function Globe({ onReady }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) return

    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL,
      center: HOME.center,
      zoom: HOME.zoom,
      pitch: HOME.pitch,
      bearing: HOME.bearing,
      attributionControl: { compact: true },
      canvasContextAttributes: { antialias: true },
    })
    mapRef.current = map

    let rotating = true
    let idleTimer = null
    let frame = null
    let last = performance.now()

    const tick = (now) => {
      if (rotating) {
        const dt = (now - last) / 1000
        const c = map.getCenter()
        map.setCenter([c.lng + DEG_PER_SEC * dt, c.lat])
      }
      last = now
      frame = requestAnimationFrame(tick)
    }

    const pause = () => {
      rotating = false
      clearTimeout(idleTimer)
    }
    const resumeLater = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        rotating = true
      }, IDLE_DELAY_MS)
    }

    map.on('style.load', () => {
      map.setProjection({ type: 'globe' })
      map.setSky({
        'sky-color': '#041322',
        'horizon-color': '#22d3ee',
        'fog-color': '#030303',
        'fog-ground-blend': 0.5,
        'horizon-fog-blend': 0.8,
        'sky-horizon-blend': 0.6,
        'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 0.7, 9, 0],
      })
      frame = requestAnimationFrame(tick)
      onReady?.(map)
    })

    map.on('mousedown', pause)
    map.on('touchstart', pause)
    map.on('wheel', pause)
    map.on('dragstart', pause)
    map.on('mouseup', resumeLater)
    map.on('touchend', resumeLater)
    map.on('moveend', resumeLater)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(idleTimer)
      map.remove()
      mapRef.current = null
    }
  }, [onReady])

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full bg-space" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(3,3,3,0.6)_100%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div className="animate-scan h-px w-full bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
      </div>
    </div>
  )
}
