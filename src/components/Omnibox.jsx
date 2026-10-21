import { useState } from 'react'
import { Search, Sparkles, Crosshair } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Omnibox({ onToggleSidebar, sidebarOpen, onSearch, shift = 0 }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    onSearch?.(query.trim())
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-6 z-20 w-[min(92vw,640px)] -translate-x-1/2">
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, x: shift, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-3 flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-neon/60" />
        <h1 className="font-mono text-[11px] uppercase tracking-[0.35em] text-neon/80">
          Select your location or point your region
        </h1>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-neon/60" />
      </div>

      <form
        onSubmit={submit}
        className={`glass pointer-events-auto flex items-center gap-2 rounded-2xl px-3 py-2 transition-all duration-300 ${
          focused ? 'shadow-neon border-neon/60' : 'shadow-neon-soft'
        }`}
      >
        <Search size={18} className={`shrink-0 transition-colors ${focused ? 'text-neon' : 'text-zinc-500'}`} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="search coordinates, city, river, reservoir…"
          spellCheck={false}
          className="flex-1 bg-transparent font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
        />
        <kbd className="hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 sm:block">
          ⏎
        </kbd>
        <button
          type="button"
          title="Locate region"
          className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-neon"
        >
          <Crosshair size={16} />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Toggle AI Copilot"
          aria-pressed={sidebarOpen}
          className={`rounded-xl p-2 transition-all duration-300 ${
            sidebarOpen
              ? 'bg-neon/15 text-neon shadow-neon-soft'
              : 'text-zinc-400 hover:bg-white/5 hover:text-neon'
          }`}
        >
          <Sparkles size={18} />
        </button>
      </form>
    </motion.div>
    </div>
  )
}
