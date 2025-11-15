"use client";

export default function Header({ userEmail }: { userEmail: string }) {
  
  return (
    <nav className="flex flex-row justify-end items-center bg-foreground/20 w-full min-h-8 px-8">
      <div className="flex flex-row gap-4">
        <span className="text-sm text-foreground">{userEmail}</span>
        <a
          className="text-sm text-blue-600 hover:underline"
          href="/admin/logout"
        >
          Çıkış
        </a>
      </div>

    </nav>
  );
}
