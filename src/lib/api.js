export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const MOCK_STATS = {
  region: 'Nellore, Andhra Pradesh',
  coordinates: [80.0, 14.4],
  metrics: [
    { label: 'Water Index', value: '0.62', delta: '+4.1%' },
    { label: 'Crop Cover', value: '71%', delta: '-1.8%' },
    { label: 'Canopy', value: '18.4 km²', delta: '+0.6%' },
    { label: 'Solar Yield', value: '5.3 kWh/m²', delta: '+2.2%' },
  ],
}

export const MOCK_MESSAGES = [
  {
    role: 'assistant',
    text: 'Copilot online. Select a region or ask about water, agriculture, or solar signals for any location on Earth.',
  },
  { role: 'user', text: 'What changed around Nellore between 2017 and 2025?' },
  {
    role: 'assistant',
    text: 'Reservoir surface area expanded ~12% while aquaculture ponds along the coast grew by an estimated 340 ha. Canopy loss is concentrated near the NH-16 corridor.',
  },
]

export async function askCopilot(prompt) {
  await new Promise((r) => setTimeout(r, 600))
  return {
    role: 'assistant',
    text: `[mock → ${API_BASE_URL || 'no API configured'}] Analysis for "${prompt}" will appear here once the backend is connected.`,
  }
}
