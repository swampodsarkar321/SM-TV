import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Channel } from '../types'

export default function FeaturedCarousel({ channels }: { channels: Channel[] }){
  const [idx, setIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  useEffect(()=>{
    if (channels.length<=1) return
    const interval = setInterval(()=> {
      setProgress(p=>{
        if (p>=100) { setIdx(i=> (i+1)%channels.length); return 0 }
        return p+0.8
      })
    }, 30)
    return ()=> clearInterval(interval)
  },[channels.length, idx])
  useEffect(()=>{ setProgress(0) },[idx])
  if (!channels.length) return null
  const ch = channels[idx]
  return (
    <div className="relative rounded-[28px] overflow-hidden border border-white/10 bg-[#0e0e14] min-h-[380px] md:min-h-[460px] flex items-center group">
      {/* bg logo blur */}
      <div className="absolute inset-0">
        <img src={ch.logo} alt="" className="w-full h-full object-cover opacity-[0.08] blur-[1px] scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070b] via-[#07070b]/80 to-[#07070b]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070b] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff1840]/[0.12] via-transparent to-[#5c3fff]/[0.10]" />
      </div>

      {/* content */}
      <div className="relative z-10 p-6 md:p-10 max-w-[620px] w-full">
        <div className="inline-flex items-center gap-2 bg-[#ff1840] text-white text-[11px] tracking-[0.18em] font-black px-3 py-1.5 rounded-full shadow-[0_8px_20px_rgba(255,24,64,.35)]"><span className="w-1.5 h-1.5 bg-white rounded-full live-dot" /> LIVE • FEATURED</div>
        <h2 className="mt-4 text-[30px] md:text-[44px] font-black tracking-[-0.03em] leading-[0.95] gradient-text drop-shadow-lg">{ch.name}</h2>
        <p className="mt-3 text-zinc-300 text-[14px] md:text-[15px] leading-relaxed max-w-[520px] line-clamp-2">{ch.description || 'Watch live television now in premium quality. Instant play, adaptive HLS, real-time sync.'}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
          <span className="bg-white/10 border border-white/10 rounded-full px-2.5 py-1">{ch.categoryName || ch.categoryId}</span>
          <span>•</span><span className="text-emerald-300">● On Air Now</span>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Link to={`/channel/${ch.id}`} className="inline-flex items-center gap-2 bg-white text-black rounded-full px-7 h-[46px] font-black text-[13px] tracking-wide hover:bg-zinc-100 shadow-[0_10px_28px_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(255,255,255,.28)] transition">
            <span className="w-6 h-6 rounded-full bg-black text-white grid place-items-center text-[11px]">▶</span> WATCH LIVE
          </Link>
          <Link to={`/channel/${ch.id}`} className="hidden sm:inline-flex bg-white/10 backdrop-blur border border-white/15 rounded-full px-5 h-[46px] font-bold text-sm hover:bg-white/15 transition">Details</Link>
        </div>
        {/* dots + progress */}
        <div className="mt-8 flex items-center gap-3">
          <div className="flex gap-2">
            {channels.map((_,i)=>(
              <button key={i} onClick={()=>setIdx(i)} className={`relative h-1.5 rounded-full overflow-hidden transition-all ${i===idx?'w-10 bg-white':'w-6 bg-white/25 hover:bg-white/40'}`}>
                {i===idx && <span className="absolute inset-0 bg-[#ff1840] transition-all" style={{width: `${progress}%`}} />}
              </button>
            ))}
          </div>
          <span className="text-[11px] tracking-widest text-zinc-500 font-bold">{String(idx+1).padStart(2,'0')} / {String(channels.length).padStart(2,'0')}</span>
        </div>
      </div>

      {/* right glass card - SM TV fallback */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 w-[260px]">
        <div className="w-full h-[180px] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/15 rounded-[24px] grid place-items-center shadow-[0_20px_60px_rgba(0,0,0,.5)] p-6 group-hover:scale-[1.02] transition duration-500 relative overflow-hidden">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/55 backdrop-blur border border-white/15 rounded-full px-2.5 py-1 flex items-center gap-1.5">
            <img src="/sm-tv-logo.png" alt="SM TV" className="w-5 h-5 rounded-full object-cover border border-white/20" />
            <span className="text-[9px] font-black tracking-[0.16em] text-white">SM TV</span>
          </div>
          {ch.logo && !ch.logo.includes('flaticon') && !ch.logo.includes('via.placeholder') ? (
            <img src={ch.logo} alt={ch.name} className="w-[62%] h-[62%] object-contain drop-shadow-2xl mt-4" loading="eager" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'; const nxt = (e.target as HTMLImageElement).nextElementSibling as HTMLElement; if(nxt) nxt.classList.remove('hidden')}} />
          ) : null}
          <div className={`${ch.logo && !ch.logo.includes('flaticon') ? 'hidden' : ''} flex flex-col items-center gap-2 mt-4`}>
            <img src="/sm-tv-logo.png" alt="SM TV" className="w-16 h-16 rounded-full object-cover border border-white/20 shadow-xl" />
            <span className="text-xs font-bold text-zinc-300">{ch.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-black/40 backdrop-blur border border-white/10 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Streaming • SM TV • Auto 4K
        </div>
      </div>

      {/* nav arrows */}
      <button onClick={()=>setIdx(i=> (i-1+channels.length)%channels.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur border border-white/15 grid place-items-center text-white hover:bg-white hover:text-black transition opacity-0 group-hover:opacity-100">‹</button>
      <button onClick={()=>setIdx(i=> (i+1)%channels.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur border border-white/15 grid place-items-center text-white hover:bg-white hover:text-black transition opacity-0 group-hover:opacity-100 lg:opacity-0">›</button>
    </div>
  )
}
