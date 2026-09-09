import { Link } from 'react-router-dom'
import type { Channel } from '../types'
import { useApp } from '../contexts/AppContext'
import { useState } from 'react'

function isDefaultLogo(url?: string){
  if (!url) return true
  const u = url.toLowerCase()
  return u.includes('flaticon') || u.includes('via.placeholder') || u === '' || u.includes('example.m3u8') || (u.includes('imgur.com') && !u.includes('i.imgur.com'))
}

function SMTVLogo({ size='normal' }: { size?: 'small'|'normal'|'large' }){
  const cls = size==='small' ? 'w-8 h-8' : size==='large' ? 'w-16 h-16' : 'w-14 h-14'
  return (
    <img src="/sm-tv-logo.png" alt="SM TV" className={`${cls} object-contain rounded-full border border-white/20 shadow-[0_6px_16px_rgba(0,0,0,.45)] bg-white/5`} />
  )
}

export default function ChannelCard({ ch }: { ch: Channel }){
  const { isFav, toggleFavorite } = useApp()
  const fav = isFav(ch.id)
  const [imgErr, setImgErr] = useState(false)
  const showSMFallback = isDefaultLogo(ch.logo) || imgErr

  return (
    <div className="group relative bg-gradient-to-b from-[#181824] to-[#13131d] border border-white/[0.07] rounded-[20px] overflow-hidden card-hover">
      <Link to={`/channel/${ch.id}`} className="block">
        <div className="aspect-[16/10] bg-[#0e0e14] grid place-items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-[#ff1840]/[0.06] opacity-0 group-hover:opacity-100 transition duration-500" />
          {/* SM TV watermark top-center for every card - using real image */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-black/55 backdrop-blur border border-white/15 rounded-full px-2 py-1 flex items-center gap-1.5">
              <img src="/sm-tv-logo.png" alt="SM TV" className="w-5 h-5 rounded-full object-cover border border-white/20" />
              <span className="text-[9px] font-black tracking-[0.16em] text-white">SM TV</span>
            </div>
          </div>

          {showSMFallback ? (
            <div className="flex flex-col items-center gap-2">
              <SMTVLogo />
              <span className="text-[11px] font-bold tracking-wide text-zinc-300 max-w-[80%] truncate text-center">{ch.name}</span>
            </div>
          ) : (
            <img src={ch.logo} alt={ch.name} className="w-[52%] h-[52%] object-contain opacity-95 group-hover:scale-[1.06] group-hover:opacity-100 transition duration-500 drop-shadow-xl" loading="lazy" onError={()=>setImgErr(true)} />
          )}

          <span className="absolute left-2.5 bottom-2.5 bg-[#ff1840] text-white text-[10px] tracking-[0.12em] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg"><span className="w-1.5 h-1.5 bg-white rounded-full live-dot" /> LIVE</span>
          {ch.featured && <span className="absolute right-2.5 bottom-2.5 bg-amber-400 text-black text-[10px] font-black px-2 py-1 rounded-full shadow">FEATURED</span>}
          <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition duration-300">
            <div className="w-12 h-12 rounded-full bg-white text-black grid place-items-center shadow-xl translate-y-1 group-hover:translate-y-0 transition duration-300 text-sm">▶</div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
        </div>
        <div className="p-3.5">
          <div className="font-bold text-[13.5px] leading-tight truncate tracking-tight flex items-center gap-1.5">{ch.name} <span className="hidden group-hover:inline text-[9px] font-black tracking-widest bg-white/10 border border-white/10 rounded-full px-1.5 py-0.5 text-zinc-300">SM TV</span></div>
          <div className="text-[11px] tracking-wide text-zinc-400 mt-1 flex items-center gap-1.5"><span className="w-1 h-1 bg-zinc-500 rounded-full" /> {ch.categoryName || ch.categoryId} <span className="text-zinc-600">•</span> <span className="text-emerald-400">On Air</span></div>
        </div>
      </Link>
      <button onClick={()=>toggleFavorite(ch.id)} aria-label="fav" className={`absolute right-3 bottom-[58px] w-8 h-8 rounded-full grid place-items-center border text-[13px] transition backdrop-blur-md ${fav ? 'bg-[#ff1840] border-[#ff1840] text-white shadow-[0_6px_16px_rgba(255,24,64,.45)] scale-105' : 'bg-black/45 border-white/15 text-white hover:bg-white hover:text-black hover:border-white'}`}>{fav ? '♥' : '♡'}</button>
    </div>
  )
}

export function ChannelCardSkeleton(){
  return <div className="rounded-[20px] overflow-hidden border border-white/5 bg-[#14141f]"><div className="aspect-[16/10] shimmer" /><div className="p-3.5 space-y-2.5"><div className="h-3 w-2/3 shimmer rounded-full" /><div className="h-2 w-1/3 shimmer rounded-full" /></div></div>
}
