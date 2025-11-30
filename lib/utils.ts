// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
    İ: "i",
    ı: "i",
    ö: "o",
    Ö: "o",
  };

  return text
    .split("")
    .map((char) => trMap[char] || char)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Alfanümerik, boşluk ve tire haricindekileri at
    .replace(/\s+/g, "-") // Boşlukları tireye çevir
    .replace(/-+/g, "-"); // Tekrarlayan tireleri tek'e indir
}
