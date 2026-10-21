# DESIGN.md — Nightside (Earth Intelligence Portal)

Design system and frontend architecture specification for the **Earth Intelligence Portal**: a "Ctrl+F for Planet Earth" geospatial search engine powered by Google DeepMind's AlphaEarth Foundations dataset (`GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL`, 64-dimensional vector embeddings for every $10\text{ m} \times 10\text{ m}$ square of Earth from 2017 to 2025).

> **Instructions for the implementing agent (Devin):** This file is the single source of truth for look, feel, component architecture, and backend API wiring. Follow the tokens, typography, and layout specs exactly. Do not substitute fonts, colors, radii, or motion values. Build in this order:
> 1. MapLibre GL JS 3D Globe (`GlobeCanvas`)
> 2. Top Omnibox + Orbital Header (`Omnibox`)
> 3. Left Smart Lenses Rail (`LensesRail`) & Bottom 2017–2025 Time-Travel Scrubber (`TimelineScrubber`)
> 4. Instant Stats Leader-Line Card (`InstantStatsCard`)
> 5. Right Panel: AI Map Copilot & Region Dossier with Freemium Export Gate (`RightPanel`)

---

## 1. Concept

**Nightside** is the view of Earth from orbit at night: deep ocean blue, with human activity and matched surface features glowing warm amber (`#F5A524`). The 3D globe is the entire page. Everything else is a quiet, high-precision orbital instrument floating over it.

- **Audience:** environmental analysts, agricultural planners, solar developers, researchers, government teams, and curious explorers who want instant satellite intelligence without writing code.
- **Primary job:** search a region, activate one of the 3 Smart Lenses (or click any $10\text{ m}$ spot on Earth to find visually similar patches via cosine similarity), scrub from 2017 to 2025 to watch the landscape change, and ask the AI Map Copilot to drive the map.
- **The one memorable thing:** the 3D MapLibre globe emerging from deep space with a subtle prompt (`"Select your location or point your region"`), transitioning seamlessly down to $10\text{ m}$ farm/reservoir level, with a thin $1\text{ px}$ amber leader line connecting any clicked coordinate to its live Instant Stats card.
- **Feel:** calm, precise, expensive. Orbital mission control (Palantir MetaConstellation / NASA Earth Observatory), not a gaming HUD. No neon cyan clichés, no scanlines, no sci-fi clutter.

### Core Principles

1. **The globe is the product.** UI never covers more than $35\%$ of the viewport on desktop. Panels float with crisp borders; the globe is never cropped inside a box.
2. **Amber means "you / active target / primary action."** Amber (`--citylight`) is reserved strictly for the user's active coordinate pin, similarity target, active time year, primary export CTA, and interactive place links. Never decorative.
3. **Information, not ornament.** Every border, divider, and label encodes data. No decorative gradients or pulsing sci-fi brackets.
4. **Everything cross-links (AI Copilot + Globe + Timeline).** When the user asks the AI Copilot a question, the Copilot executes tool calls (`flyToLocation`, `setLens`, `setYear`, `runSimilaritySearch`) that physically spin the globe, toggle lenses, scrub the timeline, and update the Instant Stats card. Hovering a place name in chat highlights it on the globe.
5. **100% Free Exploration, Strictly Gated Bulk Exports ("Sample vs. Scale").** Anyone can spin the globe, use all 3 lenses, click any spot for similarity search, scrub 2017–2025, and use the AI Copilot for free without logging in. Downloading a tiny $2\text{ km} \times 2\text{ km}$ sample (top 10 rows) is free; exporting full district `.csv`, `.geojson`, or PDF reports requires Pro verification.

---

## 2. Color System

Dark mode is the default and only launch theme. All colors are defined as CSS variables and mapped to Tailwind utility classes.

### Core Palette

| Token | Name | Hex | Use |
|---|---|---|---|
| `--ocean-950` | Deep ocean | `#0A1C30` | Deep space/ocean background behind the globe, deepest surfaces |
| `--ocean-900` | Open water | `#0F2A45` | Floating panels, omnibox, Instant Stats card, timeline bar |
| `--ocean-800` | Current | `#163A5C` | Raised surfaces inside panels, hover fills, inactive switches |
| `--ocean-700` | Shelf | `#1F4A72` | Hairline borders, dividers, input outlines |
| `--frost` | Frost | `#E8F0F4` | Primary text, numerical readouts |
| `--mist` | Mist | `#9DB3C2` | Secondary text, field labels, inactive icons, citations |
| `--citylight` | City light (Amber) | `#F5A524` | Primary accent: focus ring, clicked target pin, leader line, Solar lens, primary CTA, place links |
| `--citylight-soft` | City light, soft | `#F5A52424` | Accent fills and selection highlights ($14\%$ alpha) |

