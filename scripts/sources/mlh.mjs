// MLH season page. The event list is JSON inside <script data-page="app"> (Inertia; verified 23 Nov 2026).
import { countryFromCode, getText, makeEvent } from "./util.mjs";

export async function fetchMlh() {
  const now = new Date();
  // MLH seasons run Aug to Jul and are named by the year they end in.
  const season = now.getUTCMonth() >= 6 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
  const html = await getText(`https://www.mlh.com/seasons/${season}/events`);
  const match = html.match(/<script data-page="app" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error("MLH page layout changed: no data-page script");
  const events = JSON.parse(match[1]).props?.upcomingEvents;
  if (!Array.isArray(events)) throw new Error("MLH page layout changed: no upcomingEvents");

  return events.map((e) => {
    const mode = e.formatType === "virtual" ? "online" : e.formatType === "hybrid" ? "hybrid" : "in-person";
    return makeEvent({
      title: e.name,
      url: e.websiteUrl || `https://www.mlh.com${e.url}`,
      source: "MLH",
      description: `MLH member event${e.location ? ` in ${e.location}` : ""}.`,
      deadline: e.startsAt,
      start: e.startsAt,
      end: e.endsAt,
      mode,
      city: mode === "online" ? null : e.venueAddress?.city,
      country: mode === "online" ? null : countryFromCode(e.venueAddress?.country),
      themes: e.customFields?.hackathon_focus || [],
      students: true, // MLH events are student hackathons
      global: mode === "online" ? true : null,
      image: e.logoUrl,
    });
  });
}
