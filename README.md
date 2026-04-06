<div align="center">

<!-- Animated SVG Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0f11,50:1a1a2e,100:0f0f11&height=180&section=header&text=HackRadar&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=Curated%20hackathons.%20Zero%20noise.&descSize=20&descAlignY=60&descColor=94a3b8&animation=fadeIn" width="100%"/>

<!-- Live Badges -->
<p>
  <a href="https://hack-radar-omega.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-hack--radar-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"/>
  </a>
  <a href="https://github.com/Venky1209/HackRadar/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Venky1209/HackRadar?style=for-the-badge&color=22c55e&labelColor=0f0f11" alt="MIT License"/>
  </a>
  <a href="https://github.com/Venky1209/HackRadar/stargazers">
    <img src="https://img.shields.io/github/stars/Venky1209/HackRadar?style=for-the-badge&color=facc15&labelColor=0f0f11&logo=github" alt="Stars"/>
  </a>
  <a href="https://github.com/Venky1209/HackRadar/issues">
    <img src="https://img.shields.io/github/issues/Venky1209/HackRadar?style=for-the-badge&color=3b82f6&labelColor=0f0f11" alt="Issues"/>
  </a>
  <img src="https://img.shields.io/badge/PRs-Welcome-8b5cf6?style=for-the-badge&labelColor=0f0f11" alt="PRs Welcome"/>
</p>

<!-- Tech Stack Badges -->
<p>
  <img src="https://img.shields.io/badge/Next.js%2015-black?style=flat-square&logo=next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind%20CSS%20v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white"/>
  <img src="https://img.shields.io/badge/Framer%20Motion-EF0DB6?style=flat-square&logo=framer&logoColor=white"/>
  <img src="https://img.shields.io/badge/Zustand-433E38?style=flat-square"/>
</p>

<br/>

> **Hackathon discovery is noisy. HackRadar keeps the good parts.**  
> Real deadlines. Real prize pools. PPO signals. Built for students, by a student.

<br/>

<a href="https://hack-radar-omega.vercel.app/">
  <img src="https://img.shields.io/badge/%E2%86%92%20Open%20Live%20App-0f0f11?style=for-the-badge&logoColor=white" height="40"/>
</a>
&nbsp;
<a href="https://github.com/Venky1209/HackRadar/issues/new?template=bug_report.md">
  <img src="https://img.shields.io/badge/Report%20a%20Bug-ef4444?style=for-the-badge" height="40"/>
</a>
&nbsp;
<a href="https://github.com/Venky1209/HackRadar/issues/new?template=feature_request.md">
  <img src="https://img.shields.io/badge/Request%20a%20Feature-8b5cf6?style=for-the-badge" height="40"/>
</a>

</div>

---

## ⚡ What is HackRadar?

HackRadar is a **curated hackathon intelligence feed** built for Indian students and developers. Instead of scrolling through 10 platforms to find what matters, HackRadar aggregates, filters, and surfaces only the hackathons worth your time — with real data on deadlines, prizes, location, and PPO/internship potential.

```
60+ curated events  ·  PPO signal tracking  ·  Prize pool data  ·  India-first filters
```

No login. No noise. No algorithm. Just signal.

---

## 🖥️ Screenshots

<div align="center">
<table>
<tr>
<td width="50%">

**Dashboard — Grid View**

