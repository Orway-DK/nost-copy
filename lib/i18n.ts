// i18n.ts
export const SUPPORTED_LANGS = ["tr", "en", "de"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export function isLang(x: string): x is Lang {
  return SUPPORTED_LANGS.includes(x as Lang);
}
