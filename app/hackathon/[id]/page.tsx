import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHackathonById } from "@/lib/data";
import { HackathonDetail } from "@/components/hackathon-detail";

export const dynamic = "force-dynamic";

interface HackathonPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: HackathonPageProps): Promise<Metadata> {
  const { id } = await params;
  const hackathon = await getHackathonById(id);

  if (!hackathon) {
    return { title: "Hackathon not found | HackRadar" };
  }

  return {
    title: `${hackathon.title} | HackRadar`,
    description: hackathon.description,
  };
}

export default async function HackathonPage({ params }: HackathonPageProps) {
  const { id } = await params;
  const hackathon = await getHackathonById(id);

  if (!hackathon) {
    notFound();
  }

  return <HackathonDetail hackathon={hackathon} />;
}
