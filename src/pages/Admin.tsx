import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { ref, onValue, set, remove, push, update } from 'firebase/database'
import { db } from '../firebase/config'
import { fetchM3U } from '../utils/m3uParser'

const ADMIN_EMAIL = 'mdswampodsarkar@gmail.com'
type Tab = 'channels'|'categories'|'m3u'|'order'|'users'|'stats'|'ads'|'config'|'maintenance'|'notifications'|'backup'

export default function Admin(){
  const { user } = useAuth()
  const nav = useNavigate()
  const [tab, setTab] = useState<Tab>('channels')
  const [channels, setChannels] = useState<Record<string, any>>({})
  const [categories, setCategories] = useState<Record<string, any>>({})
  const [maintenance, setMaintenance] = useState({ enabled:false, message:'' })
  const [notifications, setNotifications] = useState<Record<string, any>>({})
  const [users, setUsers] = useState<Record<string, any>>({})
  const [stats, setStats] = useState<any>({})
  const [liveViewers, setLiveViewers] = useState(0)
  const [adsConfig, setAdsConfig] = useState<any>({})
  const [appConfig, setAppConfig] = useState<any>({})

  // listeners - must be before early returns (hooks order)
  useEffect(()=>{
    if (!user || user.email !== ADMIN_EMAIL) return
    const un1 = onValue(ref(db, 'channels'), s=> setChannels(s.val() || {}))
    const un2 = onValue(ref(db, 'categories'), s=> setCategories(s.val() || {}))
    const un3 = onValue(ref(db, 'maintenance'), s=> setMaintenance(s.val() || { enabled:false, message:'' }))
    const un4 = onValue(ref(db, 'notifications'), s=> setNotifications(s.val() || {}))
    const un5 = onValue(ref(db, 'users'), s=> setUsers(s.val() || {}))
    const un6 = onValue(ref(db, 'stats'), s=> setStats(s.val() || {}))
    const un7 = onValue(ref(db, 'liveViewers/_global'), s=> { const v=s.val(); setLiveViewers(v?Object.keys(v).length*2:0) })
    const un8 = onValue(ref(db, 'config/ads'), s=> setAdsConfig(s.val() || {}))
    const un9 = onValue(ref(db, 'config/app'), s=> setAppConfig(s.val() || {}))
    return ()=>{ try{un1()}catch{}; try{un2()}catch{}; try{un3()}catch{}; try{un4()}catch{}; try{un5()}catch{}; try{un6()}catch{}; try{un7()}catch{}; try{un8()}catch{}; try{un9()}catch{} }
  },[user])

  if (!user) {
    return <div className="max-w-[960px] mx-auto px-4 py-16 text-center">
      <h1 className="text-xl font-black">SM TV Admin</h1>
      <p className="text-sm text-zinc-400 mt-2">Login required with <b>{ADMIN_EMAIL}</b></p>
      <Link to="/login" className="inline-flex mt-6 bg-white text-black rounded-full px-6 h-10 items-center font-bold">Login</Link>
    </div>
  }
  if (user.email !== ADMIN_EMAIL) {
    return <div className="max-w-[960px] mx-auto px-4 py-16 text-center">
      <h1 className="text-xl font-black">Access Denied</h1>
      <p className="text-sm text-zinc-400 mt-2">Only <b>{ADMIN_EMAIL}</b> can access admin.</p>
      <p className="text-xs text-zinc-500 mt-1">Your email: {user.email}</p>
      <button onClick={()=>nav('/')} className="mt-6 bg-white text-black rounded-full px-6 h-10 font-bold">Go Home</button>
    </div>
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-black">SM TV Admin</h1>
        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full px-3 py-1 text-xs font-bold">🔒 {ADMIN_EMAIL}</span>
        <span className="ml-auto text-xs text-zinc-500 hidden sm:inline">{Object.keys(channels).length} ch • {Object.keys(categories).length} cat • {Object.keys(users).length} users • {liveViewers} live</span>
      </div>

      <div className="mt-5 flex gap-2 overflow-auto no-scrollbar pb-1">
        {(['channels','m3u','order','categories','users','stats','ads','config','maintenance','notifications','backup'] as Tab[]).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`shrink-0 rounded-full px-3.5 h-8 font-bold text-[11px] tracking-widest ${tab===t?'bg-white text-black':'bg-white/10 border border-white/15 text-zinc-300'}`}>{t.toUpperCase()}</button>
        ))}
      </div>

      {tab==='channels' && <ChannelsTab data={channels} />}
      {tab==='m3u' && <M3UTab existing={channels} />}
      {tab==='order' && <OrderTab data={channels} />}
      {tab==='categories' && <CategoriesTab data={categories} />}
      {tab==='users' && <UsersTab data={users} />}
      {tab==='stats' && <StatsTab stats={stats} live={liveViewers} channelCount={Object.keys(channels).length} userCount={Object.keys(users).length} />}
      {tab==='ads' && <AdsTab data={adsConfig} />}
      {tab==='config' && <ConfigTab data={appConfig} />}
      {tab==='maintenance' && <MaintenanceTab data={maintenance} />}
      {tab==='notifications' && <NotificationsTab data={notifications} />}
      {tab==='backup' && <BackupTab channels={channels} categories={categories} users={users} stats={stats} />}
    </div>
  )
}