### Smart Lens & Semantic Data Tokens

| Token | Name | Hex | Use |
|---|---|---|---|
| `--tide` | Tide | `#5FA8C9` | **Lens 1: Water & Reservoir Pulse**, surface water polygons, atmosphere rim glow |
| `--kelp` | Kelp | `#4CB88A` | **Lens 2: Agri & Aquaculture Atlas**, cropland/pond overlays, positive growth delta ($+$) |
| `--citylight` | Amber | `#F5A524` | **Lens 3: Solar & Green Canopy Tracker**, solar footprints, high cosine similarity ($>0.90$) |
| `--ember` | Ember | `#FF6B4A` | Water shrinkage, canopy loss, negative delta ($-$), error states |
| `--ice` | Ice | `#BFE3F2` | Selected boundary stroke on the globe, peak similarity highlight ($>0.95$) |

### Color Rules

- Text on `--ocean-900` is `--frost` (contrast ratio $\approx 13:1$) or `--mist` (contrast ratio $\approx 6.5:1$). Never use `--mist` below $12\text{ px}$.
- A primary `--citylight` button always uses `--ocean-950` dark text for high legibility.
- Never place `--citylight` (amber) next to `--ember` (red-orange) in the same badge; use `--kelp` vs `--ember` for positive/negative change deltas.
- Semantic data colors (`--tide`, `--kelp`, `--ember`) are strictly for map overlays, lens indicators, and stat deltas—never for panel chrome.

---

## 3. Typography

Two font families loaded via Google Fonts (`index.html`):

| Role | Family | Weights | Source |
|---|---|---|---|
| UI, headings, & AI prose | **Schibsted Grotesk** | 400, 500, 600, 700 | Google Fonts |
| Coordinates, years, similarity scores, stats | **Geist Mono** (`font-variant-numeric: tabular-nums`) | 400, 500 | Google Fonts |

Fallbacks:
- `--font-ui`: `"Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif`
- `--font-data`: `"Geist Mono", ui-monospace, "SF Mono", monospace`

### Type Scale

| Token | Size / Line Height | Weight | Tracking | Use |
|---|---|---|---|---|
| `display` | `36px / 42px` | 600 | `-0.02em` | Initial orbital landing prompt only |
| `title-1` | `26px / 30px` | 600 | `-0.02em` | Dossier region header |
| `title-2` | `20px / 26px` | 600 | `-0.015em` | Instant Stats card title |
| `body-lg` | `15px / 23px` | 400 | `0` | AI Copilot answers, dossier summaries |
| `body` | `14px / 20px` | 400 | `0` | Default UI text, omnibox input |
| `label` | `12px / 16px` | 500 | `0.01em` | Sentence-case field labels, lens legends, source lines |
| `data` | `13px / 16px` | 500 | `0` | `Geist Mono` tabular numerals: coordinates, hectares, similarity scores, years |

### Typography Rules

- **Sentence case everywhere.** Never use all-caps tracking-wide labels for section headers.
- **Tabular numbers (`tabular-nums`)** are mandatory on all coordinates, similarity sliders, and year scrubbers so numbers never jitter when scrubbing 2017–2025 or moving the cursor.
- Maximum line width is `68ch` inside the AI Copilot and Dossier panels.

---

## 4. Shape, Spacing, & Elevation

### Spacing Scale

$4\text{ px}$ base unit: use `4, 8, 12, 16, 20, 24, 32, 48`.
- Floating panel padding: `20px`
- Instant Stats card padding: `16px`
- List row gap: `8px`

### Border Radius Hierarchy

| Element | Radius | Token |
|---|---|---|
| Large floating panels (Right Copilot/Dossier panel, Export Modal) | `20px` | `--radius-panel` |
| Omnibox, Instant Stats card, Time-Travel Scrubber bar | `16px` | `--radius-card` |
| Buttons, inputs, lens rows, inline stat blocks | `10px` | `--radius-control` |
| Suggested prompt pills, year badges, kbd hints | `999px` | `--radius-chip` |
| Citation chips `[1]` | `6px` | `6px` |

### Elevation & Glass Surface

Surfaces separate from the dark globe primarily through crisp $1\text{ px}$ borders and deep ocean shadows:

```css
--shadow-float: 0 1px 0 0 rgba(232, 240, 244, 0.05) inset,
                0 14px 44px -8px rgba(2, 10, 20, 0.72),
                0 2px 10px rgba(2, 10, 20, 0.45);
--border-subtle: 1px solid rgba(31, 74, 114, 0.45); /* --ocean-700 at 45% */
--border-strong: 1px solid #1F4A72;
```

Floating panels use `background: rgba(15, 42, 69, 0.88)` (`--ocean-900` at $88\%$ opacity) with `backdrop-filter: blur(14px) saturate(1.1)`.

