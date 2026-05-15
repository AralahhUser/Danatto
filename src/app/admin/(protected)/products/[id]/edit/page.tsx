import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { getAdminProductById, getBrandsAdmin, getCategoriesAdmin } from "@/lib/admin-data";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    getAdminProductById(id),
    getBrandsAdmin(),
    getCategoriesAdmin()
  ]);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Inventario</p>
        <h1 className="mt-2 text-3xl font-semibold">Editar producto</h1>
      </div>
      <AdminProductForm product={product} brands={brands} categories={categories} />
    </div>
  );
}
