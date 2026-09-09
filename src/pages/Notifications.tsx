import { useRealtimeData } from '../hooks/useRealtimeData'
import EmptyState from '../components/EmptyState'

export default function Notifications(){
  const { notifications } = useRealtimeData()
  if (!notifications.length) return <div className="max-w-[960px] mx-auto px-4"><EmptyState icon="🔔" title="No Notifications" desc="You're all caught up." /></div>
  return (
    <div className="max-w-[960px] mx-auto px-4 py-6">
      <h1 className="text-xl font-black">Notifications</h1>
      <div className="mt-4 space-y-3">
        {notifications.map(n=>(
          <div key={n.id} className="bg-[#14141f] border border-white/10 rounded-2xl p-4 flex gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center text-sm shrink-0">{n.type==='channel' ? '🆕' : n.type==='maintenance' ? '🔧' : '📢'}</div>
            <div className="flex-1">
              <div className="font-semibold text-sm flex items-center gap-2">{n.title} {!n.read && <span className="w-2 h-2 bg-red-500 rounded-full" />}</div>
              <div className="text-sm text-zinc-400 mt-1 leading-relaxed">{n.body}</div>
              <div className="text-[11px] text-zinc-500 mt-2">{new Date(n.time).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