---

## 5. Viewport Layout Architecture

The MapLibre 3D globe is `position: fixed; inset: 0` behind all UI. All controls float at the perimeter with `16px` screen margins:

```text
+------------------------------------------------------------------------+
| [Earth Intelligence]   Select your location or point your region       |
|                     +--------------------------------------+  [Export] |
|                     | Search place, coords, or ask AI... ⌘K|           |
|                     +--------------------------------------+           |
| +----+                                                +--------------+ |
| | 💧 |                                                | [Copilot|Dos]| |
| | 🌾 |                 ( 3D MAPLIBRE GLOBE )          |              | |
| | ☀️ |                       * ---+                   |  AI Map      | |
| | 🎯 |                            v                   |  Copilot &   | |
| +----+              +---------------------------+     |  Region      | |
| Lenses              | Nellore Tank Cluster      |     |  Dossier     | |
| Rail                | 412 matches | +18.4%      |     |  (400px)     | |
|                     +---------------------------+     |              | |
|                                                       |  [Ask AI...] | |
| [14.4426 N, 79.9865 E | 10m]   [2017 ===●== 2025]     +--------------+ |
+------------------------------------------------------------------------+
```

- **Top Left (`16px` inset):** Minimal brand mark (`Earth Intelligence` in `Schibsted Grotesk` 600 + small amber orbital dot) and active dataset badge (`AlphaEarth v1 · 10m`).
- **Top Center (`16px` from top):**
  - **Orbital Prompt Banner:** Reads `"Select your location or point your region"` in `label` (`--mist`) directly above the Omnibox when the globe is at orbital zoom ($\text{zoom} < 5$); smoothly fades out once the user zooms into a region.
  - **Omnibox:** `560px` wide, handles location search, coordinates, and AI Copilot commands.
- **Left Center (`16px` from left):** **Smart Lenses Rail**, `56px` wide collapsed (icon-only with tooltips), expandable to `260px` showing the 3 Preset Smart Lenses + the Custom Visual Similarity Sandbox toggle.
- **Bottom Center (`16px` from bottom):** **2017–2025 Time-Travel Scrubber** (`480px` wide), allowing instant year selection across the 8-year AlphaEarth annual embedding archive, plus a `Compare vs 2017` delta toggle.
- **Bottom Left (`16px` inset):** Live mono telemetry bar showing cursor `lat, lon`, current altitude/zoom scale, and active cosine similarity threshold (e.g., `Sim >= 0.85`).
- **Right (`16px` inset top/right/bottom):** **Unified Right Drawer (`400px` wide)** with two top-level tabs: **AI Copilot** and **Region Dossier**. Collapses to a sleek floating pill (`Ask Copilot / View Dossier`) in the top-right when closed.

---

## 6. The 3D Globe (`GlobeCanvas.jsx`)

### Mandatory Engine: MapLibre GL JS (v5+)

Use `maplibre-gl` (`v5.0+`) so the user gets both a true 3D orbital globe in space **and** seamless street/farm-level zooming down to $10\text{ m}$ satellite resolution where Google Earth Engine XYZ similarity tiles (`tile_url`) are rendered.

1. **Projection:** On map `load`, immediately enable globe projection:
   ```js
   map.setProjection({ type: 'globe' });
   ```
2. **Basemap & Nightside Styling:**
   - Base style: Carto Dark Matter (`https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`) with custom layer overrides applied on load so water surfaces render in `--ocean-950` (`#0A1C30`), land renders in deep midnight slate (`#071422`), country/state borders render in `--ocean-700` (`#1F4A72` at $35\%$ opacity), and major roads/labels fade in smoothly above $\text{zoom } 6$ in `--mist`.
   - Option to toggle a high-res satellite imagery basemap layer (ESRI World Imagery / Sentinel-2 cloudless) at $\text{zoom} \ge 10$ with $75\%$ opacity so users can inspect actual reservoirs, aquaculture ponds, and solar arrays underneath the AlphaEarth vector similarity heatmap.
3. **Atmosphere & Space Environment:**
   Configure MapLibre sky/fog (and CSS canvas background) to match the Nightside orbital spec:
   - Deep space background: `--ocean-950` (`#0A1C30`) with a subtle radial vignette to `#040B14` at screen edges and a sparse static starfield canvas ($350$ stars, $1\text{ px}$, $20\%\text{–}50\%$ opacity, no twinkling).
   - Atmosphere rim: thin fresnel glow around the globe limb tinted to `--tide` (`#5FA8C9` at $14\%$ alpha).
