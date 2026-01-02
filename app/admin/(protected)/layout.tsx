// C:\Projeler\nost-copy\app\admin\(protected)\layout.tsx

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import React from "react";
import "../admin-theme.css";
import AdminLayoutClient from "./_components/admin-layout-client";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
