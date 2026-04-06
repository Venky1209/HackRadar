import { NextResponse } from "next/server";
import { getPublicHackathons } from "@/lib/data";

export async function GET() {
  const hackathons = await getPublicHackathons();
  return NextResponse.json({ hackathons });
}
