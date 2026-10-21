export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

const defaultSeries = [3243, 3310, 3405, 3590, 3680, 3710, 3795, 3840, 3910]

export const MOCK_STATS = {
  title: 'Nellore Surface Water Cluster',
  region: 'Andhra Pradesh, India',
  matchingPatches: 412,
  areaHectares: 3840,
  changeSince2017Pct: 18.4,
  yearlySeries: defaultSeries.map((area, index) => ({ year: 2017 + index, area })),
  topCoordinates: Array.from({ length: 10 }, (_, index) => ({
    rank: index + 1,
    lat: (14.4426 + index * 0.0012).toFixed(4),
    lon: (79.9865 + index * 0.0012).toFixed(4),
    similarity: (0.98 - index * 0.012).toFixed(3),
    area: (18.4 - index * 0.8).toFixed(1),
  })),
}

export const MOCK_MESSAGES = [{ role: 'assistant', text: 'Choose a region, activate a lens, or ask a question about Earth.' }]

const regions = [
  { match: /nellore|somasila|kandaleru/i, lat: 14.4426, lon: 79.9865, name: 'Nellore, Andhra Pradesh', lens: 'water' },
  { match: /warangal/i, lat: 17.9689, lon: 79.5941, name: 'Warangal, Telangana', lens: 'agri' },
  { match: /bhadla|rajasthan/i, lat: 27.5385, lon: 71.9158, name: 'Bhadla Solar Park, Rajasthan', lens: 'solar' },
  { match: /andhra|aquaculture/i, lat: 16.5, lon: 81.2, name: 'Andhra Coast', lens: 'agri' },
]

export function findRegion(query) {
  return regions.find((region) => region.match.test(query)) ?? regions[0]
}

export async function requestSimilarity({ lat, lon, year, lens, threshold }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/similarity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon, year, lens, threshold }),
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) throw new Error(`Similarity request failed: ${response.status}`)
    const payload = await response.json()
    return payload.data ?? payload
  } catch {
    const region = regions.reduce((closest, item) =>
      Math.hypot(item.lat - lat, item.lon - lon) < Math.hypot(closest.lat - lat, closest.lon - lon) ? item : closest,
    regions[0])
    return {
      tile_url: null,
      stats: { ...MOCK_STATS, title: `${region.name.split(',')[0]} ${lens === 'water' ? 'Surface Water' : 'Land Cover'} Cluster` },
      top_10_sample: MOCK_STATS.topCoordinates,
    }
  }
}

export async function requestCopilot(message, context) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
      signal: AbortSignal.timeout(7000),
    })
    if (!response.ok) throw new Error(`Copilot request failed: ${response.status}`)
    return await response.json()
  } catch {
    const region = findRegion(message)
    const lens = /solar/i.test(message) ? 'solar' : /crop|farm|agri|aquaculture/i.test(message) ? 'agri' : region.lens
    return {
      reply: `${region.name} shows ${lens === 'water' ? 'expanding surface-water storage' : lens === 'solar' ? 'large-scale solar development' : 'changing agricultural and aquaculture patterns'} across the AlphaEarth annual archive. Select a year or adjust the lens to inspect the change. [AlphaEarth v1]`,
      tool_calls: [
        { tool: 'flyToLocation', args: { lat: region.lat, lon: region.lon, zoom: 10.5, name: region.name } },
        { tool: 'setLens', args: { lens } },
        { tool: 'setYear', args: { year: 2025 } },
      ],
      citations: ['AlphaEarth Foundations Annual v1 (10m)', 'Sentinel-2 Surface Reflectance'],
    }
  }
}

export async function askCopilot(message) {
  const result = await requestCopilot(message, {})
  return { role: 'assistant', text: result.reply }
}