![Grid View](https://hack-radar-omega.vercel.app/og-image.png)

</td>
<td width="50%">

**Smart Filters**

Filter by city, prize, deadline, mode, and PPO potential — all without a page reload.

</td>
</tr>
</table>
</div>

> 💡 **[Try it live →](https://hack-radar-omega.vercel.app/)** — no signup required.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Curated Feed
No raw scrapes. Every entry is reviewed for signal quality — prize pool, organizer reputation, and student relevance.

### 🔍 Powerful Filters
Filter by **city**, **prize tier**, **status** (open / closing soon), **mode** (online / in-person / hybrid), and **PPO potential** simultaneously.

### 📍 India-First Location Presets
One-click presets for Chennai, Bangalore, Delhi, Mumbai, Hyderabad, Noida, Kolkata, Singapore, and Remote International.

</td>
<td width="50%">

### ⏱️ Real-Time Countdown
Live countdown on every card. Know exactly how long you have to register.

### 🏆 PPO Signal Tracking
Each hackathon is tagged with whether it has **PPO / internship potential** based on organizer history and description signals.

### 📱 Mobile-First
Bottom sheet filters on mobile. Collapsible sidebar on desktop. Smooth `framer-motion` transitions throughout.

</td>
</tr>
</table>

**Additional capabilities:**
- 🔒 Hidden PIN-protected `/radar-control` route for moderation
- 📤 Community submission and report flows
- 🌙 Consistent dark theme — no flash, no FOUC
- ⚡ Static-first architecture — fast on any connection
- 🗓️ List view grouped by month for timeline scanning
- 📄 Individual detail pages for every hackathon

---

## 🗂️ Project Structure

```
HackRadar/
├── app/                    # Next.js App Router — routes, layout, API handlers
│   ├── hackathon/[id]/     # Individual event detail pages
│   ├── radar-control/      # PIN-protected moderation UI
│   └── api/                # Submission, report, and refresh endpoints
├── components/
│   ├── ui/                 # shadcn/ui primitives (button, card, badge, input…)
│   ├── dashboard-shell.tsx # Main dashboard: filters, grid, load-more, sheet
│   ├── hackathon-dialogs.tsx
│   └── radar-landing.tsx   # Animated landing / scan experience
├── data/
│   └── seed-hackathons.json # Merged curated dataset (edit here to add events)
├── lib/
│   ├── filters.ts          # All client-side filter logic
│   ├── date.ts             # Countdown, date formatting, prize scoring
│   └── supabase.ts         # Server + client helpers
├── scripts/
│   ├── seed.ts             # Upserts dataset into Supabase
│   └── generate-seed.ts    # Merges source JSON files into the seed
├── store/
│   └── use-hackathon-store.ts  # Zustand store for filters + view mode
├── supabase/
│   └── schema.sql          # Full DB schema with RLS + triggers
└── .env.example            # Required environment variables
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/Venky1209/HackRadar.git
cd HackRadar
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PIN=your_chosen_pin
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Setup

Run the schema in your Supabase SQL editor:

```bash
# Copy contents of supabase/schema.sql into the Supabase SQL editor
# This creates: hackathons, submissions, reports tables + RLS + triggers
```

### 4. Seed the Database

```bash
npm run generate:seed   # Rebuild merged JSON from source files
npm run seed            # Upsert all events into Supabase
```

### 5. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

---

## ☁️ Deploy

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Venky1209/HackRadar)

1. Click the button above or import the repo at [vercel.com/new](https://vercel.com/new)
2. Add your environment variables in the Vercel dashboard
3. Set `NEXT_PUBLIC_SITE_URL` to your Vercel domain after first deploy
4. Redeploy — you're live

### Environment Variables (required)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side service role key |
| `ADMIN_PIN` | PIN to unlock `/radar-control` |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata (optional) |

---

## 🛠️ Scripts Reference

| Script | Description |
|---|---|
| `npm run dev` | Start dev server at `localhost:3000` |
| `npm run build` | Production build |
| `npm run seed` | Upsert curated dataset into Supabase |
| `npm run generate:seed` | Rebuild the merged `seed-hackathons.json` |

---

## 🤝 Contributing

Contributions are what make open source worth building. All skill levels welcome.

### Adding Hackathons (easiest)

1. Edit [`data/seed-hackathons.json`](./data/seed-hackathons.json)
2. Add your entry following the existing schema
3. Run `npm run generate:seed && npm run seed`
4. Open a PR with the updated seed file

**What we include:** Reputable organizers, clear prize pools, PPO/internship signals, India-relevant events.  
**What we skip:** No-prize weekend projects, events with <48h notice, unverifiable organizers.

### Code Contributions

```bash
# Fork → clone → branch
git checkout -b feat/your-feature-name

# Make changes, then
git commit -m "feat: describe your change"
git push origin feat/your-feature-name
# Open a PR
```

**Guidelines:**
- Keep the feed high-signal and student-focused
- Avoid adding live scraping to the public experience
- Prefer small, readable UI changes over large visual rewrites
- Test on both mobile (375px) and desktop (1440px)

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full guide.

---

## 🗃️ Database Schema

```sql
-- Core table (simplified)
CREATE TABLE hackathons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  source      text,                          -- DEVPOST | MLH | UNSTOP | …
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  location    text,
  mode        text,                          -- online | in-person | hybrid
  prize_pool  text,
  ppo_possible boolean DEFAULT false,
  status      text,                          -- upcoming | open | expired
  registration_link text,
  created_at  timestamptz DEFAULT now()
);
```

Full schema with RLS and triggers: [`supabase/schema.sql`](./supabase/schema.sql)

---

## 🔐 Security

Found a vulnerability? Please use [GitHub's private vulnerability reporting](https://github.com/Venky1209/HackRadar/security/advisories/new) instead of opening a public issue.

See [`SECURITY.md`](./SECURITY.md) for the full policy.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

You're free to fork, self-host, remix, and build on top of HackRadar. Attribution appreciated but not required.

---

<div align="center">

**Built for students, by a student.**

If HackRadar helped you find a hackathon worth entering,  
consider giving it a ⭐ — it helps more students discover it.

<br/>

<a href="https://github.com/Venky1209/HackRadar/stargazers">
  <img src="https://img.shields.io/github/stars/Venky1209/HackRadar?style=social" alt="Star on GitHub"/>
</a>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0f11,50:1a1a2e,100:0f0f11&height=100&section=footer" width="100%"/>

</div>
