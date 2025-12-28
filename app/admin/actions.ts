// app/admin/actions.ts
"use server";

// --- TRANSLATE ACTION ---
export async function translateTextAction(
  text: string,
  targetLang: string,
  sourceLang: string = "auto"
) {
  try {
    if (!text || !text.trim()) return { success: true, text: "" };

    // Google Translate Free Endpoint (GTX)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Translation API connection failed");

    const data = await res.json();
    // Google API yanıtını birleştir
    const translatedText = data[0].map((item: any) => item[0]).join("");

    return { success: true, text: translatedText };
  } catch (error: any) {
    console.error("Translate Error:", error);
    return { success: false, error: "Çeviri servisi yanıt vermedi." };
  }
}