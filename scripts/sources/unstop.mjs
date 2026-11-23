// Unstop public search API (verified 23 Nov 2026: 177 open hackathons, paginated).
import { getJson, hiringEvidence, makeEvent, sleep } from "./util.mjs";

function parseEligibility(raw) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

export async function fetchUnstop() {
  const events = [];
  for (let page = 1; page <= 20; page += 1) {
    const data = await getJson(
      `https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&page=${page}&per_page=30&oppstatus=open`,
    );
    const rows = data.data?.data ?? [];
    for (const x of rows) {
      const reg = x.regnRequirements || {};
      const cash = (x.prizes || []).filter((p) => p.cash > 0);
      const currency = cash[0]?.currencyCode || null;
      const total = cash.filter((p) => (p.currencyCode || currency) === currency).reduce((sum, p) => sum + Number(p.cash || 0), 0);
      const ppo = (x.prizes || []).some((p) => p.pre_placement_opportunity || p.pre_placement_internship);
      const eligible = (x.filters || []).filter((f) => f.type === "eligible").map((f) => f.name);
      const themes = [
        ...(x.filters || []).filter((f) => f.type !== "eligible" && f.type !== "opportunity_type").map((f) => f.name),
        ...(x.required_skills || []).map((s) => s.skill_name || s.skill || s.name),
      ];
      const elig = parseEligibility(reg.eligibility);
      const online = x.region === "online";
      const address = x.address_with_country_logo;
      events.push(
        makeEvent({
          title: x.title,
          url: `https://unstop.com/${x.public_url}`,
          source: "Unstop",
          description: x.organisation?.name ? `By ${x.organisation.name} on Unstop.` : "",
          deadline: reg.end_regn_dt || x.end_date,
          start: reg.start_regn_dt,
          end: x.end_date,
          mode: online ? "online" : "in-person",
          city: online ? null : address?.city,
          country: online ? null : address?.country?.name,
          prize_amount: total || null,
          prize_currency: total ? currency : null,
          themes,
          hiring: ppo ? "pre-placement offer" : hiringEvidence(x.title, ...(x.prizes || []).map((p) => p.others)),
          students: eligible.some((e) => /student|undergrad|postgrad/i.test(e)) || (elig.sector || []).includes("students") || null,
          // Unstop is mostly India-only; "global" stays unknown unless the event is online with no location limit.
          global: online && (!elig.locations || elig.locations.length === 0) && elig.location_type === "all" ? true : null,
          organiser: x.organisation?.name,
          image: x.logoUrl2,
        }),
      );
    }
    if (!data.data?.next_page_url || rows.length === 0) break;
    await sleep(400);
  }
  return events;
}
