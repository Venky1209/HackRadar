import { NextResponse } from "next/server";
import { reportHackathon } from "@/lib/data";

export async function POST(request: Request) {
  const body = (await request.json()) as { id?: string; reason?: string };
  if (!body.id) {
    return NextResponse.json({ message: "Missing hackathon id." }, { status: 400 });
  }

  if (!body.reason || !body.reason.trim()) {
    return NextResponse.json({ message: "A report reason is required." }, { status: 400 });
  }

  const result = await reportHackathon(body.id, body.reason || "");
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({ message: result.message }, { status: 200 });
}
