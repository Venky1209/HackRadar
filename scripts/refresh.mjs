// Daily refresh: run every source on its own, normalise, dedupe, keep last good data for
// sources that failed, write data/hackathons.json and data/refresh-report.json.
// Exit code 1 (with a short reason) when the result is too thin to trust.
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchDevfolio } from "./sources/devfolio.mjs";
import { fetchDevpost } from "./sources/devpost.mjs";
import { fetchLuma } from "./sources/luma.mjs";
import { fetchMlh } from "./sources/mlh.mjs";
import { fetchUnstop } from "./sources/unstop.mjs";
import { formatPrize, toUsd } from "./sources/util.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "data", "hackathons.json");
const REPORT = path.join(root, "data", "refresh-report.json");

// Order is also the merge priority: the first source's link wins when two sources list one event.
const SOURCES = [
  ["Devpost", fetchDevpost],
  ["MLH", fetchMlh],
  ["Devfolio", fetchDevfolio],
  ["Unstop", fetchUnstop],
  ["Luma", fetchLuma],
];
const MIN_SOURCES_OK = 3;
const MIN_EVENTS = 15;
const SOURCE_TIMEOUT_MS = 120_000;

const log = (line) => process.stdout.write(`${line}\n`);
const warn = (line) => process.stdout.write(`::warning::${line}\n`);

function withTimeout(promise, ms, name) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(`${name} timed out after ${ms / 1000}s`)), ms))]);
}

