import { NextResponse } from "next/server";
import { hasAdminSessionCookie } from "@/lib/admin";
import { getReports } from "@/lib/data";

export async function GET(request: Request) {
  if (!hasAdminSessionCookie(request.headers.get("cookie"))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const reports = await getReports();
  return NextResponse.json({ reports });
}