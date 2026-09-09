import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { getWatchTimeLabel } from '../utils/helpers'

export default function Profile(){
  const { user } = useAuth()
  const { favorites, totalWatchTime, history } = useApp()
  const model = (navigator as any).userAgentData?.platform || navigator.platform || 'Web'
  return (
    <div className="max-w-[960px] mx-auto px-4 py-6">
      <h1 className="text-xl font-black">PROFILE</h1>
      <div className="mt-4 bg-[#14141f] border border-white/10 rounded-[24px] p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 grid place-items-center text-xl">👤</div>
          <div>
            <div className="font-bold">{user?.email || 'Guest User'}</div>
            <div className="text-xs text-zinc-400 mt-1">{user?.uid ? `UID: ${user.uid.slice(0,12)}…` : 'Continue as Guest'}</div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Device" value={model.slice(0,18)} icon="📱" />
          <Stat label="Member Since" value={history[history.length-1] ? new Date(history[history.length-1].watchedAt).toLocaleDateString() : 'Sep 2026'} icon="📅" />
          <Stat label="Total Watch Time" value={getWatchTimeLabel(totalWatchTime)} icon="⏱️" />
          <Stat label="Favorites" value={String(favorites.length)} icon="❤️" />
        </div>
        <div className="mt-6 text-[11px] text-zinc-500 leading-relaxed">Device model শুধু display information হিসেবে দেখানো হবে। Backend identity Firebase UID হবে।</div>
      </div>
    </div>
  )
}
function Stat({label, value, icon}:{label:string,value:string,icon:string}){
  return <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4"><div className="text-[11px] tracking-widest text-zinc-400 flex items-center gap-1">{icon} {label.toUpperCase()}</div><div className="font-bold mt-1">{value}</div></div>
}
