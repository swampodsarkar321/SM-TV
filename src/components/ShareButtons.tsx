export default function ShareButtons({ title, url }: { title: string, url: string }){
  const shareUrl = encodeURIComponent(url)
  const shareTitle = encodeURIComponent(title)
  const copy = async()=>{
    await navigator.clipboard.writeText(url)
    alert('Link copied!')
  }
  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <span className="text-xs font-bold tracking-widest text-zinc-500">SHARE:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-[#1877F2] text-white grid place-items-center text-xs font-bold hover:scale-105 transition">f</a>
      <a href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-[#25D366] text-white grid place-items-center text-xs font-bold hover:scale-105 transition">W</a>
      <a href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-[#229ED9] text-white grid place-items-center text-xs font-bold hover:scale-105 transition">TG</a>
      <button onClick={copy} className="h-8 rounded-full bg-white text-black px-3 text-xs font-bold hover:bg-zinc-100 transition flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3"/></svg> Copy
      </button>
    </div>
  )
}
