import { Link } from 'react-router-dom'
import { useRealtimeData } from '../hooks/useRealtimeData'
import FeaturedCarousel from '../components/FeaturedCarousel'
import ChannelCard, { ChannelCardSkeleton } from '../components/ChannelCard'
import CategoryChips from '../components/CategoryChips'
import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import MaintenanceScreen from '../components/MaintenanceScreen'
import { HomeSkeleton } from '../components/Skeleton'

export default function Home(){
  const { activeChannels, featuredChannels, categories, maintenance, loading } = useRealtimeData()
  const { continueWatching } = useApp()
  const [activeCat, setActiveCat] = useState('all')

  if (loading) return <div className="max-w-[1320px] mx-auto px-4 py-6"><HomeSkeleton/></div>
  if (maintenance.enabled) return <MaintenanceScreen message={maintenance.message} onRetry={()=>location.reload()} />

  const filtered = activeCat==='all' ? activeChannels : activeChannels.filter(c=> c.categoryId===activeCat)

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-7 space-y-8">

      {featuredChannels.length>0 && <FeaturedCarousel channels={featuredChannels} />}

      {continueWatching.length>0 && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-black tracking-[0.14em] text-[12px] text-zinc-200">CONTINUE WATCHING</h2>
            <Link to="/history" className="text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-full px-3 py-1.5 transition">View all →</Link>
          </div>
          <div className="mt-3 flex gap-3 overflow-auto no-scrollbar pb-2 -mx-1 px-1">
            {continueWatching.map(h=>{
              const isDef = !h.logo || h.logo.includes('flaticon') || h.logo.includes('via.placeholder') || (h.logo.includes('imgur.com') && !h.logo.includes('i.imgur.com'))
              const logo = isDef ? '/sm-tv-logo.png' : h.logo
              return (
              <Link key={h.channelId} to={`/channel/${h.channelId}`} className="shrink-0 w-[240px] bg-gradient-to-b from-[#1a1a28] to-[#14141f] border border-white/10 rounded-[20px] p-3.5 flex gap-3 hover:border-white/15 hover:shadow-xl transition">
                <img src={logo} alt={h.channelName} className="w-12 h-12 object-cover rounded-xl border border-white/10 bg-white/5" onError={(e)=>{(e.target as HTMLImageElement).src='/sm-tv-logo.png'}} />
                <div className="min-w-0"><div className="font-bold text-sm leading-tight truncate">{h.channelName}</div><div className="text-xs text-zinc-400 mt-1">{h.durationMinutes} min • {new Date(h.watchedAt).toLocaleDateString()}</div><div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden"><span className="block h-full w-[62%] bg-[#ff1840] rounded-full" /></div></div>
              </Link>
            )})}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-3">
          <h2 className="font-black tracking-[0.14em] text-[12px] flex items-center gap-2"><span className="w-2 h-2 bg-[#ff1840] rounded-full live-dot shadow-[0_0_10px_rgba(255,24,64,.7)]" /> LIVE NOW</h2>
          <span className="h-4 w-px bg-white/10" />
          <span className="text-xs text-zinc-500 font-medium">{filtered.length} channels</span>
          <Link to="/live" className="ml-auto text-xs font-bold bg-white text-black rounded-full px-3.5 py-1.5 hover:bg-zinc-100 transition">Explore →</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading ? Array.from({length:12}).map((_,i)=><ChannelCardSkeleton key={i} />) : filtered.slice(0,18).map(ch=> <ChannelCard key={ch.id} ch={ch} />)}
        </div>
      </section>

      <section className="bg-white/[0.02] border border-white/[0.06] rounded-[28px] p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-black tracking-[0.14em] text-[12px]">BROWSE BY CATEGORY</h2>
          <Link to="/live" className="text-xs font-bold text-zinc-400 hover:text-white">Browse all →</Link>
        </div>
        <div className="mt-4"><CategoryChips categories={categories} active={activeCat} onSelect={setActiveCat} /></div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.slice(0,12).map(ch=> <ChannelCard key={ch.id+'cat'} ch={ch} />)}
        </div>
      </section>
    </div>
  )
}
