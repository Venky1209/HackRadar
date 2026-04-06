import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createHackathonDirect, getAllHackathons } from "@/lib/data";
import { hasAdminSessionCookie } from "@/lib/admin";
import type { HackathonRow } from "@/lib/types";

export async function GET(request: Request) {
  if (!hasAdminSessionCookie(request.headers.get("cookie"))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const hackathons = await getAllHackathons();
  return NextResponse.json({ hackathons });
}

export async function POST(request: Request) {
  if (!hasAdminSessionCookie(request.headers.get("cookie"))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<HackathonRow>;
  const payload: HackathonRow = {
    id: body.id || randomUUID(),
    title: body.title || "Untitled hackathon",
    description: body.description || "",
    start_date: body.start_date || new Date().toISOString(),
    end_date: body.end_date || new Date().toISOString(),
    mode: body.mode || "online",
    location: body.location || "India-wide",
    prize_pool: body.prize_pool || "Not listed",
    ppo_possible: Boolean(body.ppo_possible),
    registration_link: body.registration_link || "https://example.com",
    linkedin_post_link: body.linkedin_post_link ?? null,
    github_link: body.github_link ?? null,
    status: body.status || "upcoming",
    source: body.source || "Radar Control",
    approved: true,
    reported: false,
    created_at: body.created_at,
    updated_at: body.updated_at,
  };

  const result = await createHackathonDirect(payload);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({ message: result.message }, { status: 201 });
}
