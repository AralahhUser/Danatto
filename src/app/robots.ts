import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://danatto.com").replace(/\/$/, "");
}
