"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Flag,
  Github,
  Globe,
  MapPin,
  Radar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportHackathonDialog } from "@/components/hackathon-dialogs";
import { formatCountdown, formatHackathonDateRange, formatLongDate } from "@/lib/date";
import type { HackathonRow } from "@/lib/types";

interface HackathonDetailProps {
  hackathon: HackathonRow;
}

export function HackathonDetail({ hackathon }: HackathonDetailProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to radar
      </Link>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_360px]">
        <Card className="relative overflow-hidden border-white/5 bg-[#1A1A1F]">
          <CardContent className="relative space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2 items-center text-xs font-medium tracking-wide uppercase">
              <span className="text-zinc-500">{hackathon.source}</span>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-500">{hackathon.ppo_possible ? "PPO / Internship" : "No PPO signal"}</span>
              <span className="text-zinc-700">•</span>
              {hackathon.status === "open" ? <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-sm">Open now</span> : <span className="text-zinc-500">{hackathon.status}</span>}
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{hackathon.title}</h1>
              <p className="max-w-4xl text-base leading-8 text-zinc-400 sm:text-lg">{hackathon.description}</p>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 mt-2">
              <div className="grid gap-6 sm:grid-cols-3">
                <Metric label="Countdown" value={formatCountdown(hackathon.end_date)} />
                <Metric label="Range" value={formatHackathonDateRange(hackathon.start_date, hackathon.end_date)} />
                <Metric label="Location" value={hackathon.location} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button asChild variant="default" className="gap-2 rounded-lg font-semibold bg-white text-black hover:bg-zinc-200">
                <a href={hackathon.registration_link} target="_blank" rel="noreferrer">
                  Register now
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="secondary" onClick={() => setReportOpen(true)} className="gap-2 rounded-lg">
                <Flag className="h-4 w-4" />
                Report Expired / Wrong Info
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-[#1A1A1F]">
          <CardHeader className="border-b border-white/5 pb-5">
            <CardTitle>Signal summary</CardTitle>
            <CardDescription className="text-zinc-500">Snapshot of the curated record.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5 divide-y divide-white/5">
            <SummaryRow icon={<CalendarDays className="h-4 w-4" />} label="Start" value={formatLongDate(hackathon.start_date)} />
            <SummaryRow icon={<CalendarDays className="h-4 w-4" />} label="End" value={formatLongDate(hackathon.end_date)} />
            <SummaryRow icon={<MapPin className="h-4 w-4" />} label="Mode" value={hackathon.mode} />
            <SummaryRow icon={<Radar className="h-4 w-4" />} label="Source" value={hackathon.source} />
            <SummaryRow icon={<Sparkles className="h-4 w-4" />} label="Prize pool" value={hackathon.prize_pool} />
            <div className="pt-4 mt-2">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Live pulse</p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                This page is refreshed from the same static feed, but the countdown ticks forward with your session.
              </p>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-300">{new Date(now).toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-white/5 bg-[#1A1A1F]">
          <CardHeader className="border-b border-white/5 pb-5">
            <CardTitle>Links</CardTitle>
            <CardDescription className="text-zinc-500">All live paths we could surface for the record.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <LinkTile label="Registration" href={hackathon.registration_link} />
            {hackathon.linkedin_post_link ? <LinkTile label="LinkedIn post" href={hackathon.linkedin_post_link} /> : null}
            {hackathon.github_link ? <LinkTile label="GitHub" href={hackathon.github_link} icon={<Github className="h-4 w-4" />} /> : null}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-[#1A1A1F]">
          <CardHeader className="border-b border-white/5 pb-5">
            <CardTitle>Why it made the radar</CardTitle>
            <CardDescription className="text-zinc-500">Reasons the event stayed in the curated feed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5 text-sm leading-7 text-zinc-400 divide-y divide-white/5">
            <p className="pt-2">
              <strong className="text-white font-medium pr-1">Organizer signal:</strong> {hackathon.source} is visible and structured enough to trust.
            </p>
            <p className="pt-3">
              <strong className="text-white font-medium pr-1">Student value:</strong> {hackathon.ppo_possible ? "PPO / internship signal was detected." : "Prize pool or challenge quality kept it high-value."}
            </p>
            <p className="pt-3">
              <strong className="text-white font-medium pr-1">Mode:</strong> {hackathon.mode.toUpperCase()} • {hackathon.location}
            </p>
            <p className="pt-3 pb-2">
              <strong className="text-white font-medium pr-1">Status:</strong> {hackathon.status.toUpperCase()} • {formatHackathonDateRange(hackathon.start_date, hackathon.end_date)}
            </p>
          </CardContent>
        </Card>
      </div>

      <ReportHackathonDialog open={reportOpen} onOpenChange={setReportOpen} hackathon={hackathon} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">{label}</p>
      <p className="text-base font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 pt-4 first:pt-2">
      <div className="mt-0.5 text-zinc-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">{label}</p>
        <p className="mt-1 truncate text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

function LinkTile({ label, href, icon }: { label: string; href: string; icon?: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-4 rounded-[0.8rem] border border-white/5 bg-white/5 px-4 py-3 text-sm text-zinc-100 transition duration-200 hover:border-white/15 hover:bg-white/10"
    >
      <span className="inline-flex items-center gap-2">
        {icon ?? <Globe className="h-4 w-4 text-zinc-400" />}
        {label}
      </span>
      <ExternalLink className="h-4 w-4 text-zinc-500" />
    </a>
  );
}
