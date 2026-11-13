import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
  { url: `${SITE_URL}/kegiatan`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/panduan`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/kontak`, changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const kegiatan = await db.kegiatan.findMany({
      select: { id: true, tanggal: true },
      orderBy: { tanggal: "desc" },
    });

    return [
      ...STATIC_ROUTES,
      ...kegiatan.map((k) => ({
        url: `${SITE_URL}/kegiatan/${k.id}`,
        lastModified: k.tanggal,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return STATIC_ROUTES;
  }
}
