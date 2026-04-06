"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LockKeyhole, Radar, ShieldAlert, Sparkles } from "lucide-react";

export function AdminGate() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Invalid PIN.");
      }

      toast.success("Radar Control unlocked");
      router.refresh();
    } catch (error) {
      toast.error("Access denied", {
        description: error instanceof Error ? error.message : "Check the ADMIN_PIN value.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100svh] items-center justify-center px-4 py-10">
      <Card className="cyber-border w-full max-w-xl border-slate-800/85 bg-slate-950/68">
        <CardHeader className="space-y-3 border-b border-slate-800/85 pb-5">
          <Badge variant="muted" className="w-fit gap-2 border-slate-700/80 bg-slate-900/70 text-slate-200">
            <Sparkles className="h-3.5 w-3.5" />
            Hidden route
          </Badge>
          <CardTitle className="text-3xl">Radar Control</CardTitle>
          <CardDescription>Enter the admin PIN from .env.local to unlock the control surface.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <form className="space-y-4" onSubmit={submit}>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                type="password"
                placeholder="ADMIN_PIN"
                className="pl-11"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" variant="neon" className="w-full gap-2" disabled={loading}>
              <ShieldAlert className="h-4 w-4" />
              {loading ? "Unlocking..." : "Unlock control plane"}
            </Button>
          </form>

          <div className="rounded-2xl border border-slate-800/85 bg-slate-950/60 p-4 text-sm leading-7 text-slate-300">
            <div className="mb-2 inline-flex items-center gap-2 text-slate-200">
              <Radar className="h-4 w-4" />
              Control panel rules
            </div>
            <p>Use this route only for moderation, direct additions, and cleanup. It is intentionally not linked from the public UI.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
