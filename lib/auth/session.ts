import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieName: "admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    path: "/",
  },
};

export async function getSession() {
  // Generic ile user tipini garanti ediyoruz
  return getIronSession<{
    user?: { id: string; email: string; role: "admin" };
  }>(await cookies(), sessionOptions);
}
