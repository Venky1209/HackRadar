"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { HackathonMode, HackathonRow } from "@/lib/types";
import { Flag, Send, ShieldAlert } from "lucide-react";

interface SubmitHackathonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SubmitHackathonFormState {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  mode: HackathonMode;
  location: string;
  prize_pool: string;
  ppo_possible: boolean;
  registration_link: string;
  linkedin_post_link: string;
  github_link: string;
  source: string;
  submitter_email: string;
}

const emptySubmission: SubmitHackathonFormState = {
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  mode: "online",
  location: "",
  prize_pool: "",
  ppo_possible: false,
  registration_link: "",
  linkedin_post_link: "",
  github_link: "",
  source: "Community submission",
  submitter_email: "",
};

export function SubmitHackathonDialog({ open, onOpenChange }: SubmitHackathonDialogProps) {
  const [form, setForm] = useState<SubmitHackathonFormState>(emptySubmission);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(emptySubmission);
    }
  }, [open]);

  const updateField = <Key extends keyof SubmitHackathonFormState>(key: Key, value: SubmitHackathonFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Submission failed.");
      }

      toast.success("Submission received", {
        description: "We saved it to the queue for review.",
      });
      setForm(emptySubmission);
      onOpenChange(false);
    } catch (error) {
      toast.error("Could not save submission", {
        description: error instanceof Error ? error.message : "Try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <Badge variant="muted" className="mb-2 w-fit gap-2 border-slate-700/80 bg-slate-900/70 text-slate-200">
            <Send className="h-3.5 w-3.5" />
            Community submission
          </Badge>
          <DialogTitle>Submit a Hackathon</DialogTitle>
          <DialogDescription>
            Share a curated lead. The form writes into the submissions table and can be approved from radar control.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title" required>
              <Input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Hackathon title" required />
            </Field>
            <Field label="Source" required>
              <Input value={form.source} onChange={(event) => updateField("source", event.target.value)} placeholder="Devfolio, LinkedIn, Devpost..." required />
            </Field>
          </div>

          <Field label="Description" required>
            <Textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Why this hackathon matters" required />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Start date" required>
              <Input value={form.start_date} onChange={(event) => updateField("start_date", event.target.value)} type="date" required />
            </Field>
            <Field label="End date" required>
              <Input value={form.end_date} onChange={(event) => updateField("end_date", event.target.value)} type="date" required />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Mode">
              <Select value={form.mode} onChange={(event) => updateField("mode", event.target.value as HackathonMode)}>
                <option value="online">Online</option>
                <option value="in-person">In-person</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </Field>
            <Field label="Location" required>
              <Input value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="India-wide, Mumbai, Remote International" required />
            </Field>
            <Field label="Prize pool">
              <Input value={form.prize_pool} onChange={(event) => updateField("prize_pool", event.target.value)} placeholder="₹1L+, $5,000, Not listed" />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-medium text-slate-100">PPO or internship potential</p>
              <p className="text-xs text-slate-400">Turn this on if the event mentions internships, PPOs, or hiring outcomes.</p>
            </div>
            <Switch checked={form.ppo_possible} onCheckedChange={(checked) => updateField("ppo_possible", checked)} label="PPO possible" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Registration link" required>
              <Input value={form.registration_link} onChange={(event) => updateField("registration_link", event.target.value)} placeholder="https://..." required />
            </Field>
            <Field label="LinkedIn post link">
              <Input value={form.linkedin_post_link} onChange={(event) => updateField("linkedin_post_link", event.target.value)} placeholder="https://linkedin.com/..." />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="GitHub link">
              <Input value={form.github_link} onChange={(event) => updateField("github_link", event.target.value)} placeholder="https://github.com/..." />
            </Field>
            <Field label="Submitter email">
              <Input value={form.submitter_email} onChange={(event) => updateField("submitter_email", event.target.value)} type="email" placeholder="you@example.com" />
            </Field>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="neon" disabled={isSubmitting}>
              <Send className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ReportHackathonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathon: HackathonRow | null;
}

export function ReportHackathonDialog({ open, onOpenChange, hackathon }: ReportHackathonDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hackathon) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: hackathon.id, reason }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Report failed.");
      }

      toast.success("Report received", {
        description: payload.message || "We flagged it for review.",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Could not submit report", {
        description: error instanceof Error ? error.message : "Try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <Badge variant="muted" className="mb-2 w-fit gap-2 border-slate-700/80 bg-slate-900/70 text-slate-200">
            <Flag className="h-3.5 w-3.5" />
            Report issue
          </Badge>
          <DialogTitle>Report expired or wrong information</DialogTitle>
          <DialogDescription>
            Flag outdated links, incorrect dates, or a scammy listing. This sets the report flag in the database.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-slate-800/85 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Selected hackathon</p>
          <p className="mt-2 text-base font-semibold text-slate-50">{hackathon?.title ?? "None selected"}</p>
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          <Field label="Reason" required>
            <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Expired link, incorrect date, duplicate, scam, etc." required />
          </Field>

          <DialogFooter className="pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!hackathon || isSubmitting}>
              <ShieldAlert className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Send report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span className="font-medium text-slate-100">
        {label}
        {required ? <span className="ml-1 text-slate-400">*</span> : null}
      </span>
      {children}
    </label>
  );
}
