import { useEffect, useState } from 'react'

export default function OfflineBanner(){
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(()=>{
    const on = ()=> setOffline(false)
    const off = ()=> setOffline(true)
    addEventListener('online', on)
    addEventListener('offline', off)
    return ()=>{ removeEventListener('online', on); removeEventListener('offline', off) }
  },[])
  if (!offline) return null
  return (
    <div className="bg-red-600 text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-2">
      📡 No Internet Connection — Please check your connection. <button onClick={()=>location.reload()} className="bg-white text-red-600 rounded-full px-3 py-1 text-xs font-bold">RETRY</button>
    </div>
  )
}
