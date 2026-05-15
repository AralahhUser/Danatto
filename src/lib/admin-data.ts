import { prisma } from "@/lib/db";
import { getAdminProducts } from "@/lib/catalog";
import { sampleBrands, sampleCategories, sampleProducts } from "@/lib/sample-data";

export async function getDashboardStats() {
  if (!process.env.DATABASE_URL) {
    return {
      totalSales: 0,
      recentOrders: [],
      available: sampleProducts.filter((product) => product.status === "disponible").length,
      sold: 0,
      lowStock: sampleProducts.filter((product) => product.stock <= 1).length
    };
  }

  try {
    const [orders, available, sold, lowStock] = await Promise.all([
      prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.product.count({ where: { status: "disponible" } }),
      prisma.product.count({ where: { status: "vendido" } }),
      prisma.product.count({ where: { stock: { lte: 1 }, status: "disponible" } })
    ]);
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
    return { totalSales, recentOrders: orders, available, sold, lowStock };
  } catch {
    return {
      totalSales: 0,
      recentOrders: [],
      available: sampleProducts.filter((product) => product.status === "disponible").length,
      sold: 0,
      lowStock: sampleProducts.filter((product) => product.stock <= 1).length
    };
  }
}

export async function getAdminProductById(id: string) {
  const products = await getAdminProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function getOrders() {
  if (!process.env.DATABASE_URL) return [];

  try {
    return await prisma.order.findMany({
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" }
    });
  } catch {
    return [];
  }
}

export async function getCustomers() {
  if (!process.env.DATABASE_URL) return [];

  try {
    return await prisma.customer.findMany({ include: { orders: true }, orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export async function getBrandsAdmin() {
  if (!process.env.DATABASE_URL) return sampleBrands;

  try {
    return await prisma.brand.findMany({ orderBy: { name: "asc" } });
  } catch {
    return sampleBrands;
  }
}

export async function getCategoriesAdmin() {
  if (!process.env.DATABASE_URL) return sampleCategories;

  try {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    return sampleCategories;
  }
}

export async function getBanners() {
  if (!process.env.DATABASE_URL) {
    return [
      {
        id: "banner-demo",
        title: "Nuevos ingresos",
        subtitle: "Piezas seleccionadas cada semana",
        imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85",
        buttonText: "Comprar ahora",
        buttonLink: "/shop",
        active: true
      }
    ];
  }

  try {
    return await prisma.banner.findMany({ orderBy: { title: "asc" } });
  } catch {
    return [
      {
        id: "banner-demo",
        title: "Nuevos ingresos",
        subtitle: "Piezas seleccionadas cada semana",
        imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85",
        buttonText: "Comprar ahora",
        buttonLink: "/shop",
        active: true
      }
    ];
  }
}

export async function getCoupons() {
  if (!process.env.DATABASE_URL) return [];

  try {
    return await prisma.coupon.findMany({ orderBy: { code: "asc" } });
  } catch {
    return [];
  }
}
