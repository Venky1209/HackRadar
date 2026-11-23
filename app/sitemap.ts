import type { MetadataRoute } from "next";
import hackathonData from "@/data/hackathons.json";
import type { HackathonRow } from "@/lib/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hackradar.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const hackathons = hackathonData as unknown as HackathonRow[];

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...hackathons
      .filter((hackathon) => hackathon.status === "open" || hackathon.status === "upcoming")
      .map((hackathon) => ({
        url: `${baseUrl}/hackathon/${hackathon.id}`,
        lastModified: hackathon.updated_at ? new Date(hackathon.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];
}
