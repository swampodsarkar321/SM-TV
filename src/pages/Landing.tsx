import { Link } from 'react-router-dom'
import { useRealtimeData } from '../hooks/useRealtimeData'
import ChannelCard from '../components/ChannelCard'

export default function Landing(){
  const { activeChannels } = useRealtimeData()
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff1840]/20 via-transparent to-[#5c3fff]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070b] via-transparent to-transparent" />
        </div>
        <div className="relative max-w-[1320px] mx-auto px-4 py-14 w-full grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-xs font-bold tracking-widest">
              <span className="w-2 h-2 bg-emerald-400 rounded-full live-dot" /> SM TV • Premium OTT • 246+ Live Channels
            </div>
            <h1 className="mt-5 text-[42px] md:text-[56px] font-black tracking-[-0.04em] leading-[0.9]">
              Live TV<br />
              <span className="gradient-text">যেকোনো সময়</span><br />
              যেকোনো জায়গায়
            </h1>
            <p className="mt-4 text-zinc-300 text-[16px] leading-relaxed max-w-[560px]">
              SM TV তে 246+ লাইভ চ্যানেল — News, Sports, Entertainment, Music সব এক জায়গায়। Firebase Realtime sync, 4K HLS, Android + Web একসাথে।
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/live" className="inline-flex items-center gap-2 bg-white text-black rounded-full px-8 h-12 font-black text-sm shadow-[0_12px_32px_rgba(255,255,255,.22)] hover:bg-zinc-100 transition">
                <span className="w-7 h-7 rounded-full bg-black text-white grid place-items-center text-xs">▶</span> Watch Live TV Free
              </Link>
              <a href="/live" onClick={(e)=>{ e.preventDefault(); if('serviceWorker' in navigator) alert('Browser menu → Install SM TV'); }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-6 h-12 font-bold text-sm hover:bg-white/15 transition">📲 Install App</a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full live-dot" /> 2.4k watching now</span>
              <span className="hidden sm:inline w-px h-4 bg-white/10" />
              <span>✓ No signup needed • ✓ 4K adaptive</span>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-[0_24px_64px_rgba(0,0,0,.5)]">
              <div className="flex items-center gap-3">
                <img src="/sm-tv-logo.png" alt="SM TV" className="w-12 h-12 rounded-2xl object-cover border border-white/20" />
                <div><div className="font-black tracking-tight">SM TV</div><div className="text-xs text-zinc-400">Premium • Live • 4K</div></div>
                <span className="ml-auto bg-[#ff1840] text-white rounded-full px-3 py-1 text-xs font-black">LIVE</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {activeChannels.slice(0,4).map(c=>(
                  <div key={c.id} className="bg-black/30 border border-white/10 rounded-2xl p-3 flex items-center gap-2">
                    <img src={c.logo || '/sm-tv-logo.png'} alt={c.name} className="w-8 h-8 rounded-lg object-cover" onError={(e)=>{(e.target as HTMLImageElement).src='/sm-tv-logo.png'}} />
                    <div className="min-w-0"><div className="font-bold text-xs truncate">{c.name}</div><div className="text-[11px] text-emerald-300">● LIVE</div></div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <span className="flex-1 bg-white text-black rounded-full h-9 grid place-items-center font-bold text-xs">▶ Watch Now</span>
                <span className="w-9 h-9 rounded-full bg-white/10 border border-white/15 grid place-items-center text-xs">♡</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white text-black rounded-2xl px-4 py-3 shadow-xl">
              <div className="text-xs font-bold">4K HLS Adaptive</div><div className="text-[11px] text-zinc-500">Auto quality • PIP • Fullscreen</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live preview */}
      <section className="max-w-[1320px] mx-auto px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="font-black tracking-[0.14em] text-xs flex items-center gap-2"><span className="w-2 h-2 bg-[#ff1840] rounded-full live-dot" /> LIVE NOW — Preview</h2>
          <Link to="/live" className="text-xs font-bold bg-white text-black rounded-full px-4 py-2">Explore 246 →</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {activeChannels.slice(0,6).map(c=> <ChannelCard key={c.id} ch={c} />)}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1320px] mx-auto px-4 py-6 grid md:grid-cols-3 gap-4">
        {[
          { t:'4K HLS Adaptive', d:'Auto quality 144p→2160p, remember, PIP' },
          { t:'Firebase Realtime Sync', d:'Android + Web + Admin একসাথে, 1 sec update' },
          { t:'Favorites & History', d:'Continue watching, watch time sync' },
        ].map(f=>(
          <div key={f.t} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 grid place-items-center">✦</div>
            <div className="font-bold mt-3">{f.t}</div><div className="text-sm text-zinc-400 mt-1">{f.d}</div>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="max-w-[1320px] mx-auto px-4 py-10 bg-white/[0.02] border border-white/[0.06] rounded-[28px] mt-6">
        <h3 className="font-black tracking-[0.14em] text-xs text-center">FAQ</h3>
        <div className="mt-4 max-w-[760px] mx-auto space-y-3 text-sm">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4"><b>SM TV কি free?</b><div className="text-zinc-400 mt-1">হ্যাঁ, 246+ channel free, login ছাড়া দেখতে পারবেন, login করলে sync হবে।</div></div>
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4"><b>Android App এর সাথে sync?</b><div className="text-zinc-400 mt-1">একই Firebase — Admin change করলে Web + Android দুই জায়গায় live update।</div></div>
        </div>
        <div className="text-center mt-6">
          <Link to="/live" className="inline-flex bg-white text-black rounded-full px-8 h-12 items-center font-black text-sm">Enter SM TV WebApp →</Link>
        </div>
      </section>
    </div>
  )
}
