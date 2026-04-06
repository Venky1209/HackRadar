# HackRadar

HackRadar is a curated, student-first hackathon radar built with Next.js 15, TypeScript, Tailwind CSS v4, Supabase, Zustand, date-fns, Framer Motion, and lucide-react. The public experience is driven by curated static data, which keeps the app fast, predictable, and easy to deploy.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new) [Live demo](https://hackradar.vercel.app)

## Why It Exists

Hackathon discovery is noisy. HackRadar keeps the good parts: clear deadlines, prize context, PPO signal, and mobile-friendly scanning.

## Features

- Full-screen radar landing experience with a scan animation
- List-first dashboard with compact mobile filters and sticky desktop filters
- Curated hackathon feed with search, sort, location, prize, status, and PPO/major toggles
- Public detail pages for each event
- Community submission and report flows
- Hidden PIN-protected radar control route for moderation
- Supabase schema and seed pipeline ready for production deployment
- Natural page scrolling and compact card density for easier browsing

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase
- Zustand
- date-fns
- Framer Motion
- lucide-react

## Deploy on Vercel

1. Push the repository to GitHub.
2. Import the repo in Vercel.
3. Add the environment variables listed below.
4. Set `NEXT_PUBLIC_SITE_URL` to your Vercel domain after deploy.
5. Redeploy and share the live URL from the README.

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Create your environment file.

```bash
copy .env.example .env.local
```

3. Set up Supabase using [supabase/schema.sql](supabase/schema.sql).

4. Generate the merged seed dataset if you change the source JSON files.

```bash
npm run generate:seed
```

5. Seed the `hackathons` table.

```bash
npm run seed
```

6. Run the app.

```bash
npm run dev
```

## Environment Variables

- `SUPABASE_URL` - your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - server-side key used by the app and seed script
- `ADMIN_PIN` - PIN used to unlock `/radar-control`
- `NEXT_PUBLIC_SITE_URL` - optional canonical URL for metadata

## Database

Use [supabase/schema.sql](supabase/schema.sql) to create:

- `hackathons`
- `submissions`
- `reports`
- row-level security and updated-at triggers

The seed script reads [data/seed-hackathons.json](data/seed-hackathons.json) and upserts on `title + start_date`.

## Seeding

If you change the source JSON files, rebuild the merged dataset and reseed Supabase:

```bash
npm run generate:seed
npm run seed
```

## Contributing

Pull requests are welcome.

- Keep the feed high-signal and student-focused.
- Avoid adding live scraping to the public experience.
- Prefer small, readable UI changes over large visual rewrites.
- When adding events, prefer reputable organizers, strong prize pools, or clear PPO/internship potential.

If you are adding hackathons, the easiest path is:

1. Edit [data/seed-hackathons.json](data/seed-hackathons.json).
2. Run `npm run generate:seed`.
3. Run `npm run seed`.
4. Open a pull request with the updated seed file.

## Security

If you discover a vulnerability, use GitHub's private vulnerability reporting or a private security advisory instead of opening a public issue.

## Project Structure

- `app/` - routes, layout, API handlers, and the public pages
- `components/` - UI primitives and dashboard/admin feature components
- `data/` - merged curated seed data
- `lib/` - shared utilities, filters, Supabase helpers, and data access
- `scripts/` - seed and dataset generation scripts
- `supabase/` - SQL schema

## Scripts

- `npm run dev` - start the app locally
- `npm run build` - build for production
- `npm run seed` - upsert the curated dataset into Supabase
- `npm run generate:seed` - rebuild the merged curated JSON file

## License

MIT. See [LICENSE](LICENSE).
