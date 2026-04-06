import Link from "next/link";
import { ArrowLeft, Radar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[100svh] max-w-2xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="cyber-border relative w-full border-white/10 bg-white/[0.05]">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
            <Radar className="h-7 w-7" />
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Signal lost
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Page not found</h1>
            <p className="text-sm leading-7 text-slate-300">The radar couldn&apos;t lock onto that route. Head back to the main scan and continue browsing.</p>
          </div>
          <Button asChild variant="neon" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to radar
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
