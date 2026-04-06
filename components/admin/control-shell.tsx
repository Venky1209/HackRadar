"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  Switch,
  Textarea,
} from "@/components/ui";
import type { HackathonMode, HackathonRow, HackathonStatus, ReportRow, SubmissionRow } from "@/lib/types";
import { formatHackathonDateRange, formatLongDate } from "@/lib/date";
import {
  ArrowLeftRight,
  Check,
  Edit,
  LogOut,
  Plus,
  Radar,
  Trash2,
  TriangleAlert,
} from "lucide-react";

interface ControlShellProps {
  initialHackathons: HackathonRow[];
  initialReports: ReportRow[];
  initialSubmissions: SubmissionRow[];
}

interface EditorValues {
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
  status: HackathonStatus;
  source: string;
}

const emptyEditor: EditorValues = {
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  mode: "online",
  location: "India-wide",
  prize_pool: "",
  ppo_possible: false,
  registration_link: "",
  linkedin_post_link: "",
  github_link: "",
  status: "upcoming",
  source: "Radar Control",
};

export function ControlShell({ initialHackathons, initialReports, initialSubmissions }: ControlShellProps) {
  const [hackathons, setHackathons] = useState(initialHackathons);
  const [reports, setReports] = useState(initialReports);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTarget, setEditorTarget] = useState<HackathonRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  const openCount = useMemo(() => hackathons.filter((hackathon) => hackathon.status === "open").length, [hackathons]);
  const expiredCount = useMemo(() => hackathons.filter((hackathon) => hackathon.status === "expired").length, [hackathons]);
  const pendingCount = submissions.length;
  const unresolvedReports = useMemo(() => reports.filter((report) => !report.resolved).length, [reports]);

  const openEditor = (hackathon: HackathonRow | null) => {
    setEditorTarget(hackathon);
    setEditorOpen(true);
  };

  const saveEditor = async (values: EditorValues) => {
    const id = editorTarget?.id || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const payload = {
      id,
      ...values,
      approved: true,
      reported: false,
    };

    const response = await fetch(editorTarget ? `/api/admin/hackathons/${editorTarget.id}` : "/api/admin/hackathons", {
      method: editorTarget ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: editorTarget ? JSON.stringify({ payload }) : JSON.stringify(payload),
    });

    const body = (await response.json().catch(() => ({}))) as { message?: string };
    if (!response.ok) {
      throw new Error(body.message || "Unable to save hackathon.");
    }

    if (editorTarget) {
      setHackathons((current) => current.map((hackathon) => (hackathon.id === editorTarget.id ? { ...hackathon, ...payload } : hackathon)));
      toast.success("Hackathon updated");
    } else {
      setHackathons((current) => [{ ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...current]);
      toast.success("Hackathon created");
    }

    setEditorOpen(false);
    setEditorTarget(null);
  };

  const expireHackathon = async (hackathon: HackathonRow) => {
    setBusyId(hackathon.id);
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "expire" }),
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message || "Unable to expire hackathon.");
      }
      setHackathons((current) => current.map((item) => (item.id === hackathon.id ? { ...item, status: "expired" } : item)));
      toast.success("Marked expired");
    } catch (error) {
      toast.error("Could not expire", { description: error instanceof Error ? error.message : "Try again later." });
    } finally {
      setBusyId(null);
    }
  };

  const deleteHackathon = async (hackathon: HackathonRow) => {
    setBusyId(hackathon.id);
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathon.id}`, { method: "DELETE" });
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message || "Unable to delete hackathon.");
      }
      setHackathons((current) => current.filter((item) => item.id !== hackathon.id));
      toast.success("Hackathon deleted");
    } catch (error) {
      toast.error("Could not delete", { description: error instanceof Error ? error.message : "Try again later." });
    } finally {
      setBusyId(null);
    }
  };

  const approveQueuedSubmission = async (submission: SubmissionRow) => {
    setBusyId(submission.id);
    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message || "Unable to approve submission.");
      }

      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
      setHackathons((current) => [
        {
          ...(submission as HackathonRow),
          approved: true,
          reported: false,
        },
        ...current,
      ]);
      toast.success("Submission approved");
    } catch (error) {
      toast.error("Could not approve", { description: error instanceof Error ? error.message : "Try again later." });
    } finally {
      setBusyId(null);
    }
  };

  const rejectQueuedSubmission = async (submission: SubmissionRow) => {
    setBusyId(submission.id);
    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message || "Unable to reject submission.");
      }

      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
      toast.success("Submission rejected");
    } catch (error) {
      toast.error("Could not reject", { description: error instanceof Error ? error.message : "Try again later." });
    } finally {
      setBusyId(null);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  const resolveReportRow = async (reportId: string) => {
    setBusyId(reportId);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message || "Unable to resolve report.");
      }

      setReports((current) => current.map((report) => (report.id === reportId ? { ...report, resolved: true, resolved_at: new Date().toISOString() } : report)));
      toast.success("Report resolved");
    } catch (error) {
      toast.error("Could not resolve report", { description: error instanceof Error ? error.message : "Try again later." });
    } finally {
      setBusyId(null);
    }
  };

  const deleteReportRow = async (reportId: string) => {
    setBusyId(reportId);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message || "Unable to remove report.");
      }

      setReports((current) => current.filter((report) => report.id !== reportId));
      toast.success("Report removed");
    } catch (error) {
      toast.error("Could not remove report", { description: error instanceof Error ? error.message : "Try again later." });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="muted" className="mb-3 gap-2 border-slate-700/80 bg-slate-900/70 text-slate-200">
              <Radar className="h-3.5 w-3.5" />
              Radar Control
            </Badge>
            <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-50">Admin control plane</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              Add entries directly, approve community submissions, or mark stale rows as expired. This route stays hidden from the public UI.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => openEditor(null)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add hackathon
            </Button>
            <Button variant="ghost" onClick={logout} className="gap-2 border border-slate-800 bg-slate-950/70">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          <StatCard label="Hackathons" value={hackathons.length} />
          <StatCard label="Open" value={openCount} />
          <StatCard label="Expired" value={expiredCount} />
          <StatCard label="Pending reports" value={unresolvedReports} accent />
          <StatCard label="Pending submissions" value={pendingCount} />
        </section>

        <section>
          <Card className="cyber-border border-slate-800/85 bg-slate-950/68">
            <CardHeader className="border-b border-slate-800/85 pb-5">
              <CardTitle>User reports</CardTitle>
              <CardDescription>See exactly which event was reported, why it was flagged, and what still needs attention.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {reports.length ? (
                reports.map((report) => {
                  const matchingHackathon = hackathons.find((hackathon) => hackathon.id === report.hackathon_id || hackathon.title === report.hackathon_title) ?? null;

                  return (
                    <div key={report.id} className="rounded-2xl border border-slate-800/85 bg-slate-950/60 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={report.resolved ? "success" : "danger"}>{report.resolved ? "Resolved" : "Open report"}</Badge>
                            <Badge variant="muted">{formatLongDate(report.created_at ?? new Date().toISOString())}</Badge>
                            {matchingHackathon ? <Badge variant="outline">Has matching hackathon row</Badge> : <Badge variant="warning">Hackathon missing</Badge>}
                          </div>
                          <h3 className="text-lg font-semibold text-white">{report.hackathon_title}</h3>
                          <p className="max-w-4xl text-sm leading-6 text-slate-300">{report.reason}</p>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Report id {report.id}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" size="sm" onClick={() => matchingHackathon && openEditor(matchingHackathon)} disabled={!matchingHackathon} className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit event
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => matchingHackathon && expireHackathon(matchingHackathon)} disabled={!matchingHackathon || busyId === matchingHackathon?.id} className="gap-2">
                            <TriangleAlert className="h-4 w-4" />
                            Expire event
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => matchingHackathon && deleteHackathon(matchingHackathon)} disabled={!matchingHackathon || busyId === matchingHackathon?.id} className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete event
                          </Button>
                          {!report.resolved ? (
                            <Button variant="neon" size="sm" onClick={() => resolveReportRow(report.id)} className="gap-2">
                              <Check className="h-4 w-4" />
                              Resolve report
                            </Button>
                          ) : (
                            <Button variant="secondary" size="sm" onClick={() => deleteReportRow(report.id)} className="gap-2">
                              <ArrowLeftRight className="h-4 w-4" />
                              Remove report
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyQueue message="No user reports yet." />
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <Card className="cyber-border border-slate-800/85 bg-slate-950/68">
            <CardHeader className="border-b border-slate-800/85 pb-5">
              <CardTitle>Hackathons</CardTitle>
              <CardDescription>Edit, expire, or delete entries from the feed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {hackathons.map((hackathon) => (
                <div key={hackathon.id} className="rounded-2xl border border-slate-800/85 bg-slate-950/60 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="muted">{hackathon.source}</Badge>
                        <Badge variant={hackathon.status === "open" ? "success" : hackathon.status === "expired" ? "danger" : "outline"}>{hackathon.status}</Badge>
                        {hackathon.ppo_possible ? <Badge variant="success">PPO</Badge> : null}
                      </div>
                      <h3 className="text-lg font-semibold text-white">{hackathon.title}</h3>
                      <p className="max-w-3xl text-sm leading-6 text-slate-300">{hackathon.description}</p>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        {formatHackathonDateRange(hackathon.start_date, hackathon.end_date)} • {hackathon.location}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEditor(hackathon)} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => expireHackathon(hackathon)} disabled={busyId === hackathon.id} className="gap-2">
                        <TriangleAlert className="h-4 w-4" />
                        Expire
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteHackathon(hackathon)} disabled={busyId === hackathon.id} className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="cyber-border border-slate-800/85 bg-slate-950/68">
            <CardHeader className="border-b border-slate-800/85 pb-5">
              <CardTitle>Submissions</CardTitle>
              <CardDescription>Approve or reject new community entries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {submissions.length ? (
                submissions.map((submission) => (
                  <div key={submission.id} className="rounded-2xl border border-slate-800/85 bg-slate-950/60 p-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="muted">Queued</Badge>
                        <Badge variant={submission.ppo_possible ? "success" : "outline"}>{submission.ppo_possible ? "PPO" : "No PPO"}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-white">{submission.title}</h3>
                      <p className="text-sm leading-6 text-slate-300">{submission.description}</p>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{submission.location} • {formatLongDate(submission.start_date)}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="neon" size="sm" onClick={() => approveQueuedSubmission(submission)} disabled={busyId === submission.id} className="gap-2">
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => rejectQueuedSubmission(submission)} disabled={busyId === submission.id} className="gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyQueue />
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <HackathonEditorDialog open={editorOpen} onOpenChange={setEditorOpen} initialHackathon={editorTarget} onSave={saveEditor} />
    </div>
  );
}

function HackathonEditorDialog({
  open,
  onOpenChange,
  initialHackathon,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialHackathon: HackathonRow | null;
  onSave: (values: EditorValues) => Promise<void>;
}) {
  const [values, setValues] = useState<EditorValues>(emptyEditor);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialHackathon) {
      setValues({
        title: initialHackathon.title,
        description: initialHackathon.description,
        start_date: initialHackathon.start_date.slice(0, 10),
        end_date: initialHackathon.end_date.slice(0, 10),
        mode: initialHackathon.mode,
        location: initialHackathon.location,
        prize_pool: initialHackathon.prize_pool,
        ppo_possible: initialHackathon.ppo_possible,
        registration_link: initialHackathon.registration_link,
        linkedin_post_link: initialHackathon.linkedin_post_link || "",
        github_link: initialHackathon.github_link || "",
        status: initialHackathon.status,
        source: initialHackathon.source,
      });
    } else {
      setValues(emptyEditor);
    }
  }, [initialHackathon, open]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(values);
      onOpenChange(false);
      setValues(emptyEditor);
    } catch (error) {
      toast.error("Could not save", {
        description: error instanceof Error ? error.message : "Try again later.",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = <Key extends keyof EditorValues>(key: Key, value: EditorValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialHackathon ? "Edit hackathon" : "Add a hackathon"}</DialogTitle>
          <DialogDescription>Direct control writes to the public hackathons table with approved set to true.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <Input value={values.title} onChange={(event) => updateField("title", event.target.value)} required />
            </Field>
            <Field label="Source">
              <Input value={values.source} onChange={(event) => updateField("source", event.target.value)} required />
            </Field>
          </div>

          <Field label="Description">
            <Textarea value={values.description} onChange={(event) => updateField("description", event.target.value)} required />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Start date">
              <Input value={values.start_date} onChange={(event) => updateField("start_date", event.target.value)} type="date" required />
            </Field>
            <Field label="End date">
              <Input value={values.end_date} onChange={(event) => updateField("end_date", event.target.value)} type="date" required />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Mode">
              <Select value={values.mode} onChange={(event) => updateField("mode", event.target.value as HackathonMode)}>
                <option value="online">Online</option>
                <option value="in-person">In-person</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={values.status} onChange={(event) => updateField("status", event.target.value as HackathonStatus)}>
                <option value="upcoming">Upcoming</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="expired">Expired</option>
              </Select>
            </Field>
            <Field label="Location">
              <Input value={values.location} onChange={(event) => updateField("location", event.target.value)} required />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Prize pool">
              <Input value={values.prize_pool} onChange={(event) => updateField("prize_pool", event.target.value)} placeholder="₹1L+, $5,000, Not listed" />
            </Field>
            <Field label="Registration link">
              <Input value={values.registration_link} onChange={(event) => updateField("registration_link", event.target.value)} required />
            </Field>
            <Field label="LinkedIn link">
              <Input value={values.linkedin_post_link} onChange={(event) => updateField("linkedin_post_link", event.target.value)} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-medium text-white">PPO / internship</p>
              <p className="text-xs text-slate-400">Turn on if the row should rank as major.</p>
            </div>
            <Switch checked={values.ppo_possible} onCheckedChange={(checked) => updateField("ppo_possible", checked)} label="PPO possible" />
          </div>

          <Field label="GitHub link">
            <Input value={values.github_link} onChange={(event) => updateField("github_link", event.target.value)} />
          </Field>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="neon" disabled={saving}>
              {saving ? "Saving..." : initialHackathon ? "Save changes" : "Create hackathon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <Card className="cyber-border border-slate-800/85 bg-slate-950/68">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{label}</p>
        <p className={`mt-2 text-3xl font-black tracking-[-0.03em] ${accent ? "text-slate-50" : "text-slate-50"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function EmptyQueue({ message = "No submissions in the queue right now." }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-6 text-center text-sm text-slate-300">
      {message}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span className="font-medium text-slate-100">{label}</span>
      {children}
    </label>
  );
}
