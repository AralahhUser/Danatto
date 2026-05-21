import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).optional().or(z.literal("")),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  salePrice: z.coerce.number().positive().optional().nullable(),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  gender: z.enum(["hombre", "mujer", "unisex"]),
  condition: z.enum(["nuevo_sin_etiqueta", "excelente", "muy_bueno", "bueno", "con_detalles"]),
  measurements: z.object({
    largo: z.string().optional(),
    pecho: z.string().optional(),
    hombros: z.string().optional(),
    manga: z.string().optional(),
    cintura: z.string().optional()
  }),
  observations: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  status: z.enum(["disponible", "vendido", "reservado", "oculto"]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isUniquePiece: z.boolean().default(true)
});

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(3),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(7).max(15),
    dni: z.string().regex(/^\d{8}$/, "DNI invalido"),
    province: z.string().min(2),
    district: z.string().min(2),
    shalomAgencyId: z.string().min(1)
  }),
  shippingMethod: z.enum(["shalom_agency"]),
  paymentProvider: z.enum(["mercado_pago", "culqi", "yape_plin"]),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1)
});

export const brandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal(""))
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional().or(z.literal(""))
});

export const bannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().url(),
  buttonText: z.string().optional().nullable(),
  buttonLink: z.string().optional().nullable(),
  active: z.boolean().default(true)
});

export const couponSchema = z.object({
  code: z.string().min(3).transform((value) => value.toUpperCase()),
  discountType: z.enum(["porcentaje", "monto_fijo"]),
  discountValue: z.coerce.number().positive(),
  expiresAt: z.string().optional().nullable(),
  active: z.boolean().default(true)
});
