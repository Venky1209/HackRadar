// Devpost public JSON API (verified 23 Nov 2026: 149 open/upcoming, 9 per page).
import { getJson, makeEvent, parseMoney, sleep } from "./util.mjs";

const MONTH = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

// "Oct 30 - Dec 04, 2026", "Nov 15 - 16, 2026", "Dec 28, 2026 - Jan 05, 2027"
export function parseDevpostRange(text) {
  const m = String(text || "").match(/^(\w{3}) (\d{1,2})(?:, (\d{4}))? - (?:(\w{3}) )?(\d{1,2}), (\d{4})$/);
  if (!m) return { start: null, end: null };
  const [, m1, d1, y1, m2, d2, y2] = m;
  const endYear = Number(y2);
  const endMonth = MONTH[m2 ?? m1];
  const startMonth = MONTH[m1];
  const startYear = y1 ? Number(y1) : startMonth > endMonth ? endYear - 1 : endYear;
  return {
    start: new Date(Date.UTC(startYear, startMonth, Number(d1), 12)),
    end: new Date(Date.UTC(endYear, endMonth, Number(d2), 23, 59)),
  };
}

export async function fetchDevpost() {
  const events = [];
  for (let page = 1; page <= 25; page += 1) {
    const data = await getJson(`https://devpost.com/api/hackathons?status[]=upcoming&status[]=open&page=${page}`);
    for (const h of data.hackathons) {
      if (h.invite_only) continue;
      const { start, end } = parseDevpostRange(h.submission_period_dates);
      const location = h.displayed_location?.location || "";
      const online = /online/i.test(location);
      const prize = parseMoney(h.prize_amount);
      const themes = (h.themes || []).map((t) => t.name);
      events.push(
        makeEvent({
          title: h.title,
          url: h.url,
          source: "Devpost",
          description: h.organization_name ? `Hosted by ${h.organization_name} on Devpost.` : "",
          deadline: end,
          start,
          end,
          mode: online ? "online" : "in-person",
          city: online ? null : location.split(",")[0],
          country: online ? null : location.split(",").pop().trim(),
          prize_amount: prize.amount,
          prize_currency: prize.currency,
          themes,
          students: null,
          global: online ? true : null,
          organiser: h.organization_name,
          image: h.thumbnail_url ? `https:${h.thumbnail_url.replace(/^https?:/, "")}` : null,
        }),
      );
    }
    if (data.hackathons.length < (data.meta?.per_page ?? 9)) break;
    await sleep(400);
  }
  return events;
}
