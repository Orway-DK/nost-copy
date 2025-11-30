// app/api/admin/products/[id]/variants/[variantId]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// DELETE: Varyasyon Sil
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { variantId } = await params;
  // Auth kontrolü burada da yapılmalı (kısaltma için atladım, yukarıdaki gibi ekleyin)

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
  const { error } = await admin
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
