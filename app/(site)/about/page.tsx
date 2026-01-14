// C:\Projeler\nost-copy\app\(site)\about\page.tsx
import React from 'react'
import GenericContentPage from '@/app/_components/ContentPage/GenericContentPage'

export const metadata = {
  title: 'Hakkımızda - Nost Copy',
  description: "Nost Copy'nin hikayesi, vizyonu ve misyonu."
}

export default function AboutPage () {
  // Veritabanında oluşturduğumuz 'about-us' slug'ını çağırıyoruz.
  return <GenericContentPage slug='about-us' />
}
