import {
  addDays,
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isAfter,
  isBefore,
  parse,
  parseISO,
  startOfDay,
} from "date-fns";

const MONTH_LOOKUP: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function toIsoMidday(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0)).toISOString();
}

export function parseDateRangeText(input: string) {
  const trimmed = input.trim();
  const clean = trimmed.replace(/^Deadline:\s*/i, "");
  const yearMatch = clean.match(/(\d{4})$/);
  const year = yearMatch ? Number(yearMatch[1]) : new Date().getUTCFullYear();
  const beforeYear = clean.replace(/,?\s*\d{4}$/, "").trim();

  if (!beforeYear.includes("-")) {
    const single = parseDateToken(beforeYear, year);
    return { start: toIsoMidday(single), end: toIsoMidday(single) };
  }

  const [rawStart, rawEnd] = beforeYear.split("-").map((value) => value.trim());
  const start = parseDateToken(rawStart, year);
  const end = parseDateToken(rawEnd, year, start.getUTCMonth());

  return { start: toIsoMidday(start), end: toIsoMidday(end) };
}

function parseDateToken(token: string, year: number, fallbackMonth?: number) {
  const monthMatch = token.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (monthMatch) {
    const month = MONTH_LOOKUP[monthMatch[1]] ?? fallbackMonth ?? 0;
    return new Date(Date.UTC(year, month, Number(monthMatch[2]), 12, 0, 0));
  }

  const dayOnlyMatch = token.match(/^(\d{1,2})$/);
  if (dayOnlyMatch) {
    return new Date(Date.UTC(year, fallbackMonth ?? 0, Number(dayOnlyMatch[1]), 12, 0, 0));
  }

  const parsed = parse(token, "MMM d", new Date(Date.UTC(year, fallbackMonth ?? 0, 1, 12, 0, 0)));
  if (!Number.isNaN(parsed.getTime())) {
    return new Date(Date.UTC(year, parsed.getUTCMonth(), parsed.getUTCDate(), 12, 0, 0));
  }

  return new Date(Date.UTC(year, fallbackMonth ?? 0, 1, 12, 0, 0));
}

export function formatHackathonDateRange(startDate: string, endDate: string) {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (start.getTime() === end.getTime()) {
    return format(start, "MMM d, yyyy");
  }

  if (start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth()) {
    return `${format(start, "MMM d")}–${format(end, "d, yyyy")}`;
  }

  if (start.getUTCFullYear() === end.getUTCFullYear()) {
    return `${format(start, "MMM d")}–${format(end, "MMM d, yyyy")}`;
  }

  return `${format(start, "MMM d, yyyy")}–${format(end, "MMM d, yyyy")}`;
}

export function formatCountdown(endDate: string) {
  const target = parseISO(endDate);
  const today = new Date();

  if (isBefore(target, today)) {
    return "Closed";
  }

  return `${formatDistanceToNowStrict(target, { addSuffix: false })} left`;
}

export function isClosingSoon(endDate: string) {
  const target = parseISO(endDate);
  const today = startOfDay(new Date());
  return differenceInCalendarDays(target, today) <= 7 && differenceInCalendarDays(target, today) >= 0;
}

export function isExpired(endDate: string) {
  return isBefore(parseISO(endDate), new Date());
}

export function isLiveNow(startDate: string, endDate: string) {
  const now = new Date();
  return !isBefore(now, parseISO(startDate)) && !isAfter(now, parseISO(endDate));
}

export function formatLongDate(date: string) {
  return format(parseISO(date), "EEE, MMM d, yyyy");
}

export function addDaysIso(base: string, days: number) {
  return toIsoMidday(addDays(parseISO(base), days));
}

export function derivePrizeScore(prizePool: string) {
  const text = prizePool.toLowerCase();
  if (!text || text.includes("not listed") || text.includes("none")) {
    return 0;
  }

  const normalized = text.replace(/[,]/g, "");
  const dollarMatch = normalized.match(/\$\s*([\d.]+)/);
  if (dollarMatch) {
    return Number(dollarMatch[1]) * 1;
  }

  const rupeeMatch = normalized.match(/₹\s*([\d.]+)\s*(k|l|lakh|lakhs)?/i);
  if (rupeeMatch) {
    const amount = Number(rupeeMatch[1]);
    const scale = rupeeMatch[2]?.toLowerCase();
    if (scale === "l" || scale === "lakh" || scale === "lakhs") {
      return amount * 100000;
    }
    if (scale === "k") {
      return amount * 1000;
    }
    return amount;
  }

  const numeric = normalized.match(/([\d.]+)/g);
  if (!numeric) {
    return normalized.includes("international") ? 1000000 : 50000;
  }

  const base = Number(numeric[0]);
  if (normalized.includes("l") || normalized.includes("lakh")) {
    return base * 100000;
  }
  if (normalized.includes("k")) {
    return base * 1000;
  }
  return base;
}
