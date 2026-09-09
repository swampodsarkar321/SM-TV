import type { Category } from '../types'

const iconMap: Record<string,string> = {
  all:'✦', news:'📰', sports:'⚽', entertainment:'🎬', music:'🎵', kids:'🧒', movies:'🎞️', international:'🌍'
}

export default function CategoryChips({ categories, active, onSelect }: { categories: Category[], active: string, onSelect:(id:string)=>void }){
  return (
    <div className="flex gap-2 overflow-auto no-scrollbar py-1 -mx-1 px-1">
      {categories.map(c=>{
        const on = active===c.id
        return (
          <button key={c.id} onClick={()=>onSelect(c.id)}
            className={`shrink-0 rounded-full px-4 h-9 text-[13px] font-bold border inline-flex items-center gap-1.5 transition ${on ? 'bg-white text-black border-white shadow-lg scale-[1.02]' : 'bg-white/[0.06] border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/15'}`}>
            <span className={`text-[11px] ${on ? '':'opacity-70'}`}>{iconMap[c.id] || '•'}</span> {c.name}
          </button>
        )
      })}
    </div>
  )
}
