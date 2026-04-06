import { NextResponse } from "next/server";
import { submitHackathon } from "@/lib/data";
import type { PublicHackathonForm } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as PublicHackathonForm;
  const result = await submitHackathon(payload);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({ message: result.message }, { status: 201 });
}
