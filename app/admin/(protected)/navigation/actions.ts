'use server'

import translate from 'google-translate-api-x'

/**
 * Google Translate (Unofficial) kullanarak metni çevirir.
 * API Key veya Kredi Kartı gerektirmez.
 */
export async function translateText (text: string, targetLang: 'en' | 'de') {
  try {
    // Boş metin gelirse işlem yapma
    if (!text || text.trim() === '') return ''

    // Google Translate'e istek at
    // rejectOnPartialFail: false -> Biri başarısız olsa da diğerlerini döndürsün
    const res = await translate(text, {
      to: targetLang,
      autoCorrect: true
    })

    // Gelen sonuç bir array veya obje olabilir, kütüphane yapısına göre text'i alıyoruz
    return res.text
  } catch (error) {
    console.error('Translation Error:', error)

    // Hata olursa (Google engellerse vs.) orijinal metni + dil kodunu döndür (Fallback)
    // Böylece uygulaman çökmez, sadece çeviri yapılmamış olur.
    return `${text} [${targetLang.toUpperCase()}]`
  }
}
