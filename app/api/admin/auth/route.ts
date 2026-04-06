import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidAdminPin } from "@/lib/admin";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { pin?: string };
  if (!isValidAdminPin(body.pin)) {
    return NextResponse.json({ message: "Invalid PIN." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: "unlocked",
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