4. **Camera & Rotation Behavior:**
   - **Initial view:** Centered over the Indian subcontinent / Bay of Bengal (`center: [80.0, 15.5]`, `zoom: 2.1`, `pitch: 25`).
   - **Orbital spin:** Gently rotates eastward at $0.5^\circ\text{/sec}$ when $\text{zoom} < 4$ and the user is not interacting. Immediately pauses on pointer down, hover over a pinned patch, or when an Omnibox/Copilot command triggers.
   - **Fly-to transition:** `map.flyTo({ center: [lon, lat], zoom: targetZoom, speed: 1.3, curve: 1.42, essential: true })`. When the right drawer (`400px`) is open, apply `padding: { right: 420 }` so the target coordinate centers nicely in the visible canvas area.

### AlphaEarth XYZ Tile Layer & "Click Any Spot" Sandbox

- **Dynamic Raster Overlay (`alphaearth-similarity-layer`):** Whenever the backend `/api/similarity` or `/api/lens` returns a Google Earth Engine `tile_url`, mount or update a MapLibre raster source (`tileSize: 256`) rendered with smooth opacity (`0.82`) colored according to the active lens (`--tide` for Water, `--kelp` for Agri, `--citylight` for Solar/Custom Similarity).
- **Click-to-Search ("Ctrl+F" Sandbox):**
  - Clicking any spot on the globe drops a high-precision target marker: an $8\text{ px}$ solid `--citylight` (`#F5A524`) center dot ringed by a $2\text{ px}$ `--ocean-950` border and an outer $18\text{ px}$ `--citylight-soft` ring that pulses once ($1 \to 1.6$ scale over $500\text{ ms}$, never looping).
  - Draws a crisp $1\text{ px}$ `--citylight` SVG leader line (`200ms` stroke-dashoffset animation) from the screen-projected coordinate (`map.project([lng, lat])`) to the corner of the floating **Instant Stats Card**.

---

## 7. Components Specification

### 7.1 Top Omnibox (`Omnibox.jsx`)

A single unified command bar (`560px` wide $\times$ `48px` high, `--radius-card` `16px`) that handles three distinct user intents automatically:

| Input Pattern | Detected Intent | Action on `Enter` |
|---|---|---|
| Place or District name (`"Nellore"`, `"Warangal"`, `"Rajasthan"`) | **Location Search** | Flies camera to the region (`zoom: 10`), updates context chip, and loads regional stats |
| Coordinate pair (`"14.44, 79.98"` or `"17.97N, 79.59E"`) | **Direct Coordinate Pin** | Flies camera to exact $10\text{ m}$ cell (`zoom: 13`), drops amber pin, triggers similarity search |
| Natural language query (`"Show how water reservoirs changed in Nellore since 2018"`, `"Find largest solar parks in Kurnool"`) | **AI Map Copilot Command** | Opens the AI Copilot drawer, sends prompt to `/api/copilot`, and executes returned map tool calls (`flyToLocation`, `setLens`, `setYear`) |

- **Orbital Header Text:** Above the omnibox, display `"Select your location or point your region"` in `13px` `--mist` (`font-ui` weight 500). Hide gracefully once a location is active.
- **Placeholder:** `Search a region, paste coordinates, or ask the AI Copilot...`
- **Right Controls:** Keyboard shortcut badge `⌘K` / `Ctrl+K` (or `/`) to focus from anywhere, plus an amber-tinted **Copilot Drawer toggle button** (`Sparkles` / `Terminal` icon from `lucide-react`).
- **Focus State:** Border transitions to `--citylight` (`#F5A524`) with a $3\text{ px}$ `--citylight-soft` ring. No blurry neon glow.
- **Autocomplete Dropdown:** Up to 6 rows grouped by **Locations**, **Smart Lenses**, and **Ask AI Copilot**. Active row uses `--ocean-800` fill with a $2\text{ px}$ `--citylight` left accent bar.

### 7.2 Smart Lenses Rail (`LensesRail.jsx`)

Docked vertically on the left edge (`16px` inset). Collapsed width `56px` (icon buttons with instant tooltips), or expanded width `260px` via a subtle collapse/expand chevron.

Contains **4 mutually exclusive intelligence modes**:

1. **Water & Reservoir Pulse** (`Droplets` icon, accent `--tide` `#5FA8C9`)
   - *Subtitle:* Surface tanks, lakes, & seasonal storage
2. **Agri & Aquaculture Atlas** (`Sprout` icon, accent `--kelp` `#4CB88A`)
   - *Subtitle:* Cropland, orchards, & shrimp/fish ponds
3. **Solar & Green Canopy Tracker** (`Sun` icon, accent `--citylight` `#F5A524`)
   - *Subtitle:* Solar parks, clean energy, & afforestation
4. **Visual Similarity Sandbox ("Ctrl+F")** (`Crosshair` icon, accent `--ice` `#BFE3F2`)
   - *Subtitle:* Click any $10\text{ m}$ spot to find identical terrain