async function sendTelegram(title:string, text:string, url?:string, image?:string){
  try{ await fetch('/api/telegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, text, url, image }) }) }catch{}
}
function ChannelsTab({ data }: { data: Record<string, any>}){
  const [form, setForm] = useState({ id:'', name:'', logo:'', streamUrl:'', categoryId:'sports', featured:false, enabled:true })
  const [editId, setEditId] = useState<string | null>(null)
  const save = async()=>{
    if (!form.id || !form.name || !form.streamUrl) return alert('id, name, streamUrl required')
    const payload = { name: form.name, logo: form.logo, streamUrl: form.streamUrl, categoryId: form.categoryId, featured: form.featured, enabled: form.enabled, order: data[form.id]?.order || Date.now() }
    await set(ref(db, `channels/${form.id}`), payload)
    // Telegram viral share
    await sendTelegram(`🆕 New Channel: ${form.name}`, `Category: ${form.categoryId}`, `https://sm-tv-lovat.vercel.app/channel/${form.id}`, form.logo || '/sm-tv-logo.png')
    setForm({ id:'', name:'', logo:'', streamUrl:'', categoryId:'sports', featured:false, enabled:true }); setEditId(null)
  }
  const del = async(id:string)=>{ if(confirm('Delete '+id+'?')) await remove(ref(db, `channels/${id}`)) }
  const toggle = async(id:string, field:string, val:any)=>{ await update(ref(db, `channels/${id}`), { [field]: val }) }
  return (
    <div className="mt-6 space-y-4">
      <div className="bg-[#13131c] border border-white/10 rounded-2xl p-4">
        <h3 className="font-bold text-sm">{editId ? 'Edit Channel' : 'Add Channel'}</h3>
        <div className="mt-3 grid md:grid-cols-2 gap-3">
          <input placeholder="id (e.g. t-sports)" value={form.id} onChange={e=>setForm({...form, id:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')})} className="bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm" disabled={!!editId} />
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm" />
          <input placeholder="Logo URL (or empty for SM TV logo)" value={form.logo} onChange={e=>setForm({...form, logo:e.target.value})} className="bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm md:col-span-2" />
          <input placeholder="Stream m3u8 URL" value={form.streamUrl} onChange={e=>setForm({...form, streamUrl:e.target.value})} className="bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm md:col-span-2" />
          <input placeholder="CategoryId" value={form.categoryId} onChange={e=>setForm({...form, categoryId:e.target.value})} className="bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm" />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form, featured:e.target.checked})} /> Featured</label>
            <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={form.enabled} onChange={e=>setForm({...form, enabled:e.target.checked})} /> Enabled</label>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} className="bg-white text-black rounded-full px-5 h-9 font-bold text-xs">{editId ? 'Update' : 'Add Channel'}</button>
          {editId && <button onClick={()=>{ setEditId(null); setForm({ id:'', name:'', logo:'', streamUrl:'', categoryId:'sports', featured:false, enabled:true })}} className="bg-white/10 border border-white/15 rounded-full px-4 h-9 text-xs font-bold">Cancel</button>}
        </div>
      </div>
      <div className="space-y-2">
        {Object.entries(data).length===0 && <div className="text-sm text-zinc-500 text-center py-8">No Firebase channels (M3U fallback showing).</div>}
        {Object.entries(data).map(([id, v])=>(
          <div key={id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex gap-3 items-center">
            <img src={v.logo || '/sm-tv-logo.png'} alt={v.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" onError={(e)=>{ (e.target as HTMLImageElement).src='/sm-tv-logo.png'}} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{v.name} <span className="text-xs font-normal text-zinc-500">({id})</span></div>
              <div className="text-xs text-zinc-400 truncate">{v.categoryId} • {v.enabled?'enabled':'disabled'} • {v.featured?'featured':''} • order:{v.order || '-'}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={()=>toggle(id,'enabled',!v.enabled)} className={`rounded-full px-2.5 py-1 text-xs font-bold border ${v.enabled?'bg-emerald-500/15 border-emerald-500/20 text-emerald-300':'bg-zinc-800 border-white/10 text-zinc-400'}`}>{v.enabled?'ON':'OFF'}</button>
              <button onClick={()=>toggle(id,'featured',!v.featured)} className={`rounded-full px-2.5 py-1 text-xs font-bold border ${v.featured?'bg-amber-400 text-black':'bg-white/10 border-white/15 text-zinc-400'}`}>★</button>
              <button onClick={()=>{ setForm({ id, name:v.name, logo:v.logo||'', streamUrl:v.streamUrl||v.url||'', categoryId:v.categoryId||'sports', featured:!!v.featured, enabled: v.enabled!==false }); setEditId(id); window.scrollTo({top:0, behavior:'smooth'})}} className="w-8 h-8 rounded-full bg-white/10 border border-white/15 grid place-items-center text-xs">✎</button>
              <button onClick={()=>del(id)} className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/20 text-red-300 grid place-items-center text-xs">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function M3UTab({ existing }: { existing: Record<string, any>}){
  const [url, setUrl] = useState('https://go.skym3u.dev/ow52.m3u?t=3061&s=d87')
  const [preview, setPreview] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const load = async()=>{
    setLoading(true)
    try{ const arr = await fetchM3U(url); setPreview(arr.slice(0, 30)) }catch(e:any){ alert('Fetch failed: '+ e.message) } finally{ setLoading(false)}
  }
  const importAll = async()=>{
    setLoading(true)
    try{
      const arr = await fetchM3U(url)
      let added=0
      for (const c of arr) {
        if (existing[c.id]) continue
        await set(ref(db, `channels/${c.id}`), { name:c.name, logo:c.logo, streamUrl:c.streamUrl, categoryId:c.categoryId, featured:false, enabled:true, order: Date.now()+added })
        added++
      }
      alert(`Imported ${added} new channels (skipped ${arr.length-added} existing)`)
    } catch(e:any){ alert(e.message)} finally{ setLoading(false)}
  }
  return (
    <div className="mt-6 space-y-4">
      <div className="bg-[#13131c] border border-white/10 rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-sm">M3U Bulk Import</h3>
        <div className="flex gap-2">
          <input value={url} onChange={e=>setUrl(e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm" />
          <button onClick={load} disabled={loading} className="bg-white/10 border border-white/15 rounded-full px-4 h-10 font-bold text-xs disabled:opacity-50">Preview</button>
          <button onClick={importAll} disabled={loading} className="bg-white text-black rounded-full px-5 h-10 font-bold text-xs disabled:opacity-50">Import All to Firebase</button>
        </div>
        <p className="text-xs text-zinc-500">Existing: {Object.keys(existing).length} channels. Preview shows first 30.</p>
      </div>
      {preview && <div className="grid md:grid-cols-2 gap-2">{preview.map(p=><div key={p.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-2 flex gap-2 items-center"><img src={p.logo || '/sm-tv-logo.png'} className="w-8 h-8 rounded-lg object-cover" onError={(e)=>{(e.target as HTMLImageElement).src='/sm-tv-logo.png'}} /><div><div className="font-bold text-xs">{p.name}</div><div className="text-[11px] text-zinc-500 truncate max-w-[260px]">{p.streamUrl.slice(0,60)}...</div></div></div>)}</div>}
    </div>
  )
}

function OrderTab({ data }: { data: Record<string, any>}){
  const entries = Object.entries(data).sort((a,b)=> (a[1].order||999999) - (b[1].order||999999))
  const move = async(id:string, dir:number)=>{
    const idx = entries.findIndex(([k])=>k===id)
    if (idx<0) return
    const targetIdx = idx + dir
    if (targetIdx<0 || targetIdx>=entries.length) return
    const aId = entries[idx][0], bId = entries[targetIdx][0]
    const aOrder = entries[idx][1].order || idx*1000
    const bOrder = entries[targetIdx][1].order || targetIdx*1000
    await update(ref(db, `channels/${aId}`), { order: bOrder })
    await update(ref(db, `channels/${bId}`), { order: aOrder })
  }
  return (
    <div className="mt-6 space-y-2">
      <div className="text-xs text-zinc-500">Sort by order field. Use ▲▼ to reorder. Lower order shows first on Home.</div>
      {entries.map(([id, v], i)=>(
        <div key={id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex gap-3 items-center">
          <span className="text-xs font-bold text-zinc-500 w-6">#{i+1}</span>
          <img src={v.logo || '/sm-tv-logo.png'} className="w-8 h-8 rounded-lg object-cover" />
          <span className="flex-1 font-bold text-sm truncate">{v.name}</span>
          <div className="flex gap-1">
            <button onClick={()=>move(id,-1)} className="w-7 h-7 rounded-full bg-white/10 border border-white/15 grid place-items-center text-xs">▲</button>
            <button onClick={()=>move(id,1)} className="w-7 h-7 rounded-full bg-white/10 border border-white/15 grid place-items-center text-xs">▼</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function UsersTab({ data }: { data: Record<string, any>}){
  const entries = Object.entries(data)
  return (
    <div className="mt-6 space-y-3">
      <div className="text-xs text-zinc-500">{entries.length} users in Firebase (those who logged in/favorited).</div>
      {entries.length===0 && <div className="text-sm text-zinc-500 text-center py-6">No users yet.</div>}
      {entries.map(([uid, v])=>(
        <div key={uid} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">
          <div className="font-mono text-xs text-emerald-300 truncate">{uid}</div>
          <div className="text-xs text-zinc-400 mt-1">Favorites: {Array.isArray(v.favorites)? v.favorites.length : Object.keys(v.favorites||{}).length} • History: {Array.isArray(v.history)? v.history.length : Object.keys(v.history||{}).length} • WatchTime: {Object.keys(v.watchTime||{}).length} channels</div>
          <div className="mt-2 flex gap-1.5">
            <button onClick={async()=>{ if(confirm('Block '+uid+'?')) await set(ref(db, `users/${uid}/blocked`), true)}} className="rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-300 px-3 py-1 text-xs font-bold">Block</button>
            <button onClick={async()=>{ await remove(ref(db, `users/${uid}/blocked`))}} className="rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 px-3 py-1 text-xs font-bold">Unblock</button>
            <button onClick={async()=>{ if(confirm('Delete user data?')) await remove(ref(db, `users/${uid}`))}} className="rounded-full bg-red-500/15 border border-red-500/20 text-red-300 px-3 py-1 text-xs font-bold">Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function StatsTab({ stats, live, channelCount, userCount }: { stats:any, live:number, channelCount:number, userCount:number }){
  const totalViews = stats.totalViews || 12900
  const [channelViewers, setChannelViewers] = useState<Record<string, number>>({})
  useEffect(()=>{
    const un = onValue(ref(db, 'liveViewers'), snap=>{
      const val=snap.val() || {}
      const m:Record<string, number> = {}
      for (const [ch, tabs] of Object.entries(val as any)) {
        if (ch==='_global') continue
        m[ch] = Object.keys(tabs as any).length * 2
      }
      setChannelViewers(m)
    })
    return ()=>{ try{un()}catch{}}
  },[])
  const top = Object.entries(channelViewers).sort((a,b)=> b[1]-a[1]).slice(0,5)
  return (
    <div className="mt-6 grid md:grid-cols-2 gap-4">
      <div className="bg-[#13131c] border border-white/10 rounded-2xl p-4">
        <div className="text-xs tracking-widest font-bold text-zinc-400">LIVE NOW</div>
        <div className="text-3xl font-black mt-1">{live} viewers</div>
        <div className="text-xs text-zinc-500 mt-1">Global live (1 browser = 2)</div>
      </div>
      <div className="bg-[#13131c] border border-white/10 rounded-2xl p-4">
        <div className="text-xs tracking-widest font-bold text-zinc-400">TOTAL VIEWS</div>
        <div className="text-3xl font-black mt-1">{Number(totalViews).toLocaleString()}</div>
        <div className="text-xs text-zinc-500 mt-1">Cumulative (jog hbe)</div>
      </div>
      <div className="bg-[#13131c] border border-white/10 rounded-2xl p-4">
        <div className="text-xs tracking-widest font-bold text-zinc-400">CHANNELS / USERS</div>
        <div className="text-xl font-bold mt-1">{channelCount} channels • {userCount} users</div>
        <div className="text-xs text-zinc-500 mt-1">Firebase Realtime</div>
      </div>
      <div className="bg-[#13131c] border border-white/10 rounded-2xl p-4">
        <div className="text-xs tracking-widest font-bold text-zinc-400">TOP CHANNELS (live)</div>
        {top.length===0 ? <div className="text-xs text-zinc-500 mt-2">No live channel viewers yet</div> : top.map(([id,c])=> <div key={id} className="flex justify-between text-sm mt-1"><span className="truncate">{id}</span><span className="font-bold text-emerald-300">{c}</span></div>)}
      </div>
    </div>
  )
}

function AdsTab({ data }: { data: Record<string, any>}){
  const [home, setHome] = useState(data.home || '')
  const [player, setPlayer] = useState(data.player || '')
  const [enabled, setEnabled] = useState(data.enabled || false)
  useEffect(()=>{ setHome(data.home||''); setPlayer(data.player||''); setEnabled(!!data.enabled) },[data.home, data.player, data.enabled])
  const save = async()=>{ await set(ref(db, 'config/ads'), { home, player, enabled }) }
  return (
    <div className="mt-6 bg-[#13131c] border border-white/10 rounded-2xl p-4 space-y-3">
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)} /> Ads Enabled</label>
      <input placeholder="Home banner AdSense code / VAST tag" value={home} onChange={e=>setHome(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm" />
      <input placeholder="Player pre-roll VAST URL" value={player} onChange={e=>setPlayer(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm" />
      <button onClick={save} className="bg-white text-black rounded-full px-5 h-9 font-bold text-xs">Save Ads</button>
      <p className="text-xs text-zinc-500">Use Monetag/Adsterra VAST URL here. Frontend will read config/ads.</p>
    </div>
  )
}

function ConfigTab({ data }: { data: Record<string, any>}){
  const [name, setName] = useState(data.name || 'SM TV')
  const [logo, setLogo] = useState(data.logo || '/sm-tv-logo.png')
  const [about, setAbout] = useState(data.about || 'SM TV - Premium OTT')
  const [support, setSupport] = useState(data.support || 'support@smtv.live')
  useEffect(()=>{ setName(data.name||'SM TV'); setLogo(data.logo||'/sm-tv-logo.png'); setAbout(data.about||''); setSupport(data.support||'') },[data.name, data.logo, data.about, data.support])
  const save = async()=>{ await set(ref(db, 'config/app'), { name, logo, about, support }) }
  return (
    <div className="mt-6 bg-[#13131c] border border-white/10 rounded-2xl p-4 space-y-3">
      <input placeholder="App Name" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm" />
      <input placeholder="Logo URL" value={logo} onChange={e=>setLogo(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm" />
      <input placeholder="Support Email" value={support} onChange={e=>setSupport(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm" />
      <textarea placeholder="About" value={about} onChange={e=>setAbout(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm min-h-[80px]" />
      <button onClick={save} className="bg-white text-black rounded-full px-5 h-9 font-bold text-xs">Save Config</button>
    </div>
  )
}

function CategoriesTab({ data }: { data: Record<string, any>}){
  const [name, setName] = useState('')
  const add = async()=>{
    if (!name) return
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
    await set(ref(db, `categories/${id}`), { name })
    setName('')
  }
  return (
    <div className="mt-6 space-y-4">
      <div className="bg-[#13131c] border border-white/10 rounded-2xl p-4 flex gap-2">
        <input placeholder="Category name e.g. Sports" value={name} onChange={e=>setName(e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm" />
        <button onClick={add} className="bg-white text-black rounded-full px-5 h-10 font-bold text-xs">Add</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(data).map(([id, v])=>(
          <div key={id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex justify-between items-center">
            <span className="font-bold text-sm">{v.name || id}</span>
            <button onClick={()=>remove(ref(db, `categories/${id}`))} className="text-xs text-red-400">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function MaintenanceTab({ data }: { data:any }){
  const [enabled, setEnabled] = useState(data.enabled || false)
  const [message, setMessage] = useState(data.message || '')
  useEffect(()=>{ setEnabled(data.enabled); setMessage(data.message) },[data.enabled, data.message])
  const save = async()=>{ await set(ref(db, 'maintenance'), { enabled, message }) }
  return (
    <div className="mt-6 bg-[#13131c] border border-white/10 rounded-2xl p-4 space-y-3">
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)} /> Maintenance ON</label>
      <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="We're making some improvements..." className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm min-h-[90px]" />
      <button onClick={save} className="bg-white text-black rounded-full px-5 h-9 font-bold text-xs">Save Maintenance</button>
    </div>
  )
}

function NotificationsTab({ data }: { data: Record<string, any>}){
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const send = async()=>{
    if (!title) return
    await push(ref(db, 'notifications'), { title, body, time: new Date().toISOString(), read:false, type:'announcement' })
    await sendTelegram(title, body, 'https://sm-tv-lovat.vercel.app', '/sm-tv-logo.png')
    setTitle(''); setBody('')
  }
  return (
    <div className="mt-6 space-y-4">
      <div className="bg-[#13131c] border border-white/10 rounded-2xl p-4 space-y-3">
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl h-10 px-3 text-sm" />
        <textarea placeholder="Body" value={body} onChange={e=>setBody(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm min-h-[80px]" />
        <button onClick={send} className="bg-white text-black rounded-full px-5 h-9 font-bold text-xs">Send Notification</button>
      </div>
      <div className="space-y-2">
        {Object.entries(data).reverse().map(([id, v])=>(
          <div key={id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex justify-between gap-3">
            <div><div className="font-bold text-sm">{v.title}</div><div className="text-xs text-zinc-400">{v.body}</div></div>
            <button onClick={()=>remove(ref(db, `notifications/${id}`))} className="text-xs text-red-400 shrink-0">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function BackupTab({ channels, categories, users, stats }: { channels: any, categories: any, users: any, stats: any }){
  const exportJson = ()=>{
    const data = { channels, categories, users, stats, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`smtv-backup-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url)
  }
  const restore = async(e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0]; if (!file) return
    const text = await file.text(); const json = JSON.parse(text)
    if (json.channels) await set(ref(db, 'channels'), json.channels)
    if (json.categories) await set(ref(db, 'categories'), json.categories)
    alert('Restore done')
  }
  return (
    <div className="mt-6 bg-[#13131c] border border-white/10 rounded-2xl p-4 space-y-3">
      <h3 className="font-bold text-sm">Backup / Restore</h3>
      <div className="flex gap-2">
        <button onClick={exportJson} className="bg-white text-black rounded-full px-5 h-9 font-bold text-xs">Export JSON</button>
        <label className="bg-white/10 border border-white/15 rounded-full px-5 h-9 grid place-items-center font-bold text-xs cursor-pointer">Import JSON<input type="file" accept=".json" onChange={restore} className="hidden" /></label>
      </div>
      <p className="text-xs text-zinc-500">Exports all Firebase data for offline backup.</p>
    </div>
  )
}
