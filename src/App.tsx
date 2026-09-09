import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import LiveTV from './pages/LiveTV'
import ChannelPage from './pages/ChannelPage'
import SearchPage from './pages/Search'
import Favorites from './pages/Favorites'
import History from './pages/History'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import { useRealtimeData } from './hooks/useRealtimeData'
import MaintenanceScreen from './components/MaintenanceScreen'
import OfflineBanner from './components/OfflineBanner'

function CategoryPage(){
  // route /category/:id shares LiveTV filtering
  return <LiveTV />
}

function Settings(){
  return (
    <div className="max-w-[960px] mx-auto px-4 py-6">
      <h1 className="text-xl font-black">Settings</h1>
      <div className="mt-4 space-y-3">
        <div className="bg-[#14141f] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div><div className="font-semibold text-sm">Quality</div><div className="text-xs text-zinc-400">Auto (HLS adaptive)</div></div><span className="text-zinc-500">›</span>
        </div>
        <div className="bg-[#14141f] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div><div className="font-semibold text-sm">About</div><div className="text-xs text-zinc-400">SM TV Web v1.0 • Firebase synced</div></div><span className="text-zinc-500">›</span>
        </div>
      </div>
    </div>
  )
}

export default function App(){
  const { maintenance } = useRealtimeData()
  // global maintenance overlay (but allow login? spec says full content replaced)
  const showMaintenance = maintenance.enabled

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-transparent text-white selection:bg-red-500/30">
        <Header />
        <OfflineBanner />
        {showMaintenance ? (
          <MaintenanceScreen message={maintenance.message} onRetry={()=>location.reload()} />
        ) : (
          <main className="pb-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/live" element={<LiveTV />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/channel/:channelId" element={<ChannelPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/history" element={<History />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        )}
        <footer className="border-t border-white/[0.06] py-7 text-center text-xs text-zinc-500">
          <div className="max-w-[1320px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} SM TV — Premium OTT • Firebase Realtime Sync</span>
            <span className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[11px] tracking-widest font-bold text-zinc-400">Android App + Web App + Admin App</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}