- **Active Lens Legend (Bottom Left above telemetry):** When a lens is active, display a compact horizontal gradient bar ($120\text{ px}$ wide) showing similarity intensity (`0.75` to `1.00`) in `Geist Mono` `11px`.

### 7.3 2017–2025 Time-Travel Scrubber (`TimelineScrubber.jsx`)

Docked at the bottom center (`480px` wide $\times$ `52px` high, `--radius-card` `16px`, panel glass background).

- **Year Track:** Interactive discrete year stops for **`2017`, `2018`, `2019`, `2020`, `2021`, `2022`, `2023`, `2024`, `2025`** rendered in `Geist Mono` (`tabular-nums`).
- **Active Year Pill:** Highlighted in solid `--citylight` (`#F5A524`) with `--ocean-950` bold text.
- **Play / Scrub Control:** A `32px` play/pause button on the left that steps through 2017 to 2025 at $900\text{ ms}$ per year so users can animate reservoir filling, aquaculture expansion, or solar farm construction.
- **Baseline Delta Toggle:** A compact pill on the right (`Δ vs 2017`) that highlights net $8\text{-year}$ expansion in `--kelp` and shrinkage in `--ember`.

### 7.4 Instant Stats Card (`InstantStatsCard.jsx`)

Anchored to the clicked or selected globe coordinate via a dynamically positioned $1\text{ px}$ `--citylight` SVG leader line. Width `330px`, `--radius-card` `16px`, padding `16px`. Flips automatically to whichever side of the pin has more viewport space.

```text
+--------------------------------------------------+
| Nellore Surface Water Cluster                  x |  title-2 (frost)
| Andhra Pradesh, India · Water Pulse (2024)       |  label (mist)
| 14.4426 deg N, 79.9865 deg E · 10m Embedding     |  data (mist, Geist Mono)
| ------------------------------------------------ |
| Matching patches   Matched area    Change (2017) |  label (mist)
| 412                3,840 ha        +18.4%        |  data (frost / kelp)
| ------------------------------------------------ |
| Similarity threshold: [======●===] 0.86          |  data slider (sandbox)
|                                                  |
| [ Open dossier & export ]    Ask Copilot ->      |  actions
+--------------------------------------------------+
```

- **Three Core Metrics (Always Tabular Mono):**
  1. `Matching patches` (count of contiguous $10\text{ m}$ vector clusters above threshold)
  2. `Matched area` (in $\text{ha}$ or $\text{km}^2$)
  3. `Change since 2017` (percentage delta tinted `--kelp` for growth or `--ember` for decline)
- **Cosine Similarity Threshold Slider:** Interactive range input (`0.75` to `0.98`, step `0.01`, default `0.85`). Adjusting it re-queries or filters the AlphaEarth dot-product mask in real time.
- **Card Actions:**
  - Primary button (`--citylight` fill): `Open dossier & export` (opens the Right Drawer to the Dossier tab).
  - Secondary text button: `Ask Copilot` (sends the coordinate and active lens into the AI Copilot chat context).

### 7.5 Unified Right Drawer: AI Map Copilot & Region Dossier (`RightPanel.jsx`)

Docked on the right (`400px` wide, `16px` inset top/right/bottom, `--radius-panel` `20px`). Features a clean top segmented switcher: **`AI Copilot`** | **`Region Dossier`**.

#### Tab A: AI Map Copilot (`CopilotTab.jsx`)

Designed as a rigorous satellite analyst's notebook—no cartoon avatars, no speech bubbles.

- **Context Chip:** Below the header, displays the locked spatial context: `Context: Nellore (14.44N, 79.98E) · Water · 2024` with an `×` button to clear.
- **Tool-Calling Action Log:** When the user sends a prompt (e.g., *"Show me how water reservoirs changed in Nellore since 2018"*), the Copilot executes frontend map controllers and renders compact, plain-language status pills in `Geist Mono` `12px` (`--mist`) with a tiny amber indicator dot:
  - `-> Calling flyToLocation(14.4426, 79.9865, zoom=11)`
  - `-> Activating lens: Water & Reservoir Pulse`
  - `-> Comparing AlphaEarth embeddings: 2018 vs 2025`
- **Message Formatting:**
  - User turns: `body-lg` in `--frost` with a $2\text{ px}$ `--ocean-700` left border.
  - Assistant turns: `body-lg` prose directly on the panel surface. Any location mentioned (e.g., `Somasila Reservoir`, `Kandaleru`) is styled as an underlined `--citylight` amber link—hovering it highlights the coordinate on the globe; clicking it flies the camera there.
  - Citation chips `[AlphaEarth v1]` or `[Sentinel-2]` in `Geist Mono` `11px` (`--ocean-800` fill).
