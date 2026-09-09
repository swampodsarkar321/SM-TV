import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

type Level = { index:number, height:number, bitrate:number, name:string }

function labelForHeight(h:number){
  if (h >= 2160) return '4K 2160p'
  if (h >= 1440) return '2K 1440p'
  if (h >= 1080) return '1080p Full HD'
  if (h >= 720) return '720p HD'
  if (h >= 480) return '480p'
  if (h >= 360) return '360p'
  if (h >= 240) return '240p'
  if (h >= 144) return '144p'
  return `${h}p`
}

export default function VideoPlayer({ src, poster }: { src: string, poster?: string }){
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [levels, setLevels] = useState<Level[]>([])
  const [current, setCurrent] = useState<number>(-1) // -1 auto
  const [auto, setAuto] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(()=>{
    setErr(null); setLoading(true); setLevels([]); setCurrent(-1); setAuto(true)
    let safeSrc = src
    // Always proxy via vercel api to handle CORS & Mixed Content (http->https) for all streams
    if (safeSrc?.startsWith('http') && typeof location !== 'undefined') {
      safeSrc = `/api/proxy?url=${encodeURIComponent(safeSrc)}`
    }
    const video = videoRef.current
    if (!video || !safeSrc) { setLoading(false); setErr('Stream Unavailable'); return }
    let hls: Hls | null = null
    const onError = ()=>{ setLoading(false); setErr('Stream temporarily unavailable') }

    if (safeSrc.includes('.m3u8') && Hls.isSupported()) {
      hls = new Hls({
        enableWorker:true,
        maxBufferLength: 30,
        capLevelToPlayerSize: false,
        xhrSetup: (xhr, url) => {
          // proxy all http/https sub-requests via api to handle CORS & http->https
          if (url.startsWith('http') && typeof location !== 'undefined') {
            const proxied = `/api/proxy?url=${encodeURIComponent(url)}`
            xhr.open('GET', proxied, true)
          }
        }
      })
      hlsRef.current = hls
      hls.loadSource(safeSrc)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data)=>{
        setLoading(false)
        const lvls: Level[] = (data.levels || hls!.levels || []).map((l:any, i:number)=> ({
          index:i, height: l.height || 0, bitrate: l.bitrate || 0, name: l.height ? labelForHeight(l.height) : `${Math.round((l.bitrate||0)/1000)} kbps`
        }))
        // sort high to low for menu
        lvls.sort((a,b)=> b.height - a.height)
        // if heights 0 (audio only), keep original order
        setLevels(lvls)
        video.play().catch(()=>{})
      })
      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data)=>{
        setCurrent(data.level)
      })
      hls.on(Hls.Events.ERROR, (_e, data)=>{
        if (data.fatal) {
          if (data.type===Hls.ErrorTypes.NETWORK_ERROR) hls?.startLoad()
          else { setErr('Stream Unavailable'); setLoading(false) }
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = safeSrc
      video.addEventListener('loadeddata', ()=> setLoading(false))
      video.addEventListener('error', onError)
      video.play().catch(()=>{})
    } else {
      video.src = safeSrc
      video.addEventListener('error', onError)
      video.addEventListener('canplay', ()=> setLoading(false))
    }
    return ()=>{
      try{ hls?.destroy() }catch{}
      hlsRef.current = null
      if (video) { video.pause(); video.removeAttribute('src'); video.load() }
    }
  },[src])

  const selectLevel = (idx:number)=>{
    const hls = hlsRef.current
    if (!hls) { setShowMenu(false); return }
    if (idx === -1) {
      hls.currentLevel = -1
      hls.nextLevel = -1
      setAuto(true); setCurrent(-1)
    } else {
      // idx is original hls index, not sorted menu index. Our menu stores original index in Level.index
      hls.currentLevel = idx
      hls.nextLevel = idx
      hls.loadLevel = idx
      setAuto(false); setCurrent(idx)
    }
    setShowMenu(false)
  }

  const currentLabel = auto ? 'Auto' : (()=>{ const l = hlsRef.current?.levels[current]; return l?.height ? labelForHeight(l.height) : `${current}` })()

  if (err) {
    return (
      <div className="w-full aspect-video bg-[#0a0a12] grid place-items-center text-center p-8 rounded-[24px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,.5)]">
        <div>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-2xl mb-3">⚠️</div>
          <div className="font-black tracking-tight">Stream Unavailable</div>
          <div className="text-sm text-zinc-400 mt-1">This channel is temporarily unavailable.</div>
          <button onClick={()=>location.reload()} className="mt-5 bg-white text-black rounded-full px-6 h-10 font-bold text-sm shadow-lg hover:bg-zinc-100 transition">TRY AGAIN</button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-[24px] overflow-hidden border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,.6)] group">
      {loading && <div className="absolute inset-0 grid place-items-center bg-black z-10"><div className="w-9 h-9 border-[3px] border-white/15 border-t-white rounded-full animate-spin" /><span className="absolute mt-16 text-xs tracking-widest font-bold text-zinc-400">LOADING</span></div>}
      <video ref={videoRef} poster={poster} controls playsInline className="w-full h-full object-contain bg-black" controlsList="nodownload" />

      {/* SM TV channel logo - bam dike (LIVE er jaygay) - sob channel auto */}
      <div className="absolute left-3 top-3 z-20 pointer-events-none">
        <img src="/sm-tv-logo.png" alt="SM TV" className="w-[56px] h-[56px] object-contain rounded-xl border border-white/20 shadow-[0_6px_16px_rgba(0,0,0,.5)] bg-black/40 backdrop-blur" />
      </div>

      {/* Quality selector - REAL HLS levels, 4K support */}
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <div className="relative">
          <button onClick={()=> setShowMenu(v=>!v)} className="flex items-center gap-1.5 bg-black/55 backdrop-blur-md border border-white/15 hover:bg-black/70 text-white rounded-full pl-2.5 pr-2 py-1.5 text-xs font-bold transition">
            <span className="w-6 h-6 rounded-full bg-white text-black grid place-items-center text-[10px]">HD</span>
            {levels.length ? currentLabel : 'Auto'}
            <span className="text-[11px] opacity-60 ml-0.5">{showMenu ? '▲' : '▼'}</span>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-[190px] bg-[#15151f]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,.6)] py-1 z-20">
              <button onClick={()=>selectLevel(-1)} className={`w-full text-left px-3.5 py-2.5 text-xs font-bold flex items-center justify-between hover:bg-white/10 transition ${auto?'bg-white text-black': 'text-white'}`}>Auto <span className={`text-[10px] ${auto?'text-black/60':'text-zinc-400'}`}>Adaptive</span></button>
              <div className="h-px bg-white/10 my-1" />
              {levels.length ? levels.map(l=> {
                const isActive = !auto && current===l.index
                return (
                  <button key={l.index} onClick={()=>selectLevel(l.index)} className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-white/10 transition ${isActive?'bg-white text-black':'text-zinc-200'}`}>
                    <span>{l.name}</span>
                    <span className={`text-[10px] ${isActive?'text-black/60':'text-zinc-500'}`}>{l.bitrate ? `${Math.round(l.bitrate/1000)} kbps` : ''}</span>
                  </button>
                )
              }) : (
                <div className="px-3.5 py-3 text-xs text-zinc-400">No levels • Auto 4K ready if stream provides 2160p</div>
              )}
              <div className="px-3 py-1.5 text-[10px] tracking-widest font-bold text-zinc-500 border-t border-white/10 mt-1">4K SUPPORT • REAL HLS</div>
            </div>
          )}
        </div>
      </div>

      {/* bottom gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </div>
  )
}
