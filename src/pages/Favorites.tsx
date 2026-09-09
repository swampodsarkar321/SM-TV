import { useRealtimeData } from '../hooks/useRealtimeData'
import ChannelCard from '../components/ChannelCard'
import EmptyState from '../components/EmptyState'
import { Link } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'

export default function Favorites(){
  const { activeChannels } = useRealtimeData()
  const { favorites } = useApp()
  const favChannels = activeChannels.filter(c=> favorites.includes(c.id))
  if (favChannels.length===0) return <div className="max-w-[1280px] mx-auto px-4"><EmptyState icon="❤️" title="No Favorites Yet" desc="Add channels to your favorites." action={<Link to="/live" className="bg-white text-black rounded-full px-5 h-10 inline-flex items-center font-semibold text-sm">Browse Channels</Link>} /></div>
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">
      <h1 className="text-xl font-black">❤️ MY FAVORITES</h1>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {favChannels.map(ch=> <ChannelCard key={ch.id} ch={ch} />)}
      </div>
    </div>
  )
}
