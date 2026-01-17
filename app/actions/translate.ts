'use server'

export async function translateTextAction (text: string, targetLang: string) {
  if (!text) return ''

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`

    const response = await fetch(url)
    const data = await response.json()

    /**
     * Gelen veri yapısı uzun metinlerde şöyledir:
     * data[0] = [ [parça1_çeviri, parça1_orjinal], [parça2_çeviri, parça2_orjinal]... ]
     * Bu yüzden sadece data[0][0][0] almak yerine tüm parçaları birleştirmeliyiz.
     */
    if (data && data[0]) {
      let fullTranslation = ''

      // Tüm parçaları (sentences/segments) dön ve birleştir
      data[0].forEach((segment: any) => {
        if (segment[0]) {
          fullTranslation += segment[0]
        }
      })

      return fullTranslation || text
    }

    return text
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}
