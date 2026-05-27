import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";
import { releaseExpiredReservations } from "@/lib/orders";
import { sampleBrands, sampleCategories, sampleProducts } from "@/lib/sample-data";
import type { Brand, Category, StoreProduct } from "@/lib/types";

type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: { toNumber?: () => number } | number;
  salePrice?: { toNumber?: () => number } | number | null;
  brandId: string;
  categoryId: string;
  images: string[];
  size: string;
  color: string;
  gender: string;
  condition: string;
  measurements: unknown;
  observations?: string | null;
  stock: number;
  status: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isUniquePiece: boolean;
  createdAt: Date;
  updatedAt: Date;
  brand: Brand;
  category: Category;
};

export type CatalogFilters = {
  brand?: string;
  category?: string;
  size?: string;
  condition?: string;
  color?: string;
  gender?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  featured?: boolean;
  newArrival?: boolean;
};

function moneyToNumber(value: ProductWithRelations["price"]) {
  if (typeof value === "number") return value;
  return value?.toNumber?.() ?? Number(value);
}

function serializeProduct(product: ProductWithRelations): StoreProduct {
  return {
    ...product,
    price: moneyToNumber(product.price),
    salePrice: product.salePrice == null ? null : moneyToNumber(product.salePrice),
    gender: product.gender as StoreProduct["gender"],
    condition: product.condition as StoreProduct["condition"],
    status: product.status as StoreProduct["status"],
    measurements: (product.measurements ?? {}) as StoreProduct["measurements"],
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}

function filterSampleProducts(filters: CatalogFilters = {}) {
  const min = filters.minPrice ? Number(filters.minPrice) : undefined;
  const max = filters.maxPrice ? Number(filters.maxPrice) : undefined;
  let products = sampleProducts.filter((product) => {
    const price = product.salePrice ?? product.price;
    return (
      product.status === "disponible" &&
      (!filters.brand || product.brand.slug === filters.brand) &&
      (!filters.category || product.category.slug === filters.category) &&
      (!filters.size || product.size.toLowerCase() === filters.size.toLowerCase()) &&
      (!filters.condition || product.condition === filters.condition) &&
      (!filters.color || product.color.toLowerCase().includes(filters.color.toLowerCase())) &&
      (!filters.gender || product.gender === filters.gender) &&
      (!filters.featured || product.isFeatured) &&
      (!filters.newArrival || product.isNewArrival) &&
      (min === undefined || price >= min) &&
      (max === undefined || price <= max)
    );
  });

  if (filters.sort === "price-asc") products = products.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  if (filters.sort === "price-desc") products = products.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  if (filters.sort === "condition") {
    const order = ["nuevo_sin_etiqueta", "excelente", "muy_bueno", "bueno", "con_detalles"];
    products = products.sort((a, b) => order.indexOf(a.condition) - order.indexOf(b.condition));
  }

  return products;
}

function canUseSampleData() {
  return process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL;
}

export async function getProducts(filters: CatalogFilters = {}) {
  if (canUseSampleData()) return filterSampleProducts(filters);
  if (!process.env.DATABASE_URL) return [];

  try {
    await releaseExpiredReservations();

    const where: Record<string, unknown> = {
      status: "disponible"
    };
    if (filters.brand) where.brand = { slug: filters.brand };
    if (filters.category) where.category = { slug: filters.category };
    if (filters.size) where.size = { equals: filters.size, mode: "insensitive" };
    if (filters.condition) where.condition = filters.condition;
    if (filters.gender) where.gender = filters.gender;
    if (filters.color) where.color = { contains: filters.color, mode: "insensitive" };
    if (filters.featured) where.isFeatured = true;
    if (filters.newArrival) where.isNewArrival = true;
    if (filters.minPrice || filters.maxPrice) {
      where.OR = [
        {
          salePrice: {
            gte: filters.minPrice ? Number(filters.minPrice) : undefined,
            lte: filters.maxPrice ? Number(filters.maxPrice) : undefined
          }
        },
        {
          salePrice: null,
          price: {
            gte: filters.minPrice ? Number(filters.minPrice) : undefined,
            lte: filters.maxPrice ? Number(filters.maxPrice) : undefined
          }
        }
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      filters.sort === "price-asc"
        ? { salePrice: "asc" as const }
        : filters.sort === "price-desc"
          ? { salePrice: "desc" as const }
          : filters.sort === "condition"
            ? { condition: "asc" as const }
            : { createdAt: "desc" as const };

    const products = await prisma.product.findMany({
      where: where as Prisma.ProductWhereInput,
      include: { brand: true, category: true },
      orderBy
    });
    return products.map((product) => serializeProduct(product as unknown as ProductWithRelations));
  } catch {
    return process.env.NODE_ENV === "production" ? [] : filterSampleProducts(filters);
  }
}

export async function getProductBySlug(slug: string) {
  if (canUseSampleData()) {
    return sampleProducts.find((product) => product.slug === slug) ?? null;
  }
  if (!process.env.DATABASE_URL) return null;

  try {
    await releaseExpiredReservations();

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { brand: true, category: true }
    });
    return product ? serializeProduct(product as unknown as ProductWithRelations) : null;
  } catch {
    return process.env.NODE_ENV === "production" ? null : sampleProducts.find((product) => product.slug === slug) ?? null;
  }
}

export async function getBrands() {
  if (canUseSampleData()) return sampleBrands;
  if (!process.env.DATABASE_URL) return [];

  try {
    return await prisma.brand.findMany({ orderBy: { name: "asc" } });
  } catch {
    return process.env.NODE_ENV === "production" ? [] : sampleBrands;
  }
}

export async function getCategories() {
  if (canUseSampleData()) return sampleCategories;
  if (!process.env.DATABASE_URL) return [];

  try {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    return process.env.NODE_ENV === "production" ? [] : sampleCategories;
  }
}

export async function getAdminProducts() {
  if (canUseSampleData()) return sampleProducts;
  if (!process.env.DATABASE_URL) return [];

  try {
    const products = await prisma.product.findMany({
      include: { brand: true, category: true },
      orderBy: { createdAt: "desc" }
    });
    return products.map((product) => serializeProduct(product as unknown as ProductWithRelations));
  } catch {
    return process.env.NODE_ENV === "production" ? [] : sampleProducts;
  }
}

export function makeUniqueSlug(name: string) {
  return `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;
}