- **Suggested Starter Prompts (when empty):**
  - `"Show how water reservoirs changed in Nellore since 2018"`
  - `"Where are the largest solar farms in Rajasthan?"`
  - `"Find aquaculture pond expansion along the Andhra coast"`
- **Composer:** Auto-expanding textarea at the bottom (`Enter` to send, `Shift+Enter` for newline) with a solid `--citylight` send button.

#### Tab B: Region Dossier & The Freemium Export Gate (`DossierTab.jsx`)

Displays deep multi-year analytical breakdowns for the active region or similarity search, culminating in the **"Sample vs. Scale" Freemium Monetization Wall**.

- **Header:** Region title (`title-1`), bounding box coordinates (`data`), active lens badge, and a `Compare years` toggle.
- **Section 1 — 2017–2025 Trajectory Chart:** A clean SVG sparkline/bar chart showing matched surface area ($\text{ha}$) for each year from `2017` to `2025`. Bars use `--tide` (or active lens color), with the currently selected year highlighted in `--citylight`.
- **Section 2 — Top Matched Coordinates Preview Table:**
  - Shows a preview of the top **10 matching coordinates** (`Rank`, `Lat / Lon`, `Cosine Similarity`, `Est. Area ha`) in `Geist Mono`.
  - Below row 10, display a subtle locked row indicator: `+ 402 additional matching patches in this district (Full export required)`.
- **Section 3 — Data Provenance:**
  - `Source: Google DeepMind AlphaEarth Foundations (GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL), 10m resolution, 64-D unit-norm cosine similarity.`
- **Section 4 — The "Sample vs. Scale" Export Gate (Sticky Bottom Footer):**
  Two distinct tiers designed to give immediate value while preventing burner-account scraping:
  1. **Free Sample Button (Secondary style — `--ocean-800` fill, `--frost` text, $1\text{ px}$ `--ocean-700` border):**
     - Label: `Download 2 km x 2 km sample (.csv)`
     - Behavior: Immediately downloads a watermarked sample `.csv` capped strictly at the **top 10 coordinates** within a $2\text{ km} \times 2\text{ km}$ bounding box—no login required.
  2. **Full District Pro Export Button (Primary style — `--citylight` `#F5A524` fill, `--ocean-950` bold text):**
     - Label: `Export full district (.geojson / .csv / PDF)`
     - Behavior: Opens the **Pro Export & Verification Modal** (`ExportModal.jsx`).

### 7.6 Pro Export & B2B Trial Modal (`ExportModal.jsx`)

When a user clicks `Export full district`, open a centered `460px` modal over a blurred backdrop:

- Explains what is included in the full export: all $412+$ matched polygon boundaries (`.geojson`), complete coordinate centroids with 2017–2025 annual change trajectories (`.csv`), and an executive satellite intelligence brief (`.pdf`).
- Offers two paths:
  1. **Instant Single-District Purchase / Pro Unlock** (pricing tier preview).
  2. **B2B / Government Verified Trial Credit:** Input fields for **Work / Gov Email** (client-side validation rejecting free burner domains like `@gmail.com`, `@yahoo.com`, `@outlook.com`, `@temp-mail.org` with a clear message: *"Please enter a corporate, academic, or government email domain"*) + **Phone SMS/WhatsApp OTP verification** to prevent account cycling.

---

## 8. Motion & Micro-Interactions

Motion either responds directly to user input or performs the single initial orbital entry. Nothing loops except the slow orbital spin at low zoom.

| Interaction | Specification |
|---|---|
| **Initial Orbital Load** | Globe starts at `zoom: 2.1` rotating at $0.5^\circ\text{/sec}$. Omnibox and rails fade in over $400\text{ ms}$ (`cubic-bezier(0.22, 1, 0.36, 1)`). |
| **Instant Stats Card & Leader Line** | Pin ring scales $1 \to 1.6$ once ($500\text{ ms}$). SVG leader line draws in $200\text{ ms}$. Card fades and scales $0.98 \to 1.0$ in $160\text{ ms}$. |
| **Right Drawer Open/Close** | `280ms` `cubic-bezier(0.22, 1, 0.36, 1)`, `translateX(16px)` + opacity. |
| **Fly To Coordinate** | MapLibre `flyTo` (`duration: 1400ms`), smoothly tilting pitch from $25^\circ$ to $40^\circ$ at local zoom. |
| **Year Scrubber Step** | Updating year immediately swaps/crossfades the XYZ tile layer (`150ms` opacity transition) and updates tabular numbers in place without layout shift. |

Respect `prefers-reduced-motion: reduce`: disable orbital auto-spin and replace `flyTo` arcs with `300ms` `easeTo` transitions.

---

