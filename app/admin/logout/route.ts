// @/app/admin/logout/route.ts
import { NextResponse } from "next/server";
const AUTH_COOKIE = "auth";

export async function GET(req: Request) {
  const url = new URL("/admin/login", req.url);
  const res = NextResponse.redirect(url);
  res.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(0),
  });
  return res;
}
