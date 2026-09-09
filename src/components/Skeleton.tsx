export function HomeSkeleton(){
  return (
    <div className="space-y-6">
      <div className="h-[380px] rounded-[28px] shimmer" />
      <div className="flex gap-3">
        {Array.from({length:4}).map((_,i)=>(<div key={i} className="h-10 w-20 rounded-full shimmer" />))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({length:12}).map((_,i)=>(<div key={i} className="h-[162px] rounded-[20px] shimmer" />))}
      </div>
    </div>
  )
}