## 9. Frontend State & Backend API Contract

### Shared Zustand Store (`usePortalStore.js`)

All components read and mutate a single store so the Omnibox, Globe, Timeline, Instant Stats Card, and AI Copilot stay 100% synchronized:

```js
{
  // Spatial & Camera State
  camera: { lat: 15.5, lon: 80.0, zoom: 2.1, pitch: 25 },
  focusedPlace: null, // { name, region, lat, lon, bbox }
  selectedPoint: null, // { lat, lon, screenX, screenY }

  // Intelligence Engine State
  activeLens: 'water', // 'water' | 'agri' | 'solar' | 'sandbox'
  selectedYear: 2024,  // 2017..2025
  compareWith2017: true,
  similarityThreshold: 0.85, // 0.75..0.98
  tileUrl: null, // XYZ tile URL from FastAPI / Google Earth Engine
  isQueryingEngine: false,

  // Live Metrics for Instant Stats & Dossier
  instantStats: {
    title: 'Nellore Surface Water Cluster',
    region: 'Andhra Pradesh, India',
    matchingPatches: 412,
    areaHectares: 3840,
    changeSince2017Pct: 18.4,
    yearlySeries: [
      { year: 2017, area: 3243 },
      { year: 2018, area: 3310 },
      { year: 2019, area: 3405 },
      { year: 2020, area: 3590 },
      { year: 2021, area: 3680 },
      { year: 2022, area: 3710 },
      { year: 2023, area: 3795 },
      { year: 2024, area: 3840 },
      { year: 2025, area: 3910 }
    ],
    topCoordinates: [] // Top 10 preview rows for free sample & dossier table
  },

  // UI Panels
  rightDrawerOpen: false,
  rightDrawerTab: 'copilot', // 'copilot' | 'dossier'
  exportModalOpen: false,

  // Copilot Controller Actions (callable by AI tool-calling responses)
  flyToLocation: (lat, lon, zoom, placeName) => {},
  setLens: (lensId) => {},
  setYear: (year) => {},
  runSimilaritySearch: (lat, lon, threshold) => {}
}
```

### FastAPI Backend Integration (`VITE_API_BASE_URL`)

Read `import.meta.env.VITE_API_BASE_URL` (defaulting to `http://127.0.0.1:8000`). Include a graceful **Fallback Simulation Mode**: if the backend is unreachable or offline during cloud preview, automatically resolve queries using realistic pre-computed AlphaEarth mock payloads (covering Nellore water reservoirs, Warangal cropland, Rajasthan Bhadla solar park, and coastal Andhra aquaculture) so the UI, XYZ heatmap overlay, leader-line card, and AI Copilot tool-calling work 100% interactively out of the box.

1. **`POST /api/similarity`**
   - Request: `{ "lat": 14.4426, "lon": 79.9865, "year": 2024, "lens": "water", "threshold": 0.85 }`
   - Response: `{ "status": "success", "data": { "tile_url": "https://earthengine.googleapis.com/...", "stats": { ... }, "top_10_sample": [ ... ] } }`
2. **`POST /api/copilot`**
   - Request: `{ "message": "Show how water reservoirs changed in Nellore since 2018", "context": { "lat": 14.44, "lon": 79.98, "year": 2024, "lens": "water" } }`
   - Response:
     ```json
     {
       "reply": "Water storage across Nellore district expanded by +18.4% between 2018 and 2025, driven by high retention in Somasila Reservoir and surrounding tank cascades [AlphaEarth v1].",
       "tool_calls": [
         { "tool": "flyToLocation", "args": { "lat": 14.4426, "lon": 79.9865, "zoom": 10.5, "name": "Nellore, Andhra Pradesh" } },
         { "tool": "setLens", "args": { "lens": "water" } },
         { "tool": "setYear", "args": { "year": 2025 } }
       ],
       "citations": ["AlphaEarth Foundations Annual v1 (10m)", "Sentinel-2 Surface Reflectance"]
     }
     ```

---

## 10. Implementation Reference

### CSS Variables (`src/index.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap');

:root {
  --ocean-950: #0A1C30;
  --ocean-900: #0F2A45;
  --ocean-800: #163A5C;
  --ocean-700: #1F4A72;
  --frost: #E8F0F4;
  --mist: #9DB3C2;
  --citylight: #F5A524;
  --citylight-soft: rgba(245, 165, 36, 0.14);
  --tide: #5FA8C9;
  --kelp: #4CB88A;
  --ember: #FF6B4A;
  --ice: #BFE3F2;

  --font-ui: "Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-data: "Geist Mono", ui-monospace, "SF Mono", monospace;

  --radius-panel: 20px;
  --radius-card: 16px;
  --radius-control: 10px;
  --radius-chip: 999px;

  --shadow-float: 0 1px 0 0 rgba(232, 240, 244, 0.05) inset,
                  0 14px 44px -8px rgba(2, 10, 20, 0.72),
                  0 2px 10px rgba(2, 10, 20, 0.45);
}

