const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const seedFile = path.join(root, 'seed-hackathons-apr-jun-2026.json');
const linkedInFile = path.join(root, 'linkdln_fetched_hackathons.json');
const outputFile = path.join(root, 'data', 'seed-hackathons.json');

const MONTHS = {
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

const snapshot = process.env.SEED_SNAPSHOT_ISO ? new Date(process.env.SEED_SNAPSHOT_ISO) : new Date();

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').trim());
}

function toMiddayIso(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0)).toISOString();
}

function stableUuid(input) {
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(12, 15)}`,
    `${(((parseInt(hash.slice(15, 17), 16) & 0x3) | 0x8).toString(16)).padStart(2, '0')}${hash.slice(17, 19)}`,
    hash.slice(20, 32),
  ].join('-');
}

function canonicalTitle(input) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function sanitizeText(input) {
  return String(input || '').replace(/â‚¹/g, '₹').replace(/â‚¬/g, '€').trim();
}

function extractFirstUrl(value) {
  if (!value) {
    return null;
  }
  const match = String(value).match(/https?:\/\/[^\s)<]+/i);
  return match ? match[0].replace(/\u003cbr\u003e/gi, '').trim() : null;
}

function parseDateToken(token, year, fallbackMonth) {
  const monthDay = token.trim().match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (monthDay) {
    const month = MONTHS[monthDay[1]] ?? fallbackMonth ?? 0;
    return new Date(Date.UTC(year, month, Number(monthDay[2]), 12, 0, 0));
  }

  const dayOnly = token.trim().match(/^(\d{1,2})$/);
  if (dayOnly) {
    return new Date(Date.UTC(year, fallbackMonth ?? 0, Number(dayOnly[1]), 12, 0, 0));
  }

  const fallback = new Date(Date.UTC(year, fallbackMonth ?? 0, 1, 12, 0, 0));
  return fallback;
}

function parseDateRangeText(input) {
  const clean = input.replace(/^Deadline:\s*/i, '').trim();
  const yearMatch = clean.match(/(\d{4})$/);
  const year = yearMatch ? Number(yearMatch[1]) : 2026;
  const withoutYear = clean.replace(/,?\s*\d{4}$/, '').trim();

  if (!withoutYear.includes('-')) {
    const single = parseDateToken(withoutYear, year);
    return { start: toMiddayIso(single), end: toMiddayIso(single), confidence: 'high' };
  }

  const [rawStart, rawEnd] = withoutYear.split('-').map((part) => part.trim());
  const start = parseDateToken(rawStart, year);
  const end = parseDateToken(rawEnd, year, start.getUTCMonth());
  return { start: toMiddayIso(start), end: toMiddayIso(end), confidence: 'high' };
}

function addDaysIso(base, days) {
  const date = new Date(base);
  date.setUTCDate(date.getUTCDate() + days);
  return toMiddayIso(date);
}

function scoreRecord(record, meta) {
  let score = 0;
  if (record.registration_link && record.registration_link !== 'not found') score += 4;
  if (record.linkedin_post_link) score += 2;
  if (record.prize_pool && !/not listed|n\/a/i.test(record.prize_pool)) score += 2;
  if (record.description) score += Math.min(3, Math.max(1, Math.floor(record.description.length / 60)));
  if (meta.dateConfidence === 'high') score += 3;
  if (meta.dateConfidence === 'medium') score += 1;
  return score;
}

function buildStatus(startDate, endDate, hintText, sourceStatus) {
  const now = snapshot;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const hint = (hintText || '').toLowerCase();

  if (end < now) {
    return 'expired';
  }

  if (hint.includes('open') || hint.includes('active') || hint.includes('live') || hint.includes('registration')) {
    return 'open';
  }

  if (sourceStatus && ['open', 'active', 'live', 'likely active'].includes(sourceStatus.toLowerCase())) {
    return 'open';
  }

  if (start > now) {
    return 'upcoming';
  }

  return 'open';
}

function inferMode(regionMode, title, notes) {
  const haystack = `${regionMode || ''} ${title || ''} ${notes || ''}`.toLowerCase();
  if (haystack.includes('in-person')) return 'in-person';
  if (haystack.includes('hybrid')) return 'hybrid';
  if (haystack.includes('virtual') || haystack.includes('online') || haystack.includes('remote')) return 'online';
  if (haystack.includes('apac') || haystack.includes('global')) return 'online';
  if (haystack.includes('india-wide')) return 'online';
  return regionMode && regionMode.includes(',') ? 'in-person' : 'online';
}

function shouldExcludeLinkedInEvent(event, notes) {
  const title = String(event || '');
  const combined = `${title} ${notes || ''}`.toLowerCase();
  if (combined.includes('retrospective') || combined.includes('excluded')) {
    return true;
  }
  if (/startup fest/i.test(title) && !/hack/i.test(title)) {
    return true;
  }
  return false;
}

function inferLinkedInDateWindow(event, notes, sourceStatus) {
  const combined = `${event || ''} ${notes || ''} ${sourceStatus || ''}`.toLowerCase();

  if (combined.includes('deadline tomorrow') || combined.includes('last day')) {
    return { start: toMiddayIso(snapshot), end: addDaysIso(toMiddayIso(snapshot), 1), confidence: 'medium' };
  }

  if (combined.includes('24h') || combined.includes('24-hour')) {
    return { start: toMiddayIso(snapshot), end: addDaysIso(toMiddayIso(snapshot), 1), confidence: 'medium' };
  }

  if (combined.includes('closing soon') || combined.includes('time running out')) {
    return { start: toMiddayIso(snapshot), end: addDaysIso(toMiddayIso(snapshot), 2), confidence: 'medium' };
  }

  if (combined.includes('registration open') || combined.includes('applications open') || combined.includes('open')) {
    return { start: toMiddayIso(snapshot), end: addDaysIso(toMiddayIso(snapshot), 14), confidence: 'medium' };
  }

  if (combined.includes('live')) {
    return { start: toMiddayIso(snapshot), end: addDaysIso(toMiddayIso(snapshot), 7), confidence: 'medium' };
  }

  return { start: toMiddayIso(snapshot), end: addDaysIso(toMiddayIso(snapshot), 10), confidence: 'low' };
}

function inferLinkedInLocation(regionMode) {
  const raw = sanitizeText(regionMode);
  const lower = raw.toLowerCase();

  if (!raw) {
    return 'LinkedIn scan';
  }

  if (raw.includes(',')) {
    return raw.split(',')[0].trim();
  }

  if (lower.includes('india')) {
    return 'India-wide';
  }

  if (lower.includes('global') || lower.includes('remote')) {
    return 'Remote International';
  }

  if (lower.includes('apac')) {
    return 'APAC';
  }

  if (lower.includes('thailand')) {
    return 'Thailand';
  }

  if (lower.includes('singapore')) {
    return 'Singapore';
  }

  return raw.replace(/\s*\/\s*(mode not stated|online|virtual|hybrid|verify)$/i, '').trim();
}

function normalizeSeedEntry(entry) {
  const dateRange = parseDateRangeText(entry.dates);
  const description = sanitizeText(entry.shortDescription || '');
  const ppoSignal = String(entry.ppoPpiPossible || '').toLowerCase();
  const ppoPossible = ppoSignal === 'yes' || /ppo|internship/i.test(`${entry.title} ${description}`);
  const record = {
    title: entry.title,
    description,
    start_date: dateRange.start,
    end_date: dateRange.end,
    mode: inferMode(entry.mode, entry.title, description),
    location: entry.location,
    prize_pool: entry.prizePool,
    ppo_possible: ppoPossible,
    registration_link: entry.registrationLink,
    linkedin_post_link: null,
    github_link: null,
    status: buildStatus(dateRange.start, dateRange.end, entry.dates, 'open'),
    source: entry.source,
    approved: true,
    reported: false,
    created_at: undefined,
    updated_at: undefined,
  };

  return { record, meta: { dateConfidence: 'high' } };
}

function normalizeLinkedInEntry(entry, sectionName) {
  const title = sanitizeText(entry.event);
  const description = sanitizeText(entry.notes || '');
  const dateWindow = inferLinkedInDateWindow(title, entry.notes, entry.status);
  const registrationLink = extractFirstUrl(entry.apply_link) || 'not found';
  const postLink = extractFirstUrl(entry.linkedin_evidence);
  const ppoPossible = /ppo|internship/i.test(`${title} ${description}`);
  const record = {
    title,
    description,
    start_date: dateWindow.start,
    end_date: dateWindow.end,
    mode: inferMode(entry.region_mode, title, description),
    location: inferLinkedInLocation(entry.region_mode),
    prize_pool: /prize pool/i.test(description) ? description : 'Not listed',
    ppo_possible: ppoPossible,
    registration_link: registrationLink,
    linkedin_post_link: postLink,
    github_link: null,
    status: buildStatus(dateWindow.start, dateWindow.end, `${entry.status} ${description}`, entry.status),
    source: `LinkedIn scan • ${sectionName}`,
    approved: true,
    reported: false,
    created_at: undefined,
    updated_at: undefined,
  };

  return { record, meta: { dateConfidence: dateWindow.confidence } };
}

function normalizeFallbackEntry(entry) {
  const dateRange = parseDateRangeText(entry.dates || 'Apr 5, 2026');
  const record = {
    title: entry.title,
    description: entry.description || '',
    start_date: dateRange.start,
    end_date: dateRange.end,
    mode: entry.mode,
    location: entry.location,
    prize_pool: entry.prize_pool || 'Not listed',
    ppo_possible: Boolean(entry.ppo_possible),
    registration_link: entry.registration_link,
    linkedin_post_link: entry.linkedin_post_link ?? null,
    github_link: entry.github_link ?? null,
    status: entry.status,
    source: entry.source || 'HackRadar',
    approved: true,
    reported: false,
    created_at: undefined,
    updated_at: undefined,
  };

  return { record, meta: { dateConfidence: 'high' } };
}

function mergeRecordMap(map, normalized) {
  const key = canonicalTitle(normalized.record.title);
  const existing = map.get(key);
  if (!existing) {
    map.set(key, normalized);
    return;
  }

  const existingScore = scoreRecord(existing.record, existing.meta);
  const nextScore = scoreRecord(normalized.record, normalized.meta);
  if (nextScore > existingScore) {
    map.set(key, normalized);
  }
}

function main() {
  const seedData = readJson(seedFile);
  const linkedInData = readJson(linkedInFile);
  const records = new Map();

  for (const entry of seedData) {
    mergeRecordMap(records, normalizeSeedEntry(entry));
  }

  const sections = linkedInData.sections || {};
  for (const entry of sections.india_major_city_first || []) {
    mergeRecordMap(records, normalizeLinkedInEntry(entry, 'india_major_city_first'));
  }

  for (const entry of sections.global_online_first_leads || []) {
    mergeRecordMap(records, normalizeLinkedInEntry(entry, 'global_online_first_leads'));
  }

  for (const entry of sections.expanded_link_bank?.india_online_additions || []) {
    if (shouldExcludeLinkedInEvent(entry.event, entry.notes)) {
      continue;
    }
    mergeRecordMap(records, normalizeLinkedInEntry(entry, 'expanded_link_bank • india_online_additions'));
  }

  for (const entry of sections.expanded_link_bank?.global_archive_additions || []) {
    const notes = String(entry.notes || '');
    if (/retrospective/i.test(notes) || /excluded/i.test(notes)) {
      continue;
    }
    if (shouldExcludeLinkedInEvent(entry.event, entry.notes)) {
      continue;
    }
    mergeRecordMap(records, normalizeLinkedInEntry(entry, 'expanded_link_bank • global_archive_additions'));
  }

  const output = [...records.values()]
    .map(({ record }) => ({
      id: stableUuid(`${canonicalTitle(record.title)}|${record.start_date}`),
      ...record,
    }))
    .sort((left, right) => new Date(left.start_date).getTime() - new Date(right.start_date).getTime());

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  process.stdout.write(`Wrote ${output.length} seed hackathons to ${path.relative(root, outputFile)}\n`);
}

main();
