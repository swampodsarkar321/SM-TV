import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { useRealtimeData } from '../hooks/useRealtimeData'
import { useLiveViewers } from '../hooks/useLiveViewers'
import { ref, set, get } from 'firebase/database'
import { db } from '../firebase/config'

export default function Header(){
  const [drawer, setDrawer] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const loc = useLocation()
  const { setSearch } = useApp()
  const { user, logout } = useAuth()
  const { notifications } = useRealtimeData()
  const unread = notifications.filter(n=>!n.read).length
  const { count: liveCount } = useLiveViewers()
  const [totalViews, setTotalViews] = useState<number>(() =>{
    const s = localStorage.getItem('smtv_total_counter')
    return s ? Number(s) : 12902
  })
  useEffect(()=>{
    const totalRef = ref(db, 'stats/totalViews')
    get(totalRef).then(snap=>{
      if (snap.exists()) {
        const v = Number(snap.val())
        if (!isNaN(v) && v > totalViews) { setTotalViews(v); localStorage.setItem('smtv_total_counter', String(v)) }
      } else { set(totalRef, totalViews).catch(()=>{}) }
    }).catch(()=>{})
    const interval = window.setInterval(()=>{
      setTotalViews(prev=>{
        const next = prev + 1
        localStorage.setItem('smtv_total_counter', String(next))
        if (next % 10 === 0) set(totalRef, next).catch(()=>{})
        return next
      })
    }, 16000)
    return ()=> clearInterval(interval)
  },[])

  useEffect(()=>{
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return ()=> window.removeEventListener('scroll', onScroll)
  },[])

  const linkCls = (p:string)=> `relative px-3.5 py-2 rounded-full text-[13px] font-semibold tracking-wide transition ${loc.pathname===p ? 'bg-white text-black shadow-lg' : 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'}`

  const doSearch = (val:string)=>{
    setSearch(val)
    nav(`/search?q=${encodeURIComponent(val)}`)
    setDrawer(false)
  }

  return (
    <header className={`sticky top-0 z-40 border-b transition ${scrolled ? 'glass bg-[#08080c]/75 border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,.45)]' : 'bg-[#08080c]/40 border-white/[0.04] backdrop-blur-md'}`}>
      <div className="max-w-[1320px] mx-auto px-4 h-[62px] flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/sm-tv-logo.png" alt="SM TV" className="w-9 h-9 rounded-xl object-cover border border-white/15 shadow-[0_8px_20px_rgba(0,0,0,.35)] group-hover:shadow-[0_10px_28px_rgba(0,0,0,.45)] transition bg-white/5" />
          <span className="font-black tracking-[0.16em] text-[15px]">SM<span className="text-[#ff1840]"> TV</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-2">
          <Link to="/" className={linkCls('/')}>Home</Link>
          <Link to="/live" className={linkCls('/live')}>Live TV</Link>
          <Link to="/favorites" className={linkCls('/favorites')}>Favorites</Link>
          <Link to="/history" className={linkCls('/history')}>History</Link>
        </nav>

        <div className="hidden md:flex flex-1 max-w-[420px] ml-auto relative group">
          <input value={q} onChange={e=>{setQ(e.target.value); setSearch(e.target.value)}} onKeyDown={e=>{ if(e.key==='Enter') doSearch((e.target as HTMLInputElement).value)}}
            placeholder="Search channels, sports, news..." className="w-full bg-[#13131c] group-hover:bg-[#181825] border border-white/[0.08] group-hover:border-white/15 rounded-full h-[40px] pl-10 pr-4 text-[13px] placeholder:text-zinc-500 focus:outline-none focus:bg-[#1a1a28] focus:border-white/20 transition" />
          <span className="absolute left-3.5 top-[10px] text-zinc-500 group-focus-within:text-white transition">⌕</span>
          <button onClick={()=> doSearch(q)} className="absolute right-1 top-1 bottom-1 bg-white text-black rounded-full px-3.5 text-xs font-bold hover:bg-zinc-100 transition">Search</button>
        </div>

        {/* Integrated live counter - header nav bar sathe */}
        <div className="hidden xl:flex items-center gap-1.5 ml-2 bg-white/[0.06] border border-white/10 rounded-full pl-1 pr-1 py-1">
          <span className="bg-[#ff1840] text-white rounded-full px-2.5 py-1 text-[10px] tracking-[0.12em] font-black flex items-center gap-1"><span className="w-1.5 h-1.5 bg-white rounded-full live-dot" /> LIVE</span>
          <span className="flex items-center gap-1 text-zinc-200 text-xs font-bold px-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3.5"/></svg>
            {liveCount || 2} watching
          </span>
          <span className="w-px h-4 bg-white/10" />
          <span className="bg-white text-[#0a0a0f] rounded-full px-2.5 py-1 text-[11px] font-black flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {totalViews.toLocaleString()} views
          </span>
          <span className="hidden 2xl:inline-flex items-center gap-1 text-[10px] tracking-widest font-bold text-zinc-400 pl-1">SM TV</span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto md:ml-0">
          <span className="xl:hidden inline-flex items-center gap-1 bg-white/[0.06] border border-white/10 rounded-full px-2.5 py-1.5 text-xs font-bold text-zinc-200"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full live-dot" /> {liveCount || 2}</span>
          <button onClick={()=>nav('/search')} className="md:hidden w-10 h-10 grid place-items-center rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10 transition">⌕</button>
          <Link to="/notifications" className="relative w-10 h-10 grid place-items-center rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10 transition">
            <span className="text-[18px]">◐</span>
            {unread>0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#ff1840] rounded-full grid place-items-center text-[11px] font-bold leading-none shadow-lg">{unread}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="hidden md:grid w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 place-items-center text-sm shadow">👤</Link>
              <button onClick={logout} className="hidden md:inline text-xs font-semibold text-zinc-400 hover:text-white px-2.5 py-2 rounded-full hover:bg-white/10 transition">Logout</button>
            </>
          ) : (
            <Link to="/login" className="hidden md:inline-flex bg-white text-black rounded-full px-5 h-10 items-center text-[13px] font-bold hover:bg-zinc-100 shadow-lg transition">Sign In</Link>
          )}
          <button onClick={()=>setDrawer(v=>!v)} className={`md:hidden w-10 h-10 grid place-items-center rounded-full transition ${drawer ? 'bg-white text-black' : 'bg-white text-black'}`}>{drawer ? '✕' : '☰'}</button>
        </div>
      </div>

      {drawer && (
        <div className="md:hidden border-t border-white/10 bg-[#0f0f16]/95 glass">
          <div className="p-4 space-y-4">
            <div className="relative">
              <input value={q} onChange={e=>{setQ(e.target.value); setSearch(e.target.value)}} onKeyDown={e=>{ if(e.key==='Enter') doSearch((e.target as HTMLInputElement).value)}}
                placeholder="Search channels..." className="w-full bg-[#1a1a28] border border-white/10 rounded-2xl h-11 pl-10 pr-4 text-sm focus:outline-none focus:border-white/20" />
              <span className="absolute left-3.5 top-3.5 text-zinc-500 text-sm">⌕</span>
            </div>
            <nav className="grid gap-1.5">
              <Link onClick={()=>setDrawer(false)} to="/" className={`py-3 px-4 rounded-2xl font-semibold flex justify-between ${loc.pathname==='/'?'bg-white text-black':'bg-white/[0.06] text-white'}`}>Home <span>›</span></Link>
              <Link onClick={()=>setDrawer(false)} to="/live" className={`py-3 px-4 rounded-2xl font-semibold flex justify-between ${loc.pathname==='/live'?'bg-white text-black':'bg-white/[0.06] text-white'}`}>Live TV <span>›</span></Link>
              <Link onClick={()=>setDrawer(false)} to="/favorites" className="py-3 px-4 rounded-2xl font-semibold bg-white/[0.06] flex justify-between">Favorites <span>›</span></Link>
              <Link onClick={()=>setDrawer(false)} to="/history" className="py-3 px-4 rounded-2xl font-semibold bg-white/[0.06] flex justify-between">History <span>›</span></Link>
              <Link onClick={()=>setDrawer(false)} to="/notifications" className="py-3 px-4 rounded-2xl font-semibold bg-white/[0.06] flex justify-between">Notifications {unread>0 && <span className="bg-[#ff1840] text-white rounded-full px-2 text-xs grid place-items-center">{unread}</span>}</Link>
              <Link onClick={()=>setDrawer(false)} to="/profile" className="py-3 px-4 rounded-2xl font-semibold bg-white/[0.06] flex justify-between">Profile <span>›</span></Link>
              {user ? <button onClick={()=>{logout(); setDrawer(false)}} className="text-left py-3 px-4 rounded-2xl font-semibold bg-red-500/10 border border-red-500/20 text-red-300">Logout</button>
                    : <Link onClick={()=>setDrawer(false)} to="/login" className="bg-white text-black rounded-2xl h-12 grid place-items-center font-bold mt-1">Sign In</Link>}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