export function canonical(title) {
  return title
    .toLowerCase()
    .replace(/\b20\d\d\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uuid(input) {
  const h = createHash("sha256").update(input).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const DAY = 86_400_000;
function sameEvent(a, b) {
  if (canonical(a.title) !== canonical(b.title)) return false;
  if (!a.start || !b.start) return true;
  return Math.abs(new Date(a.start) - new Date(b.start)) <= 10 * DAY;
}

function merge(a, b) {
  const usdA = toUsd(a.prize_amount, a.prize_currency) ?? 0;
  const usdB = toUsd(b.prize_amount, b.prize_currency) ?? 0;
  const prize = usdB > usdA ? b : a;
  const pick = (k) => a[k] ?? b[k];
  return {
    ...a,
    description: a.description || b.description,
    deadline: pick("deadline"),
    start: pick("start"),
    end: pick("end"),
    mode: pick("mode"),
    city: pick("city"),
    country: pick("country"),
    prize_amount: prize.prize_amount,
    prize_currency: prize.prize_currency,
    themes: [...new Set([...a.themes, ...b.themes])].slice(0, 8),
    hiring: pick("hiring"),
    students: a.students || b.students || null,
    global: a.global || b.global || null,
    organiser: pick("organiser"),
    image: pick("image"),
    sources: [...new Set([...(a.sources || [a.source]), ...(b.sources || [b.source])])],
  };
}

export function dedupe(events) {
  const out = [];
  for (const event of events) {
    const index = out.findIndex((e) => sameEvent(e, event) || e.url === event.url);
    if (index === -1) out.push({ ...event, sources: event.sources || [event.source] });
    else out[index] = merge(out[index], event);
  }
  return out;
}

function status(event, now) {
  const closes = new Date(event.deadline || event.end || event.start || 0);
  if (closes < now) return "expired";
  if (event.start && new Date(event.start) <= now) return "open";
  return "upcoming";
}

function toRow(event, previous, now) {
  const start = event.start || event.deadline || event.end;
  const end = event.end || event.start || event.deadline;
  const id = uuid(`${canonical(event.title)}|${String(start).slice(0, 7)}`);
  const place = [event.city, event.country].filter(Boolean).join(", ");
  return {
    id,
    title: event.title,
    description: event.description || `${event.title} on ${event.source}.`,
    start_date: start,
    end_date: end,
    deadline: event.deadline,
    mode: event.mode || "online",
    location: event.mode === "online" ? "Online" : place || "Location not listed",
    city: event.city,
    country: event.country,
    prize_pool: formatPrize(event.prize_amount, event.prize_currency),
    prize_amount: event.prize_amount,
    prize_currency: event.prize_currency,
    prize_usd: toUsd(event.prize_amount, event.prize_currency),
    ppo_possible: Boolean(event.hiring),
    hiring_signal: event.hiring,
    themes: event.themes,
    students: event.students,
    global: event.global,
    organiser: event.organiser,
    image: event.image,
    registration_link: event.url,
    linkedin_post_link: null,
    github_link: null,
    status: status(event, now),
    source: event.source,
    sources: event.sources,
    approved: true,
    reported: false,
    created_at: previous.get(id)?.created_at ?? now.toISOString(),
    updated_at: now.toISOString(),
  };
}

async function main() {
  const now = new Date();
  const previousRows = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
  const previous = new Map(previousRows.map((r) => [r.id, r]));

  const report = { ranAt: now.toISOString(), sources: {}, total: 0, failures: [] };
  const all = [];

  const results = await Promise.allSettled(
    SOURCES.map(async ([name, fn]) => {
      const started = Date.now();
      const events = await withTimeout(fn(), SOURCE_TIMEOUT_MS, name);
      const valid = events.filter(
        (e) => e.title && e.url && (e.deadline || e.start || e.end) && !/\btest location\b/i.test(`${e.city} ${e.country}`),
      );
      if (valid.length === 0) throw new Error(`${name} returned 0 usable events`);
      return { name, events: valid, ms: Date.now() - started };
    }),
  );

  results.forEach((result, i) => {
    const name = SOURCES[i][0];
    if (result.status === "fulfilled") {
      report.sources[name] = { ok: true, count: result.value.events.length, ms: result.value.ms };
      log(`ok    ${name}: ${result.value.events.length} events in ${result.value.ms} ms`);
      all.push(...result.value.events);
    } else {
      const reason = result.reason?.message || String(result.reason);
      // Keep this source's last good rows (still open) so one broken API does not empty the site.
      const kept = previousRows.filter((r) => (r.sources || [r.source]).includes(name));
      report.sources[name] = { ok: false, error: reason, keptFromLastRun: kept.length };
      report.failures.push(`${name}: ${reason}`);
      warn(`${name} failed: ${reason} (kept ${kept.length} events from the last run)`);
      all.push(
        ...kept.map((r) => ({
          title: r.title,
          url: r.registration_link,
          source: name,
          sources: r.sources,
          description: r.description,
          deadline: r.deadline,
          start: r.start_date,
          end: r.end_date,
          mode: r.mode,
          city: r.city,
          country: r.country,
          prize_amount: r.prize_amount,
          prize_currency: r.prize_currency,
          themes: r.themes || [],
          hiring: r.hiring_signal,
          students: r.students,
          global: r.global,
          organiser: r.organiser,
          image: r.image,
        })),
      );
    }
  });

  const rows = dedupe(all)
    .map((e) => toRow(e, previous, now))
    .filter((r) => r.status !== "expired")
    .sort((a, b) => new Date(a.deadline || a.start_date) - new Date(b.deadline || b.start_date));

  // Two sources can produce the same id after merging into one event; keep the first.
  const unique = [...new Map(rows.map((r) => [r.id, r])).values()];
  report.total = unique.length;
  report.raw = all.length;

  const okCount = Object.values(report.sources).filter((s) => s.ok).length;
  let failure = null;
  if (okCount < MIN_SOURCES_OK) failure = `only ${okCount} of ${SOURCES.length} sources worked (${report.failures.join("; ")})`;
  else if (unique.length < MIN_EVENTS) failure = `only ${unique.length} open events after dedupe, expected at least ${MIN_EVENTS}`;

  if (!failure) writeFileSync(OUT, `${JSON.stringify(unique, null, 2)}\n`);
  writeFileSync(REPORT, `${JSON.stringify({ ...report, failed: failure }, null, 2)}\n`);

  const summary = [
    `### HackRadar refresh ${failure ? "FAILED" : "ok"}`,
    failure ? `**Reason:** ${failure}` : `${unique.length} open events (${all.length} before dedupe).`,
    "",
    "| Source | Result |",
    "|---|---|",
    ...SOURCES.map(([name]) => {
      const s = report.sources[name];
      return `| ${name} | ${s.ok ? `${s.count} events` : `failed: ${s.error}`} |`;
    }),
  ].join("\n");
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
  log(`\n${summary}`);

  if (failure) {
    process.stdout.write(`::error::Refresh failed: ${failure}\n`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    process.stdout.write(`::error::Refresh crashed: ${error.message}\n`);
    process.exit(1);
  });
}
