"use client";

import { useDeferredValue, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Flag,
  Github,
  Heart,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SubmitHackathonDialog, ReportHackathonDialog } from "@/components/hackathon-dialogs";
import { filterHackathons } from "@/lib/filters";
import { derivePrizeScore, formatCountdown, formatHackathonDateRange, isClosingSoon } from "@/lib/date";
import type { HackathonFilters, HackathonMode, HackathonRow, LocationPreset } from "@/lib/types";
import { useHackathonStore } from "@/store/use-hackathon-store";

const repoUrl = "https://github.com/Venky1209/HackRadar";
const profileUrl = "https://github.com/Venky1209";

const modeOptions: Array<{ label: string; value: HackathonMode | "all" }> = [
  { label: "Any mode", value: "all" },
  { label: "Online", value: "online" },
  { label: "In-person", value: "in-person" },
  { label: "Hybrid", value: "hybrid" },
];

const prizeOptions: Array<{ label: string; value: HackathonFilters["prizeTier"] }> = [
  { label: "All prize pools", value: "all" },
  { label: "> ₹50k", value: "50k" },
  { label: "> ₹1L", value: "1lakh" },
  { label: "International $", value: "international" },
];

const statusOptions: Array<{ label: string; value: HackathonFilters["status"] }> = [
  { label: "All statuses", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Open", value: "open" },
  { label: "Closing soon", value: "closing-soon" },
];

const locationOptions: LocationPreset[] = [
  "all",
  "India-wide",
  "Chennai",
  "Bangalore",
  "Delhi",
  "Mumbai",
  "Hyderabad",
  "Noida",
  "Patiala",
  "Kolkata",
  "Singapore",
  "Remote International",
  "APAC",
  "Thailand",
];

const LOAD_MORE_STEP = 12;

function countActiveFilters(filters: HackathonFilters): number {
  let n = 0;
  if (filters.search) n++;
  if (filters.dateFrom) n++;
  if (filters.dateTo) n++;
  if (filters.mode !== "all") n++;
  if (filters.location !== "all") n++;
  if (filters.prizeTier !== "all") n++;
  if (filters.status !== "all") n++;
  if (filters.ppoOnly) n++;
  if (filters.majorOnly) n++;
  return n;
}

interface DashboardShellProps {
  hackathons: HackathonRow[];
  onRefreshScan: () => void;
  refreshAt: Date | null;
}

export function DashboardShell({ hackathons, onRefreshScan, refreshAt }: DashboardShellProps) {
  const filters = useHackathonStore((state) => state.filters);
  const setFilter = useHackathonStore((state) => state.setFilter);
  const resetFilters = useHackathonStore((state) => state.resetFilters);
  const setViewMode = useHackathonStore((state) => state.setViewMode);
  const setSortMode = useHackathonStore((state) => state.setSortMode);
  const deferredSearch = useDeferredValue(filters.search);
  const [now, setNow] = useState(Date.now());
  const [submitOpen, setSubmitOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<HackathonRow | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(LOAD_MORE_STEP);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Reset pagination whenever filters or search changes
  useEffect(() => {
    setDisplayLimit(LOAD_MORE_STEP);
  }, [filters, deferredSearch]);

  const filteredHackathons = filterHackathons(hackathons, {
    ...filters,
    search: deferredSearch,
  });

  const activeFilterCount = countActiveFilters(filters);
  const displayedHackathons = filteredHackathons.slice(0, displayLimit);
  const remaining = filteredHackathons.length - displayLimit;

  const visibleCount = filteredHackathons.length;
  const majorCount = hackathons.filter((hackathon) => hackathon.ppo_possible || derivePrizeScore(hackathon.prize_pool) > 0).length;
  const ppoCount = hackathons.filter((hackathon) => hackathon.ppo_possible).length;
  const indiaCount = hackathons.filter((hackathon) => /india|bharat/i.test(`${hackathon.location} ${hackathon.title} ${hackathon.description}`)).length;
  const remoteCount = hackathons.filter((hackathon) => hackathon.mode === "online" || /remote|virtual|online/i.test(`${hackathon.location} ${hackathon.description}`)).length;

  return (
    <div className="mx-auto max-w-7xl px-3 pb-24 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <header className="mb-6">
        <Card className="relative overflow-hidden border-white/5 bg-[#1A1A1F]">
          <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-white/10 hover:text-white"
            >
              <Github className="h-4 w-4" />
              HackRadar
            </a>
          </div>
          <CardContent className="relative p-4 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <Badge variant="muted" className="mb-3 gap-2 border-white/5 bg-white/5 px-3 py-2 text-zinc-200 sm:mb-4 sm:px-4">
                  <Sparkles className="h-3.5 w-3.5" />
                  HackRadar — curated feed
                </Badge>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">Curated opportunities, without the clutter.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
                  Filter by city, deadline, prize pool, and PPO potential.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  <StatChip label="Visible" value={visibleCount} />
                  <StatChip label="Major" value={majorCount} />
                  <StatChip label="PPO" value={ppoCount} />
                  <StatChip label="India-first" value={indiaCount} />
                  <StatChip label="Remote" value={remoteCount} />
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <div className="rounded-full border border-white/5 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-zinc-400 sm:text-xs">
                  {refreshAt ? `Last scan ${format(refreshAt, "hh:mm a")}` : "Fresh feed loaded"}
                </div>
                <Button variant="secondary" onClick={onRefreshScan} className="w-full gap-2 sm:w-auto">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Scan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </header>

      {/* ── Mobile filter sheet ─────────────────────────────── */}
      <AnimatePresence>
        {showMobileSheet && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowMobileSheet(false)}
            />
            <motion.div
              key="sheet"
              className="fixed inset-2 z-50 overflow-y-auto rounded-[1.75rem] border border-white/8 bg-[#111113]/98 p-2 shadow-2xl backdrop-blur-xl lg:hidden"
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0 }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
            >
              <FilterPanel
                compact
                filters={filters}
                onChange={setFilter}
                onReset={() => {
                  resetFilters();
                  toast.success("Filters cleared", { description: "Back to the full curated radar." });
                }}
                onSortChange={setSortMode}
                onClose={() => setShowMobileSheet(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main
        className={`grid gap-6 lg:items-start transition-[grid-template-columns] duration-300 ${
          showFilters ? "lg:grid-cols-[320px_minmax(0,1fr)]" : "lg:grid-cols-1"
        }`}
      >
        {/* ── Desktop sidebar ─────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.aside
              key="sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100svh-3rem)] lg:overflow-y-auto lg:pr-1 lg:block"
            >
              <FilterPanel
                filters={filters}
                onChange={setFilter}
                onReset={() => {
                  resetFilters();
                  toast("Filters cleared", { description: "Back to the full curated radar." });
                }}
                onSortChange={setSortMode}
                onClose={() => setShowFilters(false)}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* List / Grid toggle */}
              <div className="inline-flex items-center rounded-full border border-white/5 bg-[#1A1A1F] p-1 shadow-sm">
                <ToggleChip active={filters.viewMode === "list"} onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                  List
                </ToggleChip>
                <ToggleChip active={filters.viewMode === "grid"} onClick={() => setViewMode("grid")}>
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </ToggleChip>
              </div>

              {/* Desktop filter toggle */}
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={`hidden lg:inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  showFilters
                    ? "border-white/10 bg-white/5 text-white"
                    : "border-white/5 bg-[#1A1A1F] text-zinc-400 hover:border-white/10 hover:text-white"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Mobile filter trigger */}
              <button
                type="button"
                onClick={() => setShowMobileSheet(true)}
                className="lg:hidden inline-flex basis-full items-center justify-center gap-2 rounded-full border border-white/5 bg-[#1A1A1F] px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-white/10 hover:text-white sm:basis-auto"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSubmitOpen(true)} className="gap-2 text-zinc-300">
                <Plus className="h-4 w-4" />
                Submit a hackathon
              </Button>
              <div className="rounded-full border border-white/5 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-zinc-400 shadow-sm">
                {filteredHackathons.length} results in view
              </div>
            </div>
          </div>

          {filteredHackathons.length ? (
            <>
              {filters.viewMode === "grid" ? (
                <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                  {displayedHackathons.map((hackathon, index) => (
                    <HackathonCard key={hackathon.id} hackathon={hackathon} index={index} now={now} onReport={() => setReportTarget(hackathon)} />
                  ))}
                </div>
              ) : (
                <MonthListView hackathons={displayedHackathons} onReport={(hackathon) => setReportTarget(hackathon)} />
              )}

              {remaining > 0 && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setDisplayLimit((prev) => prev + LOAD_MORE_STEP)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-[#1A1A1F] px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/10 hover:text-white shadow-sm"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Load more
                    <span className="rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
                      {remaining} remaining
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState onReset={resetFilters} />
          )}
        </section>
      </main>

      <footer className="mt-8 border-t border-slate-800 pt-6 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/5 bg-white/[0.03] p-4 text-left normal-case tracking-normal text-slate-300 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-tight text-slate-50">Wanna contribute? Star the repo.</p>
              <p className="text-sm leading-6 text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-4 w-4 text-rose-400" />
                  Built with love by{' '}
                  <a href={profileUrl} target="_blank" rel="noreferrer" className="font-medium text-slate-200 underline decoration-slate-500/60 underline-offset-4 transition hover:text-white hover:decoration-slate-200">
                    Venky1209
                  </a>
                  .
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" size="sm" className="gap-2">
                <a href={repoUrl} target="_blank" rel="noreferrer">
                  <Star className="h-4 w-4 text-amber-400" />
                  Star on GitHub
                </a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="gap-2 border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                <a href={profileUrl} target="_blank" rel="noreferrer">
                  <Github className="h-4 w-4" />
                  Built by Venky1209
                </a>
              </Button>
            </div>
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Data refreshed April 2026</p>
        </div>
      </footer>

      <SubmitHackathonDialog open={submitOpen} onOpenChange={setSubmitOpen} />
      <ReportHackathonDialog open={Boolean(reportTarget)} onOpenChange={(open) => !open && setReportTarget(null)} hackathon={reportTarget} />

      <div className="fixed bottom-4 right-3 z-30 flex flex-col items-end gap-2 sm:bottom-8 sm:right-8 sm:gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex h-9 w-9 shrink-0 rounded-full border-zinc-700 bg-zinc-900/80 text-zinc-300 shadow-sm opacity-80 transition-all hover:bg-zinc-800 hover:opacity-100 sm:h-10 sm:w-10"
          title="Scroll to top"
        >
          <ChevronDown className="h-5 w-5 rotate-180" />
        </Button>
        <Button variant="default" size="lg" onClick={() => setSubmitOpen(true)} className="h-11 gap-2 px-4 shadow-sm sm:h-auto sm:px-6">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Submit a Hackathon</span>
        </Button>
      </div>
    </div>
  );
}

function FilterPanel({
  filters,
  onChange,
  onReset,
  onSortChange,
  onClose,
  compact = false,
}: {
  filters: HackathonFilters;
  onChange: <Key extends keyof HackathonFilters>(key: Key, value: HackathonFilters[Key]) => void;
  onReset: () => void;
  onSortChange: (mode: HackathonFilters["sortMode"]) => void;
  onClose?: () => void;
  compact?: boolean;
}) {
  return (
    <Card className="border-white/5 bg-[#1A1A1F] shadow-sm">
      <CardHeader className={`space-y-1 border-b border-white/5 ${compact ? "p-3 pb-2.5" : "p-4 pb-3"}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={compact ? "h-8 w-8 text-slate-400 hover:text-white" : "hidden h-8 w-8 text-slate-400 hover:text-white lg:flex"}
                title="Close Filters"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <CardTitle className="text-base text-slate-50">Filters</CardTitle>
              <CardDescription className="text-xs">Refine your radar</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 gap-1.5 px-2 text-xs border border-white/10 hover:bg-white/10 text-zinc-300">
            <X className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className={compact ? "space-y-2.5 p-3" : "space-y-3 p-3"}>
        <Field label="Search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <Input value={filters.search} onChange={(event) => onChange("search", event.target.value)} placeholder="Title, source..." className="h-8 pl-8 text-xs bg-white/5 border-white/10" />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="From">
            <Input value={filters.dateFrom} onChange={(event) => onChange("dateFrom", event.target.value)} type="date" className="h-8 text-[11px]" />
          </Field>
          <Field label="To">
            <Input value={filters.dateTo} onChange={(event) => onChange("dateTo", event.target.value)} type="date" className="h-8 text-[11px]" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Location">
            <Select value={filters.location} onChange={(event) => onChange("location", event.target.value as LocationPreset)} className="h-8 text-[11px] py-0">
              {locationOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </Select>
          </Field>

          <Field label="Sort format">
            <Select value={filters.sortMode} onChange={(event) => onSortChange(event.target.value as HackathonFilters["sortMode"])} className="h-8 text-[11px] py-0">
              <option value="deadline">Deadline</option>
              <option value="prize">Highest prize</option>
              <option value="newest">Newest added</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Format">
            <Select value={filters.mode} onChange={(evt) => onChange("mode", evt.target.value as HackathonFilters["mode"])} className="h-8 text-[11px] py-0">
              {modeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
          </Field>

          <Field label="Status">
            <Select value={filters.status} onChange={(evt) => onChange("status", evt.target.value as HackathonFilters["status"])} className="h-8 text-[11px] py-0">
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Prize Tiers">
          <Select value={filters.prizeTier} onChange={(evt) => onChange("prizeTier", evt.target.value as HackathonFilters["prizeTier"])} className="h-8 text-[11px] py-0">
            {prizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
        </Field>

        <div className="flex gap-2 pt-1">
          <label className="flex flex-1 items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2 shadow-sm cursor-pointer hover:bg-white/10 transition">
            <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wide">PPO</span>
            <Switch checked={filters.ppoOnly} onCheckedChange={(checked) => onChange("ppoOnly", checked)} className="scale-75 origin-right" />
          </label>
          <label className="flex flex-1 items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2 shadow-sm cursor-pointer hover:bg-white/10 transition">
            <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wide">Major</span>
            <Switch checked={filters.majorOnly} onCheckedChange={(checked) => onChange("majorOnly", checked)} className="scale-75 origin-right" />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

function HackathonCard({
  hackathon,
  index,
  now,
  onReport,
}: {
  hackathon: HackathonRow;
  index: number;
  now: number;
  onReport: () => void;
}) {
  const closingSoon = isClosingSoon(hackathon.end_date);
  const modeLabel = hackathon.mode.replace(/-/g, " ");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] }}
      className="relative group block h-full flex flex-col"
    >
      <div className="flex flex-col flex-1 relative z-10 overflow-hidden rounded-[1.6rem] border border-white/5 bg-[#1A1A1F] transition-colors duration-200 hover:border-white/15">
        <CardContent className="relative flex flex-col flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center text-xs font-medium tracking-wide uppercase">
                <span className="text-zinc-500">{hackathon.source}</span>
                <span className="text-zinc-700">•</span>
                {closingSoon ? (
                  <>
                    <span className="text-amber-500">Closing soon</span>
                    <span className="text-zinc-700">•</span>
                  </>
                ) : null}
                {hackathon.status === "open" ? <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-sm">Open now</span> : <span className="text-zinc-500">{hackathon.status}</span>}
              </div>
              <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">{hackathon.title}</h3>
            </div>

            <Button variant="ghost" size="icon" onClick={onReport} className="shrink-0 rounded-full text-zinc-500 hover:text-white">
              <Flag className="h-4 w-4" />
            </Button>
          </div>

          <p className="line-clamp-3 overflow-hidden text-sm leading-6 text-zinc-400">{hackathon.description}</p>

          <div className="pt-4 border-t border-zinc-800/60 mt-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-widest leading-none">
              <span>{hackathon.ppo_possible ? "PPO / Internship" : "No PPO Signal"}</span>
              <span className="text-zinc-700 font-bold px-1">•</span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatHackathonDateRange(hackathon.start_date, hackathon.end_date)}
              </span>
              <span className="text-zinc-700 font-bold px-1">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {hackathon.location}
              </span>
              <span className="text-zinc-700 font-bold px-1">•</span>
              <span>{modeLabel}</span>
            </div>
          </div>

          <div className="mt-auto pt-2 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="Countdown" value={formatCountdown(hackathon.end_date)} />
              <MetricCard label="Prize pool" value={hackathon.prize_pool} accent />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="default" className="flex-1 gap-2 sm:flex-none">
                <a href={hackathon.registration_link} target="_blank" rel="noreferrer">
                  Register
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="secondary" className="flex-1 gap-2 sm:flex-none">
                <Link href={`/hackathon/${hackathon.id}`}>
                  View details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Updated pulse {format(new Date(now), "hh:mm a")}</p>
          </div>
        </CardContent>
      </div>
    </motion.div>
  );
}

function MonthListView({
  hackathons,
  onReport,
}: {
  hackathons: HackathonRow[];
  onReport: (hackathon: HackathonRow) => void;
}) {
  const grouped = new Map<string, HackathonRow[]>();

  for (const hackathon of hackathons) {
    const monthKey = format(parseISO(hackathon.start_date), "MMMM yyyy");
    const current = grouped.get(monthKey) ?? [];
    current.push(hackathon);
    grouped.set(monthKey, current);
  }

  return (
    <div className="space-y-4">
      {[...grouped.entries()].map(([month, entries]) => (
        <Card key={month} className="border-white/5 bg-[#1A1A1F] shadow-sm">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle>{month}</CardTitle>
            <CardDescription>{entries.length} curated events in this month</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-white/5 p-4 sm:p-5">
            {entries.map((hackathon) => (
              <motion.div
                key={hackathon.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -20px 0px" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                <div className="relative z-10 grid gap-4 py-4 px-2 first:pt-4 last:pb-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center rounded-2xl transition hover:bg-zinc-800/40">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium tracking-wide text-zinc-500 uppercase">
                      <span className="text-zinc-500">{format(parseISO(hackathon.start_date), "MMM d")}</span>
                      <span className="text-zinc-700 font-bold px-1">•</span>
                      {hackathon.ppo_possible ? <span className="text-zinc-500">PPO</span> : <span className="text-zinc-500">No PPO</span>}
                      <span className="text-zinc-700 font-bold px-1">•</span>
                      {hackathon.status === "open" ? <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-sm">Open</span> : <span>{hackathon.status}</span>}
                    </div>
                    <h3 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">{hackathon.title}</h3>
                    <p className="truncate text-sm leading-6 text-zinc-400">{hackathon.description}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-widest text-zinc-500 leading-none pt-1">
                      <span>{formatHackathonDateRange(hackathon.start_date, hackathon.end_date)}</span>
                      <span className="text-zinc-700 font-bold px-1">•</span>
                      <span>{hackathon.location}</span>
                      <span className="text-zinc-700 font-bold px-1">•</span>
                      <span>{hackathon.prize_pool}</span>
                      <span className="text-zinc-700 font-bold px-1">•</span>
                      <span>{hackathon.mode.replace(/-/g, " ")}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onReport(hackathon)} className="gap-2">
                      <Flag className="h-4 w-4" />
                      Report
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/hackathon/${hackathon.id}`}>Open</Link>
                    </Button>
                    <Button asChild variant="default" size="sm">
                      <a href={hackathon.registration_link} target="_blank" rel="noreferrer">
                        Register
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Card className="border-white/5 bg-[#1A1A1F] shadow-sm">
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <div className="rounded-full border border-zinc-800 bg-zinc-900/50 p-4 text-zinc-300 shadow-sm">
          <Search className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-[-0.03em] text-zinc-50">No hackathons matched your filters</h3>
          <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-400">Widen the date range, loosen the prize or location filter, or clear the major-only toggle.</p>
        </div>
        <Button variant="default" onClick={onReset}>
          Reset filters
        </Button>
      </CardContent>
    </Card>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 sm:px-4 sm:py-2 sm:text-sm">
      <span className="font-semibold text-white">{value}</span>
      <span className="ml-2 uppercase tracking-[0.24em] text-[11px] text-zinc-500">{label}</span>
    </div>
  );
}

function MetricCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">{label}</p>
      <p className={`text-sm font-semibold tracking-tight sm:text-base ${accent ? "text-white" : "text-zinc-100"}`}>{value}</p>
    </div>
  );
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
        active ? "bg-white text-zinc-950 shadow-sm" : "bg-transparent text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-xs text-zinc-300">
      <span className="font-medium text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
