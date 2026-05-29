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
    department: z.string().min(2),
    province: z.string().min(2),
    district: z.string().optional().default(""),
    shalomAgencyId: z.string().min(1)
  }),
  shippingMethod: z.enum(["shalom_agency"]),
  paymentProvider: z.enum(["mercado_pago"]),
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

export const complaintSchema = z.object({
  type: z.enum(["reclamo", "queja"]),
  fullName: z.string().min(3),
  document: z.string().min(8).max(12),
  email: z.string().email(),
  phone: z.string().min(7).max(15),
  address: z.string().optional().or(z.literal("")),
  orderNumber: z.string().optional().or(z.literal("")),
  amount: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.coerce.number().nonnegative().nullable()
  ),
  product: z.string().min(3),
  detail: z.string().min(10),
  request: z.string().min(5)
});

export const adminPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contrasena actual"),
    newPassword: z
      .string()
      .min(10, "La nueva contrasena debe tener al menos 10 caracteres")
      .regex(/[a-z]/, "Incluye una minuscula")
      .regex(/[A-Z]/, "Incluye una mayuscula")
      .regex(/[0-9]/, "Incluye un numero")
      .regex(/[^A-Za-z0-9]/, "Incluye un simbolo"),
    confirmPassword: z.string().min(1, "Confirma la nueva contrasena")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"]
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contrasena debe ser distinta a la actual",
    path: ["newPassword"]
  });
