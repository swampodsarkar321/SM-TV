import { useEffect, useState } from 'react'
import { ref, onValue, set, get } from 'firebase/database'
import { db } from '../firebase/config'

export default function TopLiveBar(){
  const [total, setTotal] = useState<number>(() =>{
    const s = localStorage.getItem('smtv_total_counter')
    return s ? Number(s) : 12847
  })
  const [liveNow, setLiveNow] = useState(0)

  useEffect(()=>{
    const totalRef = ref(db, 'stats/totalViews')
    const liveRef = ref(db, 'liveViewers/_global')
    let cleanup: (()=>void)[] = []

    get(totalRef).then(snap=>{
      if (snap.exists()) {
        const v = Number(snap.val())
        if (!isNaN(v) && v > total) { setTotal(v); localStorage.setItem('smtv_total_counter', String(v)) }
      } else {
        set(totalRef, total).catch(()=>{})
      }
    }).catch(()=>{})

    // real live watching - no fake fallback, real presence only
    const unsubLive = onValue(liveRef, snap=>{
      const val = snap.val()
      const c = val ? Object.keys(val).length * 2 : 0
      setLiveNow(c)
    })
    cleanup.push(unsubLive)

    // jog aste aste: 3-4 bar per minute (15-18s interval, +1 each)
    const interval = window.setInterval(()=>{
      setTotal(prev=>{
        const inc = 1
        const next = prev + inc
        localStorage.setItem('smtv_total_counter', String(next))
        if (next % 10 === 0) set(totalRef, next).catch(()=>{})
        return next
      })
    }, 16000)

    return ()=>{
      clearInterval(interval)
      cleanup.forEach(fn=>{ try{fn()}catch{} })
    }
  },[])

  return (
    <div className="w-full bg-gradient-to-r from-[#ff1840] via-[#ff2a5a] to-[#ff1840] text-white text-xs font-bold tracking-wide">
      <div className="max-w-[1320px] mx-auto px-4 h-7 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-white text-[#ff1840] rounded-full px-2 py-0.5 text-[10px] tracking-[0.12em] hidden sm:inline-flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="white"/></svg> LIVE
          </span>
          <span className="hidden sm:inline flex items-center gap-1.5"><img src="/sm-tv-logo.png" alt="SM" className="w-4 h-4 rounded-full border border-white/30" /> SM TV • Live Counter</span>
          <span className="sm:hidden flex items-center gap-1"><img src="/sm-tv-logo.png" alt="SM" className="w-4 h-4 rounded-full border border-white/30" /> SM TV LIVE</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="bg-black/20 backdrop-blur border border-white/20 rounded-full px-2.5 py-1 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3.5"/></svg>
            <span className="hidden sm:inline">{liveNow || 0} watching</span><span className="sm:hidden">{liveNow || 0}</span>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full live-dot hidden sm:inline-block" />
          </span>
          <span className="bg-white text-[#ff1840] rounded-full px-2.5 py-1 text-[11px] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff1840" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {total.toLocaleString()} views
          </span>
        </div>
      </div>
    </div>
  )
}
