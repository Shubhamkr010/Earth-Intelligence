import { useState } from 'react'
import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'

const LENSES = [
  { id: 'water', emoji: '💧', label: 'Water & Reservoir Pulse' },
  { id: 'agri', emoji: '🌾', label: 'Agri & Aquaculture Atlas' },
  { id: 'solar', emoji: '☀️', label: 'Solar & Green Canopy Tracker' },
]

export default function Lenses({ onSelect, shift = 0 }) {
  const [active, setActive] = useState(null)

  const pick = (lens) => {
    const next = active === lens.id ? null : lens.id
    setActive(next)
    console.log('[Lens selected]', next ? lens : 'none')
    onSelect?.(next ? lens : null)
  }

  return (
    <div className="absolute bottom-6 left-1/2 z-20 w-[min(94vw,760px)] -translate-x-1/2">
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, x: shift, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="glass rounded-2xl p-2">
        <div className="mb-2 flex items-center gap-2 px-2 pt-1">
          <Layers size={12} className="text-neon/70" />
          <span className="hud-label">Smart Lenses</span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulseDot" />
            {active ? 'LENS ACTIVE' : 'STANDBY'}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {LENSES.map((lens) => {
            const on = active === lens.id
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => pick(lens)}
                className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-300 ${
                  on
                    ? 'border-neon/60 bg-neon/10 shadow-neon-soft'
                    : 'border-white/5 bg-white/[0.02] hover:border-neon/30 hover:bg-white/[0.05]'
                }`}
              >
                <span className="text-xl leading-none">{lens.emoji}</span>
                <span className={`text-xs font-medium leading-tight ${on ? 'text-neon' : 'text-zinc-300'}`}>
                  {lens.label}
                </span>
                {on && (
                  <motion.span
                    layoutId="lens-indicator"
                    className="absolute inset-x-3 bottom-0 h-px bg-neon shadow-[0_0_8px_#22d3ee]"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
    </div>
  )
}
