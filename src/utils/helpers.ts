export function formatTimeAgo(iso:string){
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff/60000)
  if (m<1) return 'Just now'
  if (m<60) return `${m} min ago`
  const h = Math.floor(m/60)
  if (h<24) return `${h}h ago`
  const d = Math.floor(h/24)
  if (d===1) return 'Yesterday'
  return new Date(iso).toLocaleDateString()
}

export function slugify(s:string){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }

export function getWatchTimeLabel(min:number){
  if (min<60) return `${min}m`
  const h=Math.floor(min/60), m=min%60
  return `${h}h ${m}m`
}
