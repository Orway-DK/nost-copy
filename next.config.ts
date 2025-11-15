// next.config.ts
import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

function collectHeroImages(): string[] {
  const heroDir = path.join(process.cwd(), "public", "hero");
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(heroDir, { withFileTypes: true })
      .filter((d) => d.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(d.name))
      .map((d) => `/hero/${d.name}`)
      .sort()
      .slice(0, 20);
  } catch {
    files = [];
  }
  return files;
}

const heroImages = collectHeroImages();

// Next.js env tipi string dictionary bekler
const envVars: Record<string, string> = {
  NEXT_PUBLIC_HERO_IMAGES: JSON.stringify(heroImages),
};

const nextConfig: NextConfig = {
  env: envVars,
  // İstersen kalite uyarısı için şunu açabilirsin:
  // images: { qualities: [70, 75] },
};

export default nextConfig;
