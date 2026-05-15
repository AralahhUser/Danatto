import type { GarmentCondition, ProductStatus } from "@/lib/types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2
  }).format(value);
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const conditionLabels: Record<GarmentCondition, string> = {
  nuevo_sin_etiqueta: "Nuevo sin etiqueta",
  excelente: "Excelente",
  muy_bueno: "Muy bueno",
  bueno: "Bueno",
  con_detalles: "Con detalles"
};

export const statusLabels: Record<ProductStatus, string> = {
  disponible: "Disponible",
  vendido: "Vendido",
  reservado: "Reservado",
  oculto: "Oculto"
};

export function productPrice(price: number, salePrice?: number | null) {
  return salePrice ?? price;
}
