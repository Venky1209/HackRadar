import { cache } from "react";
import { endOfDay, isBefore, parseISO, startOfDay } from "date-fns";
import seedHackathons from "@/data/seed-hackathons.json";
import { hasSupabaseEnv, createSupabaseServiceClient } from "@/lib/supabase";
import { toIsoMidday } from "@/lib/date";
import type { HackathonRow, PublicHackathonForm, ReportRow, SubmissionRow } from "@/lib/types";

const staticHackathons = (seedHackathons as HackathonRow[]).map((hackathon, index, all) => {
  const baseTime = Date.UTC(2026, 3, 5, 12, 0, 0);
  const offset = (all.length - index) * 60_000;

  return {
    ...hackathon,
    created_at: hackathon.created_at ?? new Date(baseTime - offset).toISOString(),
    updated_at: hackathon.updated_at ?? new Date(baseTime - offset).toISOString(),
  };
});

function isPublicRow(hackathon: HackathonRow) {
  return hackathon.approved && (hackathon.status === "upcoming" || hackathon.status === "open");
}

function sortByDate(left: HackathonRow, right: HackathonRow) {
  return new Date(left.start_date).getTime() - new Date(right.start_date).getTime();
}

function deriveStatusFromDates(startDate: string, endDate: string) {
  const now = startOfDay(new Date());
  const start = startOfDay(parseISO(startDate));
  const end = endOfDay(parseISO(endDate));

  if (isBefore(end, now)) {
    return "expired" as const;
  }

  if (!isBefore(now, start) && !isBefore(end, now)) {
    return "open" as const;
  }

  return "upcoming" as const;
}

function hasPpoSignal(text: string) {
  return /ppo|internship/i.test(text);
}

function normalizeStoredDate(value: string) {
  return toIsoMidday(parseISO(value));
}

async function fetchHackathonsFromDb(publicOnly: boolean) {
  const client = createSupabaseServiceClient();
  if (!client) {
    return null;
  }

  const query = client.from("hackathons").select("*").order("start_date", { ascending: true });
  const { data, error } = publicOnly
    ? await query.eq("approved", true).in("status", ["upcoming", "open"])
    : await query;

  if (error) {
    return null;
  }

  return (data ?? []) as HackathonRow[];
}

export const getPublicHackathons = cache(async () => {
  const rows = await fetchHackathonsFromDb(true);
  if (rows) {
    return rows;
  }

  return staticHackathons.filter(isPublicRow).sort(sortByDate);
});

export const getAllHackathons = cache(async () => {
  const rows = await fetchHackathonsFromDb(false);
  if (rows) {
    return rows;
  }

  return [...staticHackathons].sort(sortByDate);
});

export const getHackathonById = cache(async (id: string) => {
  const rows = await getAllHackathons();
  return rows.find((hackathon) => hackathon.id === id) ?? null;
});

export const getSubmissions = cache(async () => {
  const client = createSupabaseServiceClient();
  if (!client) {
    return [] as SubmissionRow[];
  }

  const { data, error } = await client.from("submissions").select("*").order("created_at", { ascending: false });
  if (error) {
    return [] as SubmissionRow[];
  }

  return (data ?? []) as SubmissionRow[];
});

export const getReports = cache(async () => {
  const client = createSupabaseServiceClient();
  if (!client) {
    return [] as ReportRow[];
  }

  const { data, error } = await client.from("reports").select("*").order("created_at", { ascending: false });
  if (error) {
    return [] as ReportRow[];
  }

  return (data ?? []) as ReportRow[];
});

function normalizeSubmissionInput(payload: PublicHackathonForm) {
  const signalText = `${payload.title} ${payload.description} ${payload.source}`;
  const startDate = normalizeStoredDate(payload.start_date);
  const endDate = normalizeStoredDate(payload.end_date);

  return {
    title: payload.title,
    description: payload.description,
    start_date: startDate,
    end_date: endDate,
    mode: payload.mode,
    location: payload.location,
    prize_pool: payload.prize_pool,
    ppo_possible: payload.ppo_possible || hasPpoSignal(signalText),
    registration_link: payload.registration_link,
    linkedin_post_link: payload.linkedin_post_link || null,
    github_link: payload.github_link || null,
    status: deriveStatusFromDates(startDate, endDate),
    source: payload.source,
    approved: false,
    reported: false,
    submitter_email: payload.submitter_email || null,
  } as const;
}

export async function submitHackathon(payload: PublicHackathonForm) {
  const client = createSupabaseServiceClient();
  if (!client) {
    return { ok: false, message: "Supabase is not configured yet." };
  }

  const normalized = normalizeSubmissionInput(payload);
  const { error } = await client.from("submissions").insert(normalized);
  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Submission received." };
}

