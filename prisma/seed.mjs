import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const brands = [
  "Ralph Lauren",
  "Calvin Klein",
  "Tommy Hilfiger",
  "Nike",
  "Adidas",
  "Levi's",
  "Lacoste",
  "Columbia",
  "The North Face"
];

const categories = ["Polos", "Camisas", "Casacas", "Poleras", "Hoodies", "Jeans", "Shorts", "Pantalones", "Accesorios"];

function slugify(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@danatto.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "danatto123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.userAdmin.upsert({
    where: { email: adminEmail },
    update: process.env.ADMIN_PASSWORD ? { passwordHash } : {},
    create: {
      name: "Admin Danatto",
      email: adminEmail,
      passwordHash,
      role: "owner"
    }
  });

  for (const name of brands) {
    await prisma.brand.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) }
    });
  }

  for (const name of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) }
    });
  }

  const brandMap = Object.fromEntries((await prisma.brand.findMany()).map((brand) => [brand.slug, brand.id]));
  const categoryMap = Object.fromEntries((await prisma.category.findMany()).map((category) => [category.slug, category.id]));

  const products = [
    {
      name: "Camisa Oxford Ralph Lauren",
      description: "Camisa de algodon con corte clasico, seleccionada por textura, color y excelente conservacion.",
      price: 169,
      salePrice: 149,
      brandId: brandMap["ralph-lauren"],
      categoryId: categoryMap.camisas,
      images: [image("photo-1598033129183-c4f50c736f10"), image("photo-1523398002811-999ca8dec234")],
      size: "M",
      color: "Azul claro",
      gender: "hombre",
      condition: "excelente",
      measurements: { largo: "74 cm", pecho: "54 cm", hombros: "45 cm", manga: "64 cm" },
      observations: "Sin detalles visibles. Botones completos.",
      isFeatured: true,
      isNewArrival: true
    },
    {
      name: "Jeans Levi's 501 vintage",
      description: "Denim clasico de tiro medio con desgaste natural controlado. Pieza atemporal y resistente.",
      price: 199,
      salePrice: 179,
      brandId: brandMap["levi-s"],
      categoryId: categoryMap.jeans,
      images: [image("photo-1542272604-787c3835535d"), image("photo-1541099649105-f69ad21f3246")],
      size: "32",
      color: "Azul denim",
      gender: "hombre",
      condition: "muy_bueno",
      measurements: { largo: "104 cm", cintura: "82 cm" },
      observations: "Desgaste propio de denim vintage, sin roturas estructurales.",
      isFeatured: true,
      isNewArrival: true
    },
    {
      name: "Casaca Columbia ligera",
      description: "Casaca ligera para clima fresco, con bolsillos funcionales y acabado tecnico.",
      price: 229,
      salePrice: null,
      brandId: brandMap.columbia,
      categoryId: categoryMap.casacas,
      images: [image("photo-1551028719-00167b16eac5"), image("photo-1548883354-7622d03aca27")],
      size: "L",
      color: "Verde oliva",
      gender: "unisex",
      condition: "excelente",
      measurements: { largo: "71 cm", pecho: "58 cm", hombros: "48 cm", manga: "66 cm" },
      observations: "Estado excelente. Cremalleras funcionando.",
      isFeatured: false,
      isNewArrival: true
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: slugify(product.name) },
      update: {},
      create: {
        ...product,
        slug: slugify(product.name),
        stock: 1,
        status: "disponible",
        isUniquePiece: true
      }
    });
  }

  await prisma.banner.upsert({
    where: { id: "seed-home-banner" },
    update: {},
    create: {
      id: "seed-home-banner",
      title: "Nuevos ingresos Danatto",
      subtitle: "Ropa americana seleccionada cada semana",
      imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85",
      buttonText: "Comprar ahora",
      buttonLink: "/shop",
      active: true
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
