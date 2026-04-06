"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

interface RadarOverlayProps {
  message: string;
  eventCount: number;
}

export function RadarOverlay({ message, eventCount }: RadarOverlayProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((v) => (v >= 100 ? 100 : v + Math.floor(Math.random() * 15) + 5));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111113] px-4 font-mono"
    >
      <div className="w-full max-w-sm space-y-6 text-zinc-400">
        <div className="flex items-center justify-between text-xs tracking-widest uppercase text-zinc-500">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <span>Scanning Signals</span>
          </div>
          <span>{progress >= 100 ? 100 : progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full bg-white"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </div>

        <div className="space-y-2 text-[11px] uppercase tracking-wider">
          <p className="text-zinc-300">[{new Date().toISOString().split("T")[1].slice(0, 8)}] {message}</p>
          {progress > 30 && <p className="text-zinc-500">→ Filter applied: PPO Signal detected</p>}
          {progress > 60 && <p className="text-zinc-500">→ Validating {eventCount} curated sources...</p>}
          {progress > 90 && <p className="text-emerald-500/80">→ Ready.</p>}
        </div>
      </div>
    </motion.div>
  );
}
