export type ProductStatus = "disponible" | "vendido" | "reservado" | "oculto";
export type GarmentCondition =
  | "nuevo_sin_etiqueta"
  | "excelente"
  | "muy_bueno"
  | "bueno"
  | "con_detalles";
export type Gender = "hombre" | "mujer" | "unisex";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Measurements = {
  largo?: string;
  pecho?: string;
  hombros?: string;
  manga?: string;
  cintura?: string;
};

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  brandId: string;
  categoryId: string;
  images: string[];
  size: string;
  color: string;
  gender: Gender;
  condition: GarmentCondition;
  measurements: Measurements;
  observations?: string | null;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isUniquePiece: boolean;
  createdAt: string;
  updatedAt?: string;
  brand: Brand;
  category: Category;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

export type CheckoutPayload = {
  customer: {
    name: string;
    phone: string;
    dni: string;
    department: string;
    province: string;
    district?: string;
    shalomAgencyId: string;
    email?: string;
  };
  shippingMethod: "shalom_agency";
  paymentProvider: "mercado_pago";
  items: Array<{ productId: string; quantity: number }>;
};
