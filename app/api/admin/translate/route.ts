// app/api/admin/translate/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // sourceLang opsiyonel, gönderilmezse 'auto' olur.
    const { text, targetLang, sourceLang = "auto" } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ text: "" });
    }

    // Google Translate Free Endpoint (GTX Client)
    // sl (source language) parametresini dinamik yapıyoruz.
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Translation API error");

    const data = await res.json();

    // Google API yanıtını birleştir
    const translatedText = data[0].map((item: any) => item[0]).join("");

    return NextResponse.json({ text: translatedText });
  } catch (error: any) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: error.message || "Çeviri başarısız" },
      { status: 500 }
    );
  }
}
