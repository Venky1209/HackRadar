"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import type { HackathonRow } from "@/lib/types";
import { RadarLanding } from "@/components/radar-landing";
import { RadarOverlay } from "@/components/radar-overlay";
import { DashboardShell } from "@/components/dashboard-shell";
import { useHackathonStore } from "@/store/use-hackathon-store";

interface HackRadarAppProps {
  initialHackathons: HackathonRow[];
}

export function HackRadarApp({ initialHackathons }: HackRadarAppProps) {
  const { hasScanned, setHasScanned } = useHackathonStore();
  const [screen, setScreen] = useState<"landing" | "scanning" | "dashboard">(
    hasScanned ? "dashboard" : "landing"
  );
  const [scanStage, setScanStage] = useState(0);
  const [refreshAt, setRefreshAt] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanMessages = useMemo(
    () => [
      "Scanning LinkedIn... Devfolio... Unstop...",
      `${initialHackathons.length} events found... removing weak signals...`,
      "Filtering for prize, PPO, and organizer quality...",
      "Locking in the major ones for students...",
    ],
    [initialHackathons.length],
  );

  const beginScan = (isRefresh: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setScanStage(0);
    setScreen("scanning");

    intervalRef.current = setInterval(() => {
      setScanStage((current) => (current + 1) % scanMessages.length);
    }, 650);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setScreen("dashboard");
      setHasScanned(true);
      setRefreshAt(new Date());
      if (isRefresh) {
        toast("New events scanned", {
          description: "The dashboard stayed static for realism.",
          icon: <Sparkles className="h-4 w-4 text-amber-500" />,
          className: "border border-slate-800/85 bg-slate-950/95 text-slate-50 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.15)]",
        });
      } else {
        toast("Scan complete", {
          description: `${initialHackathons.length} events loaded into the dashboard.`,
          icon: <Sparkles className="h-4 w-4 text-amber-500" />,
          className: "border border-slate-800/85 bg-slate-950/95 text-slate-50 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.15)]",
        });
      }
    }, 3050);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlScrollbarGutter = html.style.scrollbarGutter;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    if (screen === "landing" || screen === "scanning") {
      html.style.overflow = "hidden";
      html.style.scrollbarGutter = "auto";
      body.style.overflow = "hidden";
      body.style.overscrollBehavior = "none";
    } else {
      html.style.overflow = "";
      html.style.scrollbarGutter = "stable";
      body.style.overflow = "";
      body.style.overscrollBehavior = "";
    }

    return () => {
      html.style.overflow = previousHtmlOverflow;
      html.style.scrollbarGutter = previousHtmlScrollbarGutter;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, [screen]);

  return (
    <div className={screen === "landing" || screen === "scanning" ? "relative min-h-[100svh] overflow-hidden" : "relative min-h-[100svh] overflow-x-hidden"}>
      <AnimatePresence mode="wait">
        {screen === "landing" ? <RadarLanding key="landing" onScan={() => beginScan(false)} /> : null}
      </AnimatePresence>

      {screen !== "landing" ? (
        <motion.div
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: screen === "scanning" ? "blur(1.5px)" : "blur(0px)" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={screen === "scanning" ? "pointer-events-none select-none" : ""}
        >
          <DashboardShell hackathons={initialHackathons} onRefreshScan={() => beginScan(true)} refreshAt={refreshAt} />
        </motion.div>
      ) : null}

      <AnimatePresence>
        {screen === "scanning" ? <RadarOverlay key="overlay" message={scanMessages[scanStage]} eventCount={initialHackathons.length} /> : null}
      </AnimatePresence>
    </div>
  );
}
