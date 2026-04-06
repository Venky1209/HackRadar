import { NextResponse } from "next/server";
import { getHackathonById } from "@/lib/data";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const hackathon = await getHackathonById(id);

  if (!hackathon) {
    return NextResponse.json({ message: "Hackathon not found." }, { status: 404 });
  }

  return NextResponse.json({ hackathon });
}
