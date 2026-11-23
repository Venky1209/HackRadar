// Shared helpers for the per-source fetchers. No dependencies: plain Node 20+.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 HackRadar";

export async function getText(url, init = {}, timeoutMs = 25_000) {
  const response = await fetch(url, {
    ...init,
    headers: { "User-Agent": UA, Accept: "application/json, text/html", ...(init.headers || {}) },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${new URL(url).host}`);
  }
  return response.text();
}

export async function getJson(url, init, timeoutMs) {
  const text = await getText(url, init, timeoutMs);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Not JSON from ${new URL(url).host} (got ${text.slice(0, 40).replace(/\s+/g, " ")}...)`);
  }
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Rough USD rates, only used to rank prizes against each other. Assumption, not live rates.
const USD_PER = { USD: 1, INR: 0.012, EUR: 1.08, GBP: 1.27, CAD: 0.73, AUD: 0.66, SGD: 0.75, JPY: 0.0067, AED: 0.27 };

export function toUsd(amount, currency) {
  if (!amount || !currency || !(currency in USD_PER)) return null;
  return Math.round(amount * USD_PER[currency]);
}

const SYMBOLS = [
  ["₹", "INR"],
  ["Rs", "INR"],
  ["INR", "INR"],
  ["€", "EUR"],
  ["£", "GBP"],
  ["C$", "CAD"],
  ["A$", "AUD"],
  ["S$", "SGD"],
  ["$", "USD"],
  ["USD", "USD"],
];

// "$<span>100,000</span>" -> { amount: 100000, currency: "USD" }
export function parseMoney(raw) {
  if (!raw) return { amount: null, currency: null };
  const text = String(raw).replace(/<[^>]+>/g, "").trim();
  const number = text.match(/[\d][\d,.]*/);
  if (!number) return { amount: null, currency: null };
  let amount = Number(number[0].replace(/,/g, ""));
  if (/\b(k)\b/i.test(text.slice(number.index + number[0].length, number.index + number[0].length + 2))) amount *= 1000;
  if (/lakh|lac\b/i.test(text)) amount *= 100_000;
  const symbol = SYMBOLS.find(([s]) => text.includes(s));
  return { amount: amount || null, currency: symbol ? symbol[1] : null };
}

const CURRENCY_SIGN = { USD: "$", INR: "₹", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$", SGD: "S$" };

export function formatPrize(amount, currency) {
  if (!amount) return "Not listed";
  const sign = CURRENCY_SIGN[currency] ?? (currency ? `${currency} ` : "");
  return `${sign}${amount.toLocaleString(currency === "INR" ? "en-IN" : "en-US")}`;
}

const HIRING = /\b(ppo|pre[- ]placement|internships?|interviews?|hiring|job offers?|recruit\w*|placements?|full[- ]time (?:role|offer)s?)\b/i;

// Returns the matched phrase (shown to the user as the reason) or null.
export function hiringEvidence(...texts) {
  for (const text of texts) {
    const match = String(text || "").match(HIRING);
    if (match) return match[0].toLowerCase();
  }
  return null;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
export function countryFromCode(code) {
  if (!code) return null;
  try {
    return regionNames.of(String(code).toUpperCase()) ?? null;
  } catch {
    return null;
  }
}

export function iso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// An event in the shared shape every fetcher returns. Unknown values stay null, never guessed.
export function makeEvent(fields) {
  return {
    title: String(fields.title || "").trim(),
    url: fields.url,
    source: fields.source,
    description: fields.description ? String(fields.description).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400) : "",
    deadline: iso(fields.deadline),
    start: iso(fields.start),
    end: iso(fields.end),
    mode: fields.mode ?? null, // "online" | "in-person" | "hybrid"
    city: fields.city || null,
    country: fields.country || null,
    prize_amount: fields.prize_amount || null,
    prize_currency: fields.prize_currency || null,
    themes: [...new Set((fields.themes || []).map((t) => String(t).trim()).filter(Boolean))].slice(0, 8),
    hiring: fields.hiring || null, // matched phrase, e.g. "internship"
    students: fields.students ?? null, // true when the source says students may enter
    global: fields.global ?? null, // true when anyone from any country can enter
    organiser: fields.organiser || null,
    image: fields.image || null,
  };
}
