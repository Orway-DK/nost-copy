export default function MaintenancePage () {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4 text-center'>
      <div className='animate-pulse mb-8'>
        {/* Logon */}
        <h1 className='text-4xl font-bold'>NOST COPY</h1>
      </div>
      <h2 className='text-2xl md:text-3xl font-bold mb-4'>
        Sistem Bakım Çalışması
      </h2>
      <p className='text-gray-400 max-w-md'>
        Daha iyi hizmet verebilmek için kısa bir bakım çalışması yapıyoruz.
        Lütfen daha sonra tekrar ziyaret ediniz.
      </p>
    </div>
  )
}
