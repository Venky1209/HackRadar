import type { Metadata } from "next";
import { isAdminCookiePresent } from "@/lib/admin";
import { getAllHackathons, getReports, getSubmissions } from "@/lib/data";
import { AdminGate } from "@/components/admin/admin-gate";
import { ControlShell } from "@/components/admin/control-shell";

export const metadata: Metadata = {
  title: "Radar Control | HackRadar",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function RadarControlPage() {
  if (!(await isAdminCookiePresent())) {
    return <AdminGate />;
  }

  const [hackathons, reports, submissions] = await Promise.all([getAllHackathons(), getReports(), getSubmissions()]);
  return <ControlShell initialHackathons={hackathons} initialReports={reports} initialSubmissions={submissions} />;
}