export async function reportHackathon(id: string, reason: string) {
  const client = createSupabaseServiceClient();
  if (!client) {
    return { ok: false, message: "Supabase is not configured yet." };
  }

  const { data: hackathon, error: fetchError } = await client
    .from("hackathons")
    .select("id,title")
    .eq("id", id)
    .single();

  if (fetchError || !hackathon) {
    return { ok: false, message: fetchError?.message ?? "Hackathon not found." };
  }

  const { error: reportError } = await client.from("reports").insert({
    hackathon_id: hackathon.id,
    hackathon_title: hackathon.title,
    reason: reason.trim(),
    resolved: false,
  });

  if (reportError) {
    return { ok: false, message: reportError.message };
  }

  return { ok: true, message: reason.trim() ? "Thanks. We marked it for review." : "Marked for review." };
}

export async function createHackathonDirect(payload: HackathonRow) {
  const client = createSupabaseServiceClient();
  if (!client) {
    return { ok: false, message: "Supabase is not configured yet." };
  }

  const ppoPossible = payload.ppo_possible || hasPpoSignal(`${payload.title} ${payload.description} ${payload.source}`);
  const normalizedStartDate = normalizeStoredDate(payload.start_date);
  const normalizedEndDate = normalizeStoredDate(payload.end_date);

  const { error } = await client.from("hackathons").upsert(
    {
      ...payload,
      start_date: normalizedStartDate,
      end_date: normalizedEndDate,
      ppo_possible: ppoPossible,
      approved: true,
      reported: false,
    },
    { onConflict: "id" },
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Hackathon saved." };
}

export async function updateHackathon(id: string, payload: Partial<HackathonRow>) {
  const client = createSupabaseServiceClient();
  if (!client) {
    return { ok: false, message: "Supabase is not configured yet." };
  }

  const normalizedPayload = {
    ...payload,
    ...(payload.start_date ? { start_date: normalizeStoredDate(payload.start_date) } : {}),
    ...(payload.end_date ? { end_date: normalizeStoredDate(payload.end_date) } : {}),
  };

  const { error } = await client.from("hackathons").update(normalizedPayload).eq("id", id);
  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Hackathon updated." };
}

export async function deleteHackathon(id: string) {
  const client = createSupabaseServiceClient();
  if (!client) {
    return { ok: false, message: "Supabase is not configured yet." };
  }

  const { error } = await client.from("hackathons").delete().eq("id", id);
  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Hackathon deleted." };
}

export async function resolveReport(id: string) {
  const client = createSupabaseServiceClient();
  if (!client) {
    return { ok: false, message: "Supabase is not configured yet." };
  }

  const { error } = await client
    .from("reports")
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Report marked resolved." };
}

export async function deleteReport(id: string) {
  const client = createSupabaseServiceClient();
  if (!client) {
    return { ok: false, message: "Supabase is not configured yet." };
  }

  const { error } = await client.from("reports").delete().eq("id", id);
  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Report removed." };
}

export async function markHackathonExpired(id: string) {
  return updateHackathon(id, { status: "expired" });
}

export async function approveSubmission(id: string) {
  const client = createSupabaseServiceClient();
  if (!client) {
    return { ok: false, message: "Supabase is not configured yet." };
  }

  const { data: submission, error: fetchError } = await client.from("submissions").select("*").eq("id", id).single();
  if (fetchError || !submission) {
    return { ok: false, message: fetchError?.message ?? "Submission not found." };
  }

  const hackathonPayload = {
    id: submission.id,
    title: submission.title,
    description: submission.description,
    start_date: submission.start_date,
    end_date: submission.end_date,
    mode: submission.mode,
    location: submission.location,
    prize_pool: submission.prize_pool,
    ppo_possible: submission.ppo_possible,
    registration_link: submission.registration_link,
    linkedin_post_link: submission.linkedin_post_link,
    github_link: submission.github_link,
    status: submission.status,
    source: submission.source,
    approved: true,
    reported: false,
  };

  const { error: insertError } = await client.from("hackathons").upsert(hackathonPayload, {
    onConflict: "id",
  });
  if (insertError) {
    return { ok: false, message: insertError.message };
  }

  const { error: deleteError } = await client.from("submissions").delete().eq("id", id);
  if (deleteError) {
    return { ok: false, message: deleteError.message };
  }

  return { ok: true, message: "Submission approved." };
}

export async function rejectSubmission(id: string) {
  const client = createSupabaseServiceClient();
  if (!client) {
    return { ok: false, message: "Supabase is not configured yet." };
  }

  const { error } = await client.from("submissions").delete().eq("id", id);
  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Submission rejected." };
}

export function hasLiveDatabase() {
  return hasSupabaseEnv();
}
