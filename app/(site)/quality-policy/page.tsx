// app/quality-policy/page.tsx
import GenericContentPage from '@/app/_components/ContentPage/GenericContentPage'

export const metadata = {
  title: 'Kalite Politikamız | Nost Copy',
  description: 'Nost Copy kalite standartları ve politikaları.'
}

export default function QualityPolicyPage () {
  // 'quality-policy' slug'ı veritabanındaki "slug" kolonuyla eşleşmeli
  return <GenericContentPage slug='quality-policy' />
}
