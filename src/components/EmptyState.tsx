export default function EmptyState({ icon='📺', title, desc, action }: { icon?: string, title: string, desc?: string, action?: React.ReactNode }){
  return (
    <div className="py-16 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#1a1a28] to-[#12121a] border border-white/10 grid place-items-center text-2xl mb-4 shadow-xl">{icon}</div>
      <div className="font-black tracking-tight text-lg">{title}</div>
      {desc && <div className="text-sm text-zinc-400 mt-1 max-w-[360px] leading-relaxed">{desc}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
