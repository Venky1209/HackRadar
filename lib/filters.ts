import { parseISO } from "date-fns";
import type { HackathonFilters, HackathonMode, HackathonRow } from "@/lib/types";
import { derivePrizeScore, isClosingSoon, isExpired, isLiveNow } from "@/lib/date";

const MODE_LABELS: Record<string, HackathonMode | "all"> = {
  online: "online",
  "in-person": "in-person",
  hybrid: "hybrid",
  all: "all",
};

export function normalizeSearch(input: string) {
  return input.trim().toLowerCase();
}

export function matchesLocationPreset(hackathon: HackathonRow, preset: HackathonFilters["location"]) {
  if (preset === "all") {
    return true;
  }

  const haystack = `${hackathon.location} ${hackathon.title} ${hackathon.description} ${hackathon.source}`.toLowerCase();

  switch (preset) {
    case "India-wide":
      return haystack.includes("india") || haystack.includes("bharat");
    case "Remote International":
      return haystack.includes("remote international") || (hackathon.mode === "online" && !haystack.includes("india-wide"));
    case "APAC":
      return haystack.includes("apac") || haystack.includes("asia");
    default:
      return haystack.includes(preset.toLowerCase());
  }
}

export function matchesMode(hackathon: HackathonRow, mode: HackathonFilters["mode"]) {
  if (mode === "all") {
    return true;
  }
  return MODE_LABELS[hackathon.mode] === mode;
}

export function matchesPrizeTier(hackathon: HackathonRow, tier: HackathonFilters["prizeTier"]) {
  if (tier === "all") {
    return true;
  }

  const score = derivePrizeScore(hackathon.prize_pool);
  if (tier === "50k") {
    return score >= 50000;
  }
  if (tier === "1lakh") {
    return score >= 100000;
  }
  return hackathon.prize_pool.includes("$") || hackathon.location.toLowerCase().includes("international");
}

export function matchesStatus(hackathon: HackathonRow, status: HackathonFilters["status"]) {
  if (status === "all") {
    return true;
  }

  if (status === "closing-soon") {
    return hackathon.status !== "expired" && isClosingSoon(hackathon.end_date);
  }

  return hackathon.status === status;
}

export function matchesMajorOnly(hackathon: HackathonRow) {
  return hackathon.ppo_possible || Boolean(hackathon.prize_pool && !/not listed|n\/a|none/i.test(hackathon.prize_pool));
}

export function sortHackathons(hackathons: HackathonRow[], sortMode: HackathonFilters["sortMode"]) {
  const items = [...hackathons];

  if (sortMode === "deadline") {
    return items.sort((left, right) => parseISO(left.end_date).getTime() - parseISO(right.end_date).getTime());
  }

  if (sortMode === "prize") {
    return items.sort((left, right) => derivePrizeScore(right.prize_pool) - derivePrizeScore(left.prize_pool));
  }

  return items.sort((left, right) => {
    const leftCreated = left.created_at ? parseISO(left.created_at).getTime() : 0;
    const rightCreated = right.created_at ? parseISO(right.created_at).getTime() : 0;
    return rightCreated - leftCreated;
  });
}

export function filterHackathons(hackathons: HackathonRow[], filters: HackathonFilters) {
  const search = normalizeSearch(filters.search);

  return sortHackathons(
    hackathons.filter((hackathon) => {
      if (search) {
        const haystack = `${hackathon.title} ${hackathon.description} ${hackathon.location} ${hackathon.prize_pool} ${hackathon.source}`.toLowerCase();
        if (!haystack.includes(search)) {
          return false;
        }
      }

      if (filters.dateFrom && parseISO(hackathon.start_date).getTime() < parseISO(filters.dateFrom).getTime()) {
        return false;
      }

      if (filters.dateTo && parseISO(hackathon.end_date).getTime() > parseISO(filters.dateTo).getTime()) {
        return false;
      }

      if (!matchesMode(hackathon, filters.mode)) {
        return false;
      }

      if (!matchesLocationPreset(hackathon, filters.location)) {
        return false;
      }

      if (filters.ppoOnly && !hackathon.ppo_possible) {
        return false;
      }

      if (filters.majorOnly && !matchesMajorOnly(hackathon)) {
        return false;
      }

      if (!matchesPrizeTier(hackathon, filters.prizeTier)) {
        return false;
      }

      if (!matchesStatus(hackathon, filters.status)) {
        return false;
      }

      if (filters.status !== "all" && filters.status !== "closing-soon" && hackathon.status === "expired") {
        return false;
      }

      return true;
    }),
    filters.sortMode,
  );
}

export function isHackathonVisible(hackathon: HackathonRow) {
  return !isExpired(hackathon.end_date) || isLiveNow(hackathon.start_date, hackathon.end_date);
}
