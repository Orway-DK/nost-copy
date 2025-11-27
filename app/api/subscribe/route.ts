import { NextResponse } from "next/server";

// Read env inside handler, not at module top.
function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY; // optional
  return { url, anon, service };
}

export async function POST(req: Request) {
  const { url, anon } = getSupabaseEnv();
  if (!url || !anon) {
    // Fail gracefully instead of throwing during build/module init
    return NextResponse.json(
      {
        error:
          "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
      { status: 500 }
    );
  }

  // Dynamically import to avoid bundler evaluating client at module time
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, anon);

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Example: insert subscription email
  const { email } = payload || {};
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, subscriber: data }, { status: 200 });
}

// Optional: GET handler to check health
export async function GET() {
  const { url, anon } = getSupabaseEnv();
  if (!url || !anon) {
    return NextResponse.json(
      { ok: false, reason: "Supabase env vars missing" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
