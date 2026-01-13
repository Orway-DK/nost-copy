// app/_components/GlobalBackground.tsx
export default function GlobalBackground () {
  return (
    <div className='fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-background transition-colors duration-300'>
      {/* NOT: Light mode için opacity değerlerini artırdık (ör: opacity-60).
         Dark mode (dark:...) için eski düşük değerleri (opacity-30/40) koruduk.
      */}

      {/* 1. Sol Üst (Mavi/Mor tonlar) */}
      <div className='absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/30 dark:bg-primary/20 blur-[100px] md:blur-[120px] opacity-60 dark:opacity-40 animate-pulse-slow' />

      {/* 2. Sağ Orta (Mor) */}
      <div className='absolute top-[30%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-purple-400/30 dark:bg-purple-500/10 blur-[90px] md:blur-[100px] opacity-50 dark:opacity-30' />

      {/* 3. Sol Alt (Mavi) */}
      <div className='absolute bottom-[10%] -left-[5%] w-[35vw] h-[35vw] rounded-full bg-blue-400/30 dark:bg-blue-500/10 blur-[100px] md:blur-[130px] opacity-50 dark:opacity-30' />

      {/* 4. Sağ Alt (Primary) */}
      <div className='absolute -bottom-[10%] right-[10%] w-[45vw] h-[45vw] rounded-full bg-primary/25 dark:bg-primary/15 blur-[120px] md:blur-[150px] opacity-60 dark:opacity-40 animate-pulse-slow' />
    </div>
  )
}
