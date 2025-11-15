// app/admin/layout.tsx
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import Header from "./_components/Header";
import Sidebar from "./_components/Sidebar";

type AuthCookie = { email?: string };

function parseAuth(raw?: string): AuthCookie | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthCookie; } catch { return null; }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const raw = (await cookies()).get("auth")?.value;
  const auth = parseAuth(raw);
  const isAuthed = Boolean(auth?.email);
  const userEmail = auth?.email ?? "";

  return (
    <section className="flex min-h-screen flex-col bg-background">
      {isAuthed && (
        <header className="sticky top-0 z-10">
          <Header userEmail={userEmail} />
        </header>
      )}
      <div className="w-full flex flex-row">
        {isAuthed && <Sidebar />}
        <main className="flex-1 ml-70 my-4 mr-4">
          {children}
        </main>
      </div>
    </section>
  );
}
