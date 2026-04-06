import { NextResponse } from "next/server";
import { hasAdminSessionCookie } from "@/lib/admin";
import { approveSubmission, rejectSubmission } from "@/lib/data";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!hasAdminSessionCookie(request.headers.get("cookie"))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { action?: string };

  const result = body.action === "approve" ? await approveSubmission(id) : await rejectSubmission(id);
  return result.ok ? NextResponse.json({ message: result.message }) : NextResponse.json({ message: result.message }, { status: 400 });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!hasAdminSessionCookie(_request.headers.get("cookie"))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const result = await rejectSubmission(id);
  return result.ok ? NextResponse.json({ message: result.message }) : NextResponse.json({ message: result.message }, { status: 400 });
}
