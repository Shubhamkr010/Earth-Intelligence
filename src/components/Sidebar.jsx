import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Send, Sparkles, Activity, Clock, Download, Lock, Bot, User } from 'lucide-react'
import { API_BASE_URL, MOCK_MESSAGES, MOCK_STATS, askCopilot } from '../lib/api'

const YEARS = { min: 2017, max: 2025 }

export default function Sidebar({ open, onClose }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [draft, setDraft] = useState('')
  const [year, setYear] = useState(2025)
  const [thinking, setThinking] = useState(false)

  const send = async (e) => {
    e.preventDefault()
    const prompt = draft.trim()
    if (!prompt || thinking) return
    setDraft('')
    setMessages((m) => [...m, { role: 'user', text: prompt }])
    setThinking(true)
    const reply = await askCopilot(prompt)
    setMessages((m) => [...m, reply])
    setThinking(false)
  }

  const pct = ((year - YEARS.min) / (YEARS.max - YEARS.min)) * 100

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="sidebar"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="glass absolute right-0 top-0 z-30 flex h-full w-[min(100vw,400px)] flex-col border-l border-neon/20 bg-panel/80"
        >
          <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon/10 text-neon shadow-neon-soft">
              <Sparkles size={16} />
            </span>
            <div className="flex-1">
              <h2 className="text-sm font-semibold tracking-wide text-zinc-100">AI Copilot</h2>
              <p className="font-mono text-[10px] text-zinc-500">
                api · {API_BASE_URL || 'unconfigured'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
              aria-label="Close copilot"
            >
              <X size={16} />
            </button>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <section className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Activity size={12} className="text-neon/80" />
                <span className="hud-label">Instant Stats</span>
                <span className="ml-auto font-mono text-[10px] text-zinc-500">{year}</span>
              </div>
              <p className="mb-3 text-xs text-zinc-300">
                {MOCK_STATS.region}
                <span className="ml-2 font-mono text-[10px] text-zinc-500">
                  {MOCK_STATS.coordinates.join(', ')}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MOCK_STATS.metrics.map((m) => (
                  <div key={m.label} className="rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{m.label}</p>
                    <p className="mt-1 font-mono text-base text-zinc-100">{m.value}</p>
                    <p
                      className={`font-mono text-[10px] ${
                        m.delta.startsWith('+') ? 'text-neon' : 'text-amber-400'
                      }`}
                    >
                      {m.delta}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Clock size={12} className="text-neon/80" />
                <span className="hud-label">Time Travel</span>
                <span className="ml-auto font-mono text-sm text-neon">{year}</span>
              </div>
              <input
                type="range"
                min={YEARS.min}
                max={YEARS.max}
                step={1}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="timeline w-full"
                style={{ backgroundSize: `${pct}% 100%` }}
                aria-label="Select year"
              />
              <div className="mt-2 flex justify-between font-mono text-[9px] text-zinc-600">
                {Array.from({ length: YEARS.max - YEARS.min + 1 }, (_, i) => YEARS.min + i).map((y) => (
                  <span key={y} className={y === year ? 'text-neon' : ''}>
                    {String(y).slice(2)}
                  </span>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Bot size={12} className="text-neon/80" />
                <span className="hud-label">Chat</span>
              </div>
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                      m.role === 'user' ? 'bg-white/10 text-zinc-300' : 'bg-neon/10 text-neon'
                    }`}
                  >
                    {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                  </span>
                  <p
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-white/10 text-zinc-100'
                        : 'border border-neon/15 bg-neon/5 text-zinc-200'
                    }`}
                  >
                    {m.text}
                  </p>
                </div>
              ))}
              {thinking && (
                <p className="font-mono text-[10px] text-neon/70 animate-pulse">copilot is analysing…</p>
              )}
            </section>
          </div>

          <footer className="space-y-3 border-t border-white/10 px-5 py-4">
            <form onSubmit={send} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 focus-within:border-neon/50 focus-within:shadow-neon-soft">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="ask the copilot…"
                className="flex-1 bg-transparent font-mono text-xs text-zinc-100 placeholder:text-zinc-600 outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || thinking}
                className="rounded-lg p-1.5 text-neon transition-opacity disabled:opacity-30"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </form>
            <button
              type="button"
              onClick={() => console.log('[Download report] mock', { year })}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-4 py-2.5 text-xs font-semibold tracking-wide text-neon transition-all hover:bg-neon/20 hover:shadow-neon-soft"
            >
              <Download size={14} />
              Download Full Report
              <span className="ml-1 flex items-center gap-1 rounded-md bg-neon/20 px-1.5 py-0.5 font-mono text-[9px]">
                <Lock size={9} /> PRO
              </span>
            </button>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
