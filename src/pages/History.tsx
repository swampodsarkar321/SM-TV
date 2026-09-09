import { Link } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import EmptyState from '../components/EmptyState'
import { formatTimeAgo, getWatchTimeLabel } from '../utils/helpers'

export default function History(){
  const { history } = useApp()
  if (history.length===0) return <div className="max-w-[1280px] mx-auto px-4"><EmptyState icon="🕐" title="No Watch History" desc="Start watching Live TV." action={<Link to="/live" className="bg-white text-black rounded-full px-5 h-10 inline-flex items-center font-semibold text-sm">Start Watching</Link>} /></div>
  return (
    <div className="max-w-[960px] mx-auto px-4 py-6">
      <h1 className="text-xl font-black">Recently Watched</h1>
      <div className="mt-4 space-y-3">
        {history.map(h=>(
          <Link key={h.channelId+'-'+h.watchedAt} to={`/channel/${h.channelId}`} className="flex gap-4 bg-[#14141f] border border-white/10 rounded-2xl p-4 hover:border-white/15 transition">
            <img src={h.logo} alt={h.channelName} className="w-14 h-14 rounded-xl bg-white/5 object-contain p-1" />
            <div className="flex-1">
              <div className="font-semibold">{h.channelName}</div>
              <div className="text-xs text-zinc-400 mt-1">{formatTimeAgo(h.watchedAt)} • {getWatchTimeLabel(h.durationMinutes)} watched</div>
            </div>
            <span className="text-zinc-500">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
