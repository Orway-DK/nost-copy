import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * Bu route client'tan gelen email'i güvenli şekilde Supabase'e kaydeder.
 * IP'yi hashleyerek (salt ile) basit rate-limit / abuse analizi için saklar.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // service role kullan (server only!)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Basit email regex (çok katı değil ama XSS'i engeller)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashIP(ip: string): string {
  // Salt kullan (env’de tut)
  const salt = process.env.SUBSCRIBE_IP_SALT || "fallback_salt_change_me";
  return crypto
    .createHash("sha256")
    .update(ip + salt)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.email !== "string") {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const rawEmail = body.email.trim().toLowerCase();
    const locale =
      typeof body.locale === "string" ? body.locale.slice(0, 10) : "unknown";
    const source =
      typeof body.source === "string" ? body.source.slice(0, 50) : "footer";

    if (rawEmail.length > 254) {
      return NextResponse.json(
        { ok: false, error: "Email too long" },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(rawEmail)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // IP alma (Reverse proxy / vercel vs.)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";
    const ipHash = hashIP(ip);

    // Rate-limit örneği: Son 5 dakikada aynı ipHash ile 10'dan fazla insert varsa engelle
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recent, error: recentErr } = await supabase
      .from("newsletter_subscriptions")
      .select("id", { count: "exact" })
      .gte("created_at", fiveMinutesAgo)
      .eq("ip_hash", ipHash);

    if (recentErr) {
      console.error("[subscribe] recentErr", recentErr);
    } else if ((recent?.length || 0) > 10) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts, please wait." },
        { status: 429 }
      );
    }

    // Upsert (email unique index olduğundan onConflict ile güncellenmez; yoksa insert)
    const { error: upsertErr } = await supabase
      .from("newsletter_subscriptions")
      .upsert(
        {
          email: rawEmail,
          locale,
          source,
          ip_hash: ipHash,
        },
        { onConflict: "email" }
      );

    if (upsertErr) {
      // Duplicate vs. unique error
      if (upsertErr.code === "23505") {
        return NextResponse.json(
          { ok: true, already: true, message: "Already subscribed." },
          { status: 200 }
        );
      }
      console.error("[subscribe] upsertErr", upsertErr);
      return NextResponse.json(
        { ok: false, error: "Database error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "Subscribed successfully." },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("[subscribe] exception", e);
    return NextResponse.json(
      { ok: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
