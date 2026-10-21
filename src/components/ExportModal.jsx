import { useState } from 'react'
import { X } from 'lucide-react'
import { usePortalStore } from '../store/usePortalStore'

const blockedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'temp-mail.org']

export default function ExportModal() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const open = usePortalStore((state) => state.exportModalOpen)
  if (!open) return null
  const verify = (event) => {
    event.preventDefault()
    const domain = email.split('@')[1]?.toLowerCase()
    if (!email.includes('@') || blockedDomains.includes(domain)) {
      setError('Please enter a corporate, academic, or government email domain')
      return
    }
    setError('Verification will be sent to your work email when the export service is connected.')
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) usePortalStore.setState({ exportModalOpen: false }) }}>
    <section role="dialog" aria-modal="true" aria-labelledby="export-title" className="surface w-full max-w-[460px] rounded-panel p-5 sm:p-6">
      <header className="mb-4 flex items-start gap-3"><div className="flex-1"><h2 id="export-title" className="text-xl font-semibold text-frost">Full district export</h2><p className="mt-2 text-sm leading-5 text-mist">Unlock all matched polygon boundaries, annual coordinate trajectories, and an executive satellite intelligence brief.</p></div><button type="button" onClick={() => usePortalStore.setState({ exportModalOpen: false })} aria-label="Close export dialog" className="text-mist hover:text-frost"><X size={18} /></button></header>
      <div className="space-y-2 rounded-control border border-ocean-700 bg-ocean-950/50 p-3 text-xs leading-5 text-mist"><p><span className="text-frost">GeoJSON:</span> all matched polygon boundaries</p><p><span className="text-frost">CSV:</span> centroids and 2017–2025 change trajectories</p><p><span className="text-frost">PDF:</span> executive satellite intelligence brief</p></div>
      <div className="mt-4 rounded-control border border-ocean-700 p-3"><p className="font-medium text-frost">Single-district Pro unlock</p><p className="mt-1 text-xs text-mist">Purchase or verify a B2B / government trial credit.</p></div>
      <form onSubmit={verify} className="mt-4 space-y-3"><label className="block text-xs text-mist" htmlFor="work-email">Work / government email</label><input id="work-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} required placeholder="name@organization.org" className="w-full rounded-control border border-ocean-700 bg-ocean-950/70 px-3 py-2.5 text-sm text-frost outline-none focus:border-citylight" />{error && <p role="status" className="text-xs text-ember">{error}</p>}<button type="submit" className="w-full rounded-control bg-citylight px-4 py-2.5 text-sm font-semibold text-ocean-950">Verify trial eligibility</button><p className="text-[11px] leading-4 text-mist">Phone SMS / WhatsApp verification is required for trial credits.</p></form>
    </section>
  </div>
}