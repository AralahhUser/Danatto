import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";

const staticRoutes = [
  "",
  "/shop",
  "/cart",
  "/checkout",
  "/about",
  "/contact",
  "/complaints",
  "/policies/shipping",
  "/policies/returns",
  "/policies/product-condition",
  "/policies/terms",
  "/policies/privacy"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const products = await getProducts();
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: now
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/product/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(product.createdAt)
    }))
  ];
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://danatto.com").replace(/\/$/, "");
}
