create extension if not exists pgcrypto;

create table if not exists public.hackathons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  start_date timestamptz not null,
  end_date timestamptz not null,
  mode text not null check (mode in ('online', 'in-person', 'hybrid')),
  location text not null default '',
  prize_pool text not null default '',
  ppo_possible boolean not null default false,
  registration_link text not null,
  linkedin_post_link text,
  github_link text,
  status text not null check (status in ('upcoming', 'open', 'closed', 'expired')),
  source text not null default 'HackRadar',
  approved boolean not null default true,
  reported boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint hackathons_title_start_date_key unique (title, start_date)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  start_date timestamptz not null,
  end_date timestamptz not null,
  mode text not null check (mode in ('online', 'in-person', 'hybrid')),
  location text not null default '',
  prize_pool text not null default '',
  ppo_possible boolean not null default false,
  registration_link text not null,
  linkedin_post_link text,
  github_link text,
  status text not null check (status in ('upcoming', 'open', 'closed', 'expired')),
  source text not null default 'Community submission',
  approved boolean not null default false,
  reported boolean not null default false,
  submitter_email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid references public.hackathons(id) on delete set null,
  hackathon_title text not null,
  reason text not null default '',
  reporter_email text,
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists hackathons_public_feed_idx on public.hackathons (approved, reported, status, start_date);
create index if not exists submissions_queue_idx on public.submissions (approved, created_at desc);
create index if not exists reports_queue_idx on public.reports (resolved, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_hackathons_updated_at on public.hackathons;
create trigger set_hackathons_updated_at
before update on public.hackathons
for each row
execute function public.set_updated_at();

drop trigger if exists set_submissions_updated_at on public.submissions;
create trigger set_submissions_updated_at
before update on public.submissions
for each row
execute function public.set_updated_at();

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
before update on public.reports
for each row
execute function public.set_updated_at();

alter table public.hackathons enable row level security;
alter table public.submissions enable row level security;

drop policy if exists "Public can read approved hackathons" on public.hackathons;
create policy "Public can read approved hackathons" on public.hackathons
for select
using (approved = true);

drop policy if exists "Anyone can submit hackathons" on public.submissions;
create policy "Anyone can submit hackathons" on public.submissions
for insert
with check (true);

alter table public.reports enable row level security;
