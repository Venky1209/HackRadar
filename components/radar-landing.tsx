"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Github, Handshake, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const repoUrl = "https://github.com/Venky1209/HackRadar";
const profileUrl = "https://github.com/Venky1209";

interface RadarLandingProps {
  onScan: () => void;
}

export function RadarLanding({ onScan }: RadarLandingProps) {
  return (
    <div className="relative flex h-[100svh] items-center justify-center overflow-hidden px-3 py-4 sm:px-4 sm:py-6">
      <div className="absolute inset-0 opacity-20" />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="mx-auto w-full rounded-[1.5rem] border border-white/5 bg-[#1A1A1F] px-4 py-8 shadow-sm sm:rounded-[2rem] sm:px-10 sm:py-12 lg:px-16 lg:py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Badge variant="muted" className="mb-4 gap-2 border-white/10 bg-[#24242B] px-3 py-2 text-zinc-200 sm:mb-6 sm:px-4">
              <Image src="/icon.png" alt="" width={14} height={14} className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Curated hackathon radar
            </Badge>

            <div className="relative mb-6 sm:mb-8">
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="relative text-4xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl"
              >
                HackRadar
              </motion.h1>
            </div>

            <p className="max-w-2xl text-balance text-base leading-7 text-zinc-300 sm:text-xl sm:leading-8">
              Curated hackathons in one calm, easy-to-scan workspace.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:mt-4 sm:text-base sm:leading-7">
              Built for students and builders who want a cleaner shortlist: useful deadlines, meaningful signals, and fewer distractions.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center">
              <Button variant="default" size="lg" onClick={onScan} className="w-full px-8 text-base sm:w-auto">
                <span className="relative flex items-center gap-3">
                  Open radar
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </div>

            <div className="mt-6 flex w-full flex-col items-center gap-3 text-center sm:mt-8">
              <p className="text-sm text-zinc-500 sm:text-base">Wanna contribute?</p>
              <p className="text-sm text-zinc-500 sm:text-base">
                <span className="inline-flex items-center gap-1">
                  <Handshake className="h-4 w-4 text-emerald-400" />
                  Star and Explore the Repo!
                </span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild variant="secondary" size="sm" className="gap-2">
                  <a href={repoUrl} target="_blank" rel="noreferrer">
                    <Star className="h-4 w-4 text-amber-400" />
                    Star on GitHub
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm" className="gap-2 border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10">
                  <a href={profileUrl} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    Built by Venky1209
                  </a>
                </Button>
              </div>
              <p className="text-[11px] leading-5 text-zinc-500 sm:text-xs">
                <a href="https://icons8.com/icon/n4PmVb0fsj2t/radar" target="_blank" rel="noreferrer" className="underline decoration-zinc-500/60 underline-offset-4 transition hover:text-zinc-300 hover:decoration-zinc-300">
                  Radar
                </a>{" "}
                icon by{" "}
                <a href="https://icons8.com" target="_blank" rel="noreferrer" className="underline decoration-zinc-500/60 underline-offset-4 transition hover:text-zinc-300 hover:decoration-zinc-300">
                  Icons8
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
