// src/lib/constants.ts

export type Channel = "c" | "m" | "y" | "k";
export type VariationMode = "2-axis" | "4-way";
export type OperationMode = "add" | "subtract";

export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface PaperSize {
  id: string;
  name: string;
  w: number; // mm
  h: number; // mm
}

export interface TemplateSpec {
  id: string;
  name: string;
  type: "none" | "summa" | "plotter";
  safeMarginTop: number;
  safeMarginBottom: number;
  safeMarginLeft: number;
  safeMarginRight: number;
}

export const PAPER_PRESETS: PaperSize[] = [
  { id: "konica", name: "Konica (330x487mm)", w: 330, h: 487 },
  { id: "xerox", name: "Xerox / Standart (350x500mm)", w: 350, h: 500 },
  { id: "b2", name: "B2 (500x700mm)", w: 500, h: 700 },
];

export const TEMPLATE_PRESETS: TemplateSpec[] = [
  {
    id: "none",
    name: "Şablonsuz (Ham)",
    type: "none",
    safeMarginTop: 5,
    safeMarginBottom: 5,
    safeMarginLeft: 5,
    safeMarginRight: 5,
  },
  {
    id: "summa",
    name: "Summa (Etiket/Yarım Kesim)",
    type: "summa",
    // Summa sensörleri için genelde üstten/alttan pay gerekir
    safeMarginTop: 15,
    safeMarginBottom: 15,
    safeMarginLeft: 10,
    safeMarginRight: 10,
  },
  {
    id: "plotter",
    name: "Plotter (Standart Kesim)",
    type: "plotter",
    // Plotter noktaları için paylar
    safeMarginTop: 10,
    safeMarginBottom: 10,
    safeMarginLeft: 10,
    safeMarginRight: 10,
  },
];

// Renk Yardımcıları
export function cmykToRgbString(
  c: number,
  m: number,
  y: number,
  k: number
): string {
  const r = 255 * (1 - c / 100) * (1 - k / 100);
  const g = 255 * (1 - m / 100) * (1 - k / 100);
  const b = 255 * (1 - y / 100) * (1 - k / 100);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export function getContrastColor(
  c: number,
  m: number,
  y: number,
  k: number
): string {
  const totalInk = c + m + y + k;
  return k > 50 || totalInk > 220 ? "#ffffff" : "#000000";
}
