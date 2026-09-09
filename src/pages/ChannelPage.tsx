import { useParams, Link } from 'react-router-dom'
import { useRealtimeData } from '../hooks/useRealtimeData'
import VideoPlayer from '../components/VideoPlayer'
import ChannelCard from '../components/ChannelCard'
import { useApp } from '../contexts/AppContext'
import { useEffect, useRef, useState } from 'react'
import { useLiveViewers } from '../hooks/useLiveViewers'

export default function ChannelPage(){
  const { channelId } = useParams()
  const { activeChannels, channels } = useRealtimeData()
  const ch = channels.find(c=> c.id===channelId) || activeChannels.find(c=> c.id===channelId)
  const { isFav, toggleFavorite, addToHistory } = useApp()
  const { count: liveViewers } = useLiveViewers(channelId)
  const [secs, setSecs] = useState(0)
  const timerRef = useRef<number | null>(null)
  const startRef = useRef<number>(Date.now())

  useEffect(()=>{
    if (ch) {
      document.title = `${ch.name} — Watch Live on SM TV`
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', ch.description || `Watch ${ch.name} live on SM TV - Premium OTT streaming.`)
    }
    return ()=> { document.title = 'SM TV — Premium OTT | Watch Live Television Online' }
  },[ch?.id, ch?.name])

  useEffect(()=>{
    if (!ch) return
    startRef.current = Date.now()
    // start session
    timerRef.current = window.setInterval(()=> setSecs(Math.floor((Date.now()-startRef.current)/1000)), 1000)
    return ()=>{
      if (timerRef.current) clearInterval(timerRef.current)
      const watched = Math.floor((Date.now()-startRef.current)/1000)
      if (watched>3) addToHistory(ch, watched)
      else if (ch) addToHistory(ch, watched)
    }
  },[ch?.id])

  // related
  const related = ch ? activeChannels.filter(c=> c.categoryId===ch.categoryId && c.id!==ch.id).slice(0,4) : []

  if (!ch) {
    return <div className="max-w-[960px] mx-auto px-4 py-10 text-center">Channel not found. <Link to="/live" className="text-red-400 underline ml-2">Browse SM TV</Link></div>
  }
  if (!ch.enabled) {
    return (
      <div className="max-w-[960px] mx-auto px-4 py-10">
        <div className="bg-[#14141f] border border-white/10 rounded-2xl p-10 text-center">
          <div className="text-3xl mb-2">🚫</div><div className="font-bold">Channel Unavailable</div><div className="text-sm text-zinc-400 mt-1">This channel is currently disabled by admin.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-7">
      <VideoPlayer src={ch.streamUrl} poster={ch.logo} />
      <div className="mt-5 flex flex-wrap gap-4 items-start justify-between bg-white/[0.03] border border-white/10 rounded-[24px] p-5">
        <div className="flex gap-4">
          <img src="/sm-tv-logo.png" alt="SM TV" className="hidden sm:block w-14 h-14 rounded-2xl object-cover border border-white/10 shadow" />
          <div>
            <h1 className="text-xl md:text-[22px] font-black tracking-[-0.02em] flex items-center gap-2 flex-wrap">
              <span>{ch.name}</span>
              <span className="inline-flex items-center gap-1.5 bg-white text-black rounded-full pl-1 pr-2.5 py-1 shadow-md">
                <img src="/sm-tv-logo.png" alt="SM TV" className="w-6 h-6 rounded-full object-cover border border-black/10" onError={(e)=>{ (e.target as HTMLImageElement).style.display='none'}} />
                <span className="text-[11px] font-black tracking-[0.12em]">SM TV</span>
              </span>
            </h1>
            <div className="text-sm text-zinc-400 mt-1 flex flex-wrap items-center gap-2"><span className="bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-xs font-bold text-zinc-300">{ch.categoryName || ch.categoryId}</span> <span className="w-1 h-1 bg-zinc-600 rounded-full" /> <span className="text-[#ff1840] font-bold">● LIVE</span> <span>•</span> <span className="mono text-xs">{String(Math.floor(secs/60)).padStart(2,'0')}:{String(secs%60).padStart(2,'0')} watching</span> <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full px-2.5 py-1 text-xs font-bold">👁 {liveViewers} watching</span></div>
            {ch.description && <p className="text-sm text-zinc-300 mt-3 max-w-[680px] leading-relaxed">{ch.description}</p>}
          </div>
        </div>
        <button onClick={()=>toggleFavorite(ch.id)} className={`shrink-0 rounded-full px-6 h-11 font-black text-sm border shadow-lg transition ${isFav(ch.id) ? 'bg-[#ff1840] border-[#ff1840] text-white shadow-[0_10px_24px_rgba(255,24,64,.35)]' : 'bg-white text-black border-white hover:bg-zinc-100'}`}>
          {isFav(ch.id) ? '♥ Favorited' : '♡ Favorite'}
        </button>
      </div>

      {related.length>0 && (
        <div className="mt-8">
          <h3 className="font-black tracking-[0.14em] text-[12px] text-zinc-300 mb-3">YOU MAY ALSO LIKE</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map(r=> <ChannelCard key={r.id} ch={r} />)}
          </div>
        </div>
      )}
    </div>
  )
}
