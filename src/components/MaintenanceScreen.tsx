export default function MaintenanceScreen({ message, onRetry }: { message: string, onRetry?:()=>void }){
  return (
    <div className="min-h-[60vh] grid place-items-center p-8">
      <div className="max-w-[440px] w-full bg-gradient-to-b from-[#1a1a28] to-[#13131d] border border-white/10 rounded-[28px] p-8 text-center shadow-[0_24px_64px_rgba(0,0,0,.5)]">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/20 grid place-items-center text-2xl mb-4">🔧</div>
        <div className="text-xl font-black tracking-tight">Under Maintenance</div>
        <div className="text-sm text-zinc-400 mt-2 leading-relaxed">{message}</div>
        {onRetry && <button onClick={onRetry} className="mt-6 bg-white text-black rounded-full px-6 h-11 font-bold text-sm w-full shadow-lg hover:bg-zinc-100 transition">RETRY</button>}
      </div>
    </div>
  )
}
