import { useState, useMemo } from 'react'
import { useRealtimeData } from '../hooks/useRealtimeData'
import ChannelCard, { ChannelCardSkeleton } from '../components/ChannelCard'
import CategoryChips from '../components/CategoryChips'
import EmptyState from '../components/EmptyState'

export default function LiveTV(){
  const { activeChannels, categories, loading } = useRealtimeData()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')

  const filtered = useMemo(()=>{
    const byCat = cat==='all' ? activeChannels : activeChannels.filter(c=> c.categoryId===cat)
    if (!q.trim()) return byCat
    const s=q.toLowerCase()
    return byCat.filter(c=> c.name.toLowerCase().includes(s) || c.categoryId.includes(s) || (c.keywords||'').toLowerCase().includes(s))
  },[activeChannels, cat, q])

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-7">
      <div className="flex flex-wrap items-end gap-3">
        <h1 className="text-[28px] font-black tracking-[-0.03em]">LIVE TV</h1>
        <span className="mb-2 text-xs font-bold tracking-widest bg-white/5 border border-white/10 rounded-full px-3 py-1 text-zinc-400">SM TV • Live Channels</span>
      </div>
      <div className="mt-5 flex gap-3 flex-col md:flex-row md:items-center">
        <div className="relative flex-1 max-w-[640px] group">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search channels, e.g. SONY, News..." className="w-full bg-[#13131c] group-hover:bg-[#181825] border border-white/[0.08] focus:bg-[#1a1a28] focus:border-white/20 rounded-full h-[44px] pl-10 pr-4 text-sm placeholder:text-zinc-500 focus:outline-none transition" />
          <span className="absolute left-3.5 top-[11px] text-zinc-500">⌕</span>
          {q && <button onClick={()=>setQ('')} className="absolute right-2 top-1.5 bottom-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full px-3 text-xs font-bold">Clear</button>}
        </div>
        <span className="text-xs text-zinc-500 font-medium hidden md:inline">{filtered.length} results</span>
      </div>
      <div className="mt-5"><CategoryChips categories={categories} active={cat} onSelect={setCat} /></div>
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({length:18}).map((_,i)=><ChannelCardSkeleton key={i} />)}
          </div>
        ) : filtered.length===0 ? (
          <EmptyState icon="🔍" title="No Channels Found" desc="Try another search or category." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filtered.map(ch=> <ChannelCard key={ch.id} ch={ch} />)}
          </div>
        )}
      </div>
    </div>
  )
}
