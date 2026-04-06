import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import type { HackathonRow } from '@/lib/types';
import { hasSupabaseEnv } from '@/lib/supabase';

const root = path.resolve(process.cwd());
const seedPath = path.join(root, 'data', 'seed-hackathons.json');

loadEnvConfig(root);

function createServiceClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  return createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function shouldForcePpo(hackathon: HackathonRow) {
  return /ppo|internship/i.test(`${hackathon.title} ${hackathon.description} ${hackathon.source}`);
}

async function main() {
  const client = createServiceClient();
  if (!client) {
    throw new Error('Supabase environment is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running npm run seed.');
  }

  const raw = await readFile(seedPath, 'utf8');
  const hackathons = JSON.parse(raw) as HackathonRow[];
  const payload = hackathons.map((hackathon) => ({
    ...hackathon,
    ppo_possible: hackathon.ppo_possible || shouldForcePpo(hackathon),
    approved: true,
    reported: false,
  }));

  const { error } = await client.from('hackathons').upsert(payload, { onConflict: 'title,start_date' });
  if (error) {
    throw error;
  }

  process.stdout.write(`Seeded ${payload.length} hackathons into Supabase.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
