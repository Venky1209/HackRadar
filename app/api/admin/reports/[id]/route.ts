import { NextResponse } from "next/server";
import { hasAdminSessionCookie } from "@/lib/admin";
import { deleteReport, resolveReport } from "@/lib/data";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!hasAdminSessionCookie(request.headers.get("cookie"))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const result = await resolveReport(id);
  return result.ok ? NextResponse.json({ message: result.message }) : NextResponse.json({ message: result.message }, { status: 400 });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!hasAdminSessionCookie(request.headers.get("cookie"))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteReport(id);
  return result.ok ? NextResponse.json({ message: result.message }) : NextResponse.json({ message: result.message }, { status: 400 });
}