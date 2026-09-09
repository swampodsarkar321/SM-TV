import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useRealtimeData } from '../hooks/useRealtimeData'
import ChannelCard from '../components/ChannelCard'
import EmptyState from '../components/EmptyState'
import { useApp } from '../contexts/AppContext'

export default function SearchPage(){
  const [params] = useSearchParams()
  const initial = params.get('q') || ''
  const { activeChannels } = useRealtimeData()
  const { search, setSearch } = useApp()
  const [q, setQ] = useState(initial || search)

  const filtered = useMemo(()=>{
    const s=(q||search).trim().toLowerCase()
    if(!s) return activeChannels.slice(0,12)
    return activeChannels.filter(c=> c.name.toLowerCase().includes(s) || c.categoryId.toLowerCase().includes(s) || (c.keywords||'').toLowerCase().includes(s))
  },[q, search, activeChannels])

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">
      <h1 className="text-xl font-black">Search</h1>
      <div className="mt-4 relative max-w-[560px]">
        <input value={q} onChange={e=>{setQ(e.target.value); setSearch(e.target.value)}} placeholder="Search channels..." className="w-full bg-[#14141f] border border-white/10 rounded-full h-11 pl-10 pr-4 text-sm focus:outline-none focus:border-white/20" />
        <span className="absolute left-3.5 top-3 text-zinc-500">🔍</span>
      </div>
      <div className="mt-6">
        {filtered.length===0 ? <EmptyState icon="🔍" title="No Channels Found" desc="Try another search." /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map(ch=> <ChannelCard key={ch.id} ch={ch} />)}
          </div>
        )}
      </div>
    </div>
  )
}
