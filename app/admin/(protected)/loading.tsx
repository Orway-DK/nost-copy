export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
      {/* Spinner */}
      <div className="relative h-12 w-12">
        {/* Dış Halka */}
        <div className="absolute inset-0 rounded-full border-4 border-admin-card-border opacity-30"></div>
        {/* Dönen Halka (Accent Rengi) */}
        <div className="absolute inset-0 rounded-full border-4 border-t-admin-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      
      {/* Yükleniyor Yazısı */}
      <p className="text-admin-sm font-medium text-admin-muted animate-pulse">
        Yükleniyor...
      </p>
    </div>
  )
}