import { NextResponse } from "next/server";
import { hasAdminSessionCookie } from "@/lib/admin";
import { deleteHackathon, markHackathonExpired, updateHackathon } from "@/lib/data";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!hasAdminSessionCookie(request.headers.get("cookie"))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { action?: string; payload?: Record<string, unknown> };

  if (body.action === "expire") {
    const result = await markHackathonExpired(id);
    return result.ok ? NextResponse.json({ message: result.message }) : NextResponse.json({ message: result.message }, { status: 400 });
  }

  const result = await updateHackathon(id, (body.payload ?? body) as Partial<import("@/lib/types").HackathonRow>);
  return result.ok ? NextResponse.json({ message: result.message }) : NextResponse.json({ message: result.message }, { status: 400 });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!hasAdminSessionCookie(_request.headers.get("cookie"))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteHackathon(id);
  return result.ok ? NextResponse.json({ message: result.message }) : NextResponse.json({ message: result.message }, { status: 400 });
}
