// app/_components/NavigationBar/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ProductPreview } from "./types";

interface ProductCardProps {
  product: ProductPreview;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/${product.slug}`}
      className="
        group/card flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 
        border border-gray-200 dark:border-zinc-800 rounded-lg 
        hover:border-primary/50 hover:shadow-md transition-all h-20
      "
    >
      {/* Sol: Ufak Resim */}
      <div className="relative w-14 h-14 shrink-0 rounded-md bg-gray-50 dark:bg-zinc-950 overflow-hidden border border-gray-100 dark:border-zinc-800">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover/card:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">
            NO IMG
          </div>
        )}
      </div>

      {/* Sağ: İsim ve Fiyat */}
      <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
        <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover/card:text-primary leading-tight line-clamp-2 transition-colors">
          {product.name}
        </h4>
        {product.price !== undefined && product.price > 0 && (
          <span className="text-[10px] font-medium text-gray-500 mt-1">
            {product.price} TL
          </span>
        )}
      </div>
    </Link>
  );
}
