// Luma discover search (verified 23 Nov 2026 on api.luma.com; api.lu.ma returns 404 now).
// Assumption: results lean towards the caller's location, so a GitHub runner sees mostly US events.
import { getJson, makeEvent } from "./util.mjs";

const HACK = /hack|buildathon|ideathon|build day|game jam/i;

export async function fetchLuma() {
  const events = [];
  for (const query of ["hackathon", "buildathon"]) {
    const data = await getJson(`https://api.luma.com/discover/get-paginated-events?pagination_limit=50&query=${query}`);
    for (const entry of data.entries || []) {
      const e = entry.event;
      if (!e || !HACK.test(e.name) || e.visibility !== "public") continue;
      const online = e.location_type === "online";
      events.push(
        makeEvent({
          title: e.name,
          url: `https://luma.com/${e.url}`,
          source: "Luma",
          description: "",
          deadline: e.start_at,
          start: e.start_at,
          end: e.end_at,
          mode: online ? "online" : "in-person",
          city: online ? null : e.geo_address_info?.city,
          country: online ? null : e.geo_address_info?.country,
          global: online ? true : null,
          organiser: entry.calendar?.name ?? null,
          image: e.cover_url,
        }),
      );
    }
  }
  return events;
}
