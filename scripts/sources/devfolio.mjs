// Devfolio search API (verified 23 Nov 2026: "application_open" and "upcoming" types; "open" is rejected).
import { getJson, hiringEvidence, makeEvent, parseMoney, sleep } from "./util.mjs";

// Devfolio's list has prize names but no amounts. Take the biggest amount the description
// mentions near a prize word, and ignore anything under 1,000 (it is usually noise like "₹2").
function prizeFromDescription(desc) {
  const text = String(desc || "").replace(/<[^>]+>/g, " ");
  let best = { amount: null, currency: null };
  for (const m of text.matchAll(/(?:₹|INR|Rs\.?|\$|USD)\s?[\d][\d,]*(?:\s?(?:lakh|lac|k)\b)?/gi)) {
    const near = text.slice(Math.max(0, m.index - 80), m.index + m[0].length + 40);
    if (!/prize|pool|worth|cash|reward|bount/i.test(near)) continue;
    const money = parseMoney(m[0]);
    if (money.amount >= 1000 && money.amount > (best.amount ?? 0)) best = money;
  }
  return best;
}

async function searchType(type) {
  const out = [];
  for (let from = 0; from < 500; from += 50) {
    const data = await getJson("https://api.devfolio.co/api/search/hackathons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, from, size: 50 }),
    });
    const hits = data.hits?.hits ?? [];
    out.push(...hits.map((h) => h._source));
    if (hits.length < 50) break;
    await sleep(400);
  }
  return out;
}

export async function fetchDevfolio() {
  const rows = [...(await searchType("application_open")), ...(await searchType("upcoming"))];
  const seen = new Set();
  const events = [];
  for (const h of rows) {
    if (!h?.slug || seen.has(h.slug) || h.private) continue;
    seen.add(h.slug);
    const settings = h.hackathon_setting || {};
    const prize = prizeFromDescription(h.desc);
    events.push(
      makeEvent({
        title: h.name,
        url: settings.external_apply_url || `https://${settings.subdomain || h.slug}.devfolio.co`,
        source: "Devfolio",
        description: h.tagline || h.desc,
        deadline: settings.reg_ends_at || h.starts_at,
        start: h.starts_at,
        end: h.ends_at,
        mode: h.is_online ? "online" : "in-person",
        city: h.is_online ? null : h.city,
        country: h.is_online ? null : h.country,
        prize_amount: prize.amount,
        prize_currency: prize.currency,
        themes: (h.themes || []).map((t) => t.name),
        hiring: hiringEvidence(h.tagline, h.desc, ...(h.prizes || []).map((p) => `${p.name} ${p.desc}`)),
        students: null,
        global: null,
        organiser: h.hosted_by?.name ?? null,
        image: settings.logo,
      }),
    );
  }
  return events;
}
