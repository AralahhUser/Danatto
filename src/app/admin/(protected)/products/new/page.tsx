import { AdminProductForm } from "@/components/admin/admin-product-form";
import { getBrandsAdmin, getCategoriesAdmin } from "@/lib/admin-data";

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([getBrandsAdmin(), getCategoriesAdmin()]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Inventario</p>
        <h1 className="mt-2 text-3xl font-semibold">Crear producto</h1>
      </div>
      <AdminProductForm brands={brands} categories={categories} />
    </div>
  );
}
