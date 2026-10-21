import { usePortalStore } from '../store/usePortalStore'

export default function PlaceCard() {
  const place = usePortalStore((state) => state.focusedPlace)
  if (!place) return <h2 className="text-xl font-semibold leading-[26px] text-frost">Location selected</h2>

  return <div aria-live="polite">
    <h2 className="text-xl font-semibold leading-[26px] text-frost">{place.name}</h2>
    <p className="mt-1 text-xs leading-4 text-mist">
      {place.loading ? 'Looking up this location' : [place.region, place.country].filter(Boolean).join(', ') || 'Location details unavailable'}
    </p>
    <p className="mt-1 font-data text-[11px] leading-4 text-mist">
      {place.localTime} local time{place.timeZone ? ` · ${place.timeZone}` : ''}
    </p>
  </div>
}
