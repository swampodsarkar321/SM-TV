import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Channel, WatchHistoryItem } from '../types'
import { useAuth } from './AuthContext'
import { db } from '../firebase/config'
import { ref, set, onValue } from 'firebase/database'

type AppCtx = {
  favorites: string[]
  toggleFavorite: (id:string)=>void
  isFav: (id:string)=>boolean
  history: WatchHistoryItem[]
  addToHistory: (ch: Channel, seconds?: number)=>void
  continueWatching: WatchHistoryItem[]
  totalWatchTime: number // minutes
  search: string
  setSearch: (s:string)=>void
}

const Ctx = createContext<AppCtx>(null as any)

function loadLocal<T>(k:string, fb:T):T { try{ const v=localStorage.getItem(k); return v? JSON.parse(v):fb } catch { return fb } }

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>(()=> loadLocal('fav', []))
  const [history, setHistory] = useState<WatchHistoryItem[]>(()=> loadLocal('history', []))
  const [search, setSearch] = useState('')

  // sync favorites to firebase if logged in
  useEffect(()=>{
    if (!user) return
    const r = ref(db, `users/${user.uid}/favorites`)
    const unsub = onValue(r, snap=>{
      const v = snap.val()
      if (v) {
        const arr = Array.isArray(v) ? v : Object.keys(v)
        setFavorites(arr)
      }
    }, ()=>{})
    return ()=>{ try{unsub()}catch{}}
  },[user])

  useEffect(()=>{ localStorage.setItem('fav', JSON.stringify(favorites)); if (user) { try{ set(ref(db, `users/${user.uid}/favorites`), favorites) }catch{} } },[favorites, user])
  useEffect(()=>{ localStorage.setItem('history', JSON.stringify(history)); },[history])

  // load history from firebase if exists
  useEffect(()=>{
    if (!user) return
    const r = ref(db, `users/${user.uid}/history`)
    const unsub = onValue(r, snap=>{
      const v = snap.val()
      if (v) {
        const arr: WatchHistoryItem[] = Array.isArray(v) ? v : Object.values(v as any)
        if (arr.length) setHistory(arr as any)
      }
    })
    return ()=>{ try{unsub()}catch{} }
  },[user])

  const toggleFavorite = (id:string) => setFavorites(p=> p.includes(id)? p.filter(x=>x!==id) : [...p, id])
  const isFav = (id:string)=> favorites.includes(id)

  const addToHistory = (ch: Channel, seconds=0)=>{
    const now = new Date().toISOString()
    const entry: WatchHistoryItem = {
      channelId: ch.id,
      channelName: ch.name,
      logo: ch.logo,
      watchedAt: now,
      durationMinutes: Math.max(1, Math.round(seconds/60) || 1),
      progressSeconds: seconds
    }
    setHistory(prev=>{
      const filtered = prev.filter(h=> h.channelId !== ch.id)
      const next = [entry, ...filtered].slice(0, 50)
      if (user) { try{ set(ref(db, `users/${user.uid}/history`), next) }catch{} }
      // also sync watchTime aggregation
      if (user) { try{ set(ref(db, `users/${user.uid}/watchTime/${ch.id}`), { seconds, updatedAt: now }) }catch{} }
      return next
    })
  }

  const continueWatching = history.slice(0, 6)
  const totalWatchTime = history.reduce((s,h)=> s + h.durationMinutes, 0)

  return <Ctx.Provider value={{ favorites, toggleFavorite, isFav, history, addToHistory, continueWatching, totalWatchTime, search, setSearch }}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
