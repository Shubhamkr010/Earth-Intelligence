# Earth Intelligence Portal

"Ctrl+F for Planet Earth" — a dark-mode command center for exploring any place on Earth.

## Stack

- React 19 + Vite
- [MapLibre GL JS](https://maplibre.org/) (3D globe, CARTO dark-matter basemap)
- Tailwind CSS (PostCSS + autoprefixer)
- Framer Motion, lucide-react

## Getting started

```bash
cp .env.example .env   # set VITE_API_BASE_URL to your backend
npm install
npm run dev
```

## Structure

| File | Purpose |
| --- | --- |
| `src/components/Globe.jsx` | Full-screen MapLibre globe with cyan atmosphere and idle auto-rotation |
| `src/components/Omnibox.jsx` | Frosted-glass search bar + AI Copilot toggle |
| `src/components/Lenses.jsx` | Smart Lens presets (Water, Agri, Solar) |
| `src/components/Sidebar.jsx` | AI Copilot drawer: chat, instant stats, 2017–2025 time slider, report download |
| `src/lib/api.js` | `VITE_API_BASE_URL` wiring and mock data |