body {
  margin: 0;
  background-color: var(--ocean-950);
  color: var(--frost);
  font-family: var(--font-ui);
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

.font-data {
  font-family: var(--font-data);
  font-variant-numeric: tabular-nums;
}
```

### Tailwind Config (`tailwind.config.js`)

```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: "#0A1C30",
          900: "#0F2A45",
          800: "#163A5C",
          700: "#1F4A72",
        },
        frost: "#E8F0F4",
        mist: "#9DB3C2",
        citylight: "#F5A524",
        tide: "#5FA8C9",
        kelp: "#4CB88A",
        ember: "#FF6B4A",
        ice: "#BFE3F2",
      },
      fontFamily: {
        ui: ["Schibsted Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        data: ["Geist Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        panel: "20px",
        card: "16px",
        control: "10px",
      },
    },
  },
  plugins: [],
};
```

### Component Directory Structure

```text
src/
  components/
    globe/
      GlobeCanvas.jsx        # MapLibre GL v5 3D globe, Nightside styling, click pins, XYZ overlay
      LeaderLineOverlay.jsx  # SVG 1px amber leader line connecting active coordinate to InstantStatsCard
    omnibox/
      Omnibox.jsx            # Triple-intent command bar + orbital header prompt + autocomplete
    lenses/
      LensesRail.jsx         # Left vertical rail for the 3 Smart Lenses + Visual Similarity Sandbox
      TimelineScrubber.jsx   # Bottom 2017-2025 time-travel bar + Play animation + Delta toggle
    stats/
      InstantStatsCard.jsx   # Floating leader-line card with 3 tabular metrics + similarity slider
    panel/
      RightPanel.jsx         # 400px unified drawer with Copilot | Dossier tabs
      CopilotTab.jsx         # Analyst notebook chat, tool-call execution log, amber place links
      DossierTab.jsx         # 2017-2025 trajectory chart, top 10 preview table, Freemium Export Gate
    modals/
      ExportModal.jsx        # Sample vs. Scale modal: corporate email validator + OTP gate for full export
  store/
    usePortalStore.js        # Zustand global state & AI Copilot tool-call controllers
  services/
    api.js                   # FastAPI client with automatic offline AlphaEarth fallback simulation
```

---

## 11. Do and Don't Rules for Devin

**Do:**
- Use MapLibre GL JS with `map.setProjection({ type: 'globe' })` so the globe spins in 3D space and zooms all the way down to $10\text{ m}$ local patches.
- Reserve `--citylight` (`#F5A524`) strictly for the active target pin, leader line, active year pill, primary export CTA, and clickable place links.
- Make the AI Copilot physically drive the globe (`flyToLocation`, `setLens`, `setYear`) when the user submits a query or clicks a suggested prompt.
- Enforce the "Sample vs. Scale" freemium rules: clicking `Download 2 km x 2 km sample (.csv)` downloads an actual 10-row sample CSV file immediately; clicking `Export full district` opens the verification modal blocking free `@gmail.com`/`@yahoo.com` domains for full trial exports.

**Don't:**
- Don't use neon cyan (`#06b6d4`), gaming HUD brackets, scanlines, or looping radar pulses.
- Don't use all-caps labels or centered text inside cards or panels.
- Don't leave buttons as dead mocks—wire every lens, year button (`2017`–`2025`), similarity slider, sample CSV download, and Copilot prompt to live reactive state in `usePortalStore`.

---

## 12. Acceptance Checklist

- [ ] 3D MapLibre globe renders in `--ocean-950` deep space with `--tide` atmosphere rim and smooth orbital spin
- [ ] Orbital header `"Select your location or point your region"` sits cleanly above the Omnibox on load
- [ ] Omnibox parses place names, coordinates, and natural-language AI questions (`⌘K` / `Ctrl+K` shortcut works)
- [ ] Left rail switches between the 3 Preset Smart Lenses (`Water`, `Agri`, `Solar`) and `Visual Similarity Sandbox`
- [ ] Clicking any point on the globe drops an amber pin, draws a $1\text{ px}$ amber SVG leader line, and opens the `InstantStatsCard`
- [ ] Bottom `2017–2025` Time-Travel Scrubber steps and animates through years, updating stats and map overlays in real time
- [ ] AI Copilot executes visible tool calls (`flyToLocation`, `setLens`, `setYear`) and renders clickable amber place links
- [ ] Dossier tab displays the 2017–2025 area trajectory chart, top 10 coordinates preview, working 10-row sample `.csv` download, and the Pro Export verification modal