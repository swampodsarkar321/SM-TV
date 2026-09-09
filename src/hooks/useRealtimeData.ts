import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db, isDemo } from '../firebase/config'
import { mockCategories, mockChannels, mockMaintenance, mockNotifications } from '../data/mockData'
import type { Category, Channel, Maintenance, NotificationItem } from '../types'
import { fetchM3U } from '../utils/m3uParser'

export function useRealtimeData() {
  const [channels, setChannels] = useState<Channel[]>(mockChannels)
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [maintenance, setMaintenance] = useState<Maintenance>(mockMaintenance)
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications)
  const [loading, setLoading] = useState(true)
  const [m3uChannels, setM3uChannels] = useState<Channel[] | null>(null)
  const [m3uError, setM3uError] = useState<string | null>(null)

  // Load M3U — all channels from SkyM3U (requested URL)
  useEffect(() => {
    let cancelled = false
    const cached = localStorage.getItem('m3u_cache')
    const cachedTime = Number(localStorage.getItem('m3u_cache_time') || 0)
    // use cache if < 30 min
    if (cached && Date.now() - cachedTime < 30 * 60 * 1000) {
      try { const arr = JSON.parse(cached); if (Array.isArray(arr) && arr.length) { setM3uChannels(arr); setM3uError(null) } } catch {}
    }
    fetchM3U().then(arr => {
      if (cancelled) return
      if (arr.length) {
        setM3uChannels(arr)
        localStorage.setItem('m3u_cache', JSON.stringify(arr))
        localStorage.setItem('m3u_cache_time', String(Date.now()))
        // derive categories from m3u
        const cats = new Map<string,string>()
        arr.forEach(c => cats.set(c.categoryId, c.categoryName || c.categoryId))
        if (cats.size) {
          const catList: Category[] = [{ id: 'all', name: 'All' }, ...[...cats.entries()].map(([id, name]) => ({ id, name }))]
          setCategories(catList)
        }
        setM3uError(null)
      }
    }).catch(e => {
      if (cancelled) return
      setM3uError(String((e as Error).message || e))
      // keep mock fallback, so app still works
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (isDemo) {
      const t = setTimeout(() => setLoading(false), 700)
      return () => clearTimeout(t)
    }
    setLoading(true)
    const unsubs: (()=>void)[] = []

    // channels: expected structure /channels/{id}
    try {
      const chRef = ref(db, 'channels')
      const u1 = onValue(chRef, snap => {
        const val = snap.val()
        if (val) {
          const arr: Channel[] = Object.entries(val).map(([id, v]: any) => ({
            id,
            name: v.name || id,
            logo: v.logo || '',
            streamUrl: v.streamUrl || v.url || '',
            categoryId: v.categoryId || v.category || 'all',
            categoryName: v.categoryName,
            featured: !!v.featured,
            enabled: v.enabled !== false,
            description: v.description || '',
            keywords: v.keywords || '',
          }))
          setChannels(arr)
        }
        setLoading(false)
      }, () => setLoading(false))
      unsubs.push(u1)
    } catch { setLoading(false) }

    try {
      const catRef = ref(db, 'categories')
      const u2 = onValue(catRef, snap => {
        const val = snap.val()
        if (val) {
          const arr: Category[] = Object.entries(val).map(([id, v]: any) => ({ id, name: (v as any).name || id }))
          setCategories([{id:'all',name:'All'}, ...arr])
        }
      })
      unsubs.push(u2)
    } catch {}

    try {
      const mRef = ref(db, 'maintenance')
      const u3 = onValue(mRef, snap => {
        const val = snap.val()
        if (val) setMaintenance({ enabled: !!val.enabled, message: val.message || mockMaintenance.message })
      })
      unsubs.push(u3)
    } catch {}

    try {
      const nRef = ref(db, 'notifications')
      const u4 = onValue(nRef, snap => {
        const val = snap.val()
        if (val) {
          const arr: NotificationItem[] = Object.entries(val).map(([id, v]: any) => ({
            id, title: v.title, body: v.body || v.message, time: v.time || new Date().toISOString(), read: !!v.read, type: v.type || 'announcement'
          }))
          setNotifications(arr.reverse())
        }
      })
      unsubs.push(u4)
    } catch {}

    return () => unsubs.forEach(fn => { try{fn()}catch{} })
  }, [])

  const mergedChannels = m3uChannels && m3uChannels.length ? m3uChannels : channels
  const activeChannels = mergedChannels.filter(c => c.enabled)
  const featuredChannels = activeChannels.filter(c => c.featured)
  // if m3u has no featured, promote first 3 as featured for carousel
  const effectiveFeatured = featuredChannels.length ? featuredChannels : activeChannels.slice(0, 3).map(c => ({ ...c, featured: true }))

  const refreshM3U = async () => {
    setM3uError(null)
    try {
      const arr = await fetchM3U()
      setM3uChannels(arr)
      localStorage.setItem('m3u_cache', JSON.stringify(arr))
      localStorage.setItem('m3u_cache_time', String(Date.now()))
      const cats = new Map<string,string>()
      arr.forEach(c => cats.set(c.categoryId, c.categoryName || c.categoryId))
      if (cats.size) setCategories([{ id: 'all', name: 'All' }, ...[...cats.entries()].map(([id, name]) => ({ id, name }))])
    } catch (e:any) { setM3uError(String(e?.message || e)) }
  }

  return { channels: mergedChannels, activeChannels, featuredChannels: effectiveFeatured, categories, maintenance, notifications, loading, m3uError, refreshM3U, m3uCount: m3uChannels?.length || 0 }
}
