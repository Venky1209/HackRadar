import { HackRadarApp } from "@/components/hackathon-app";
import { getPublicHackathons } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const hackathons = await getPublicHackathons();
  return <HackRadarApp initialHackathons={hackathons} />;
}
