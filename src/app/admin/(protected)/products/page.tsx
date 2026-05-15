import Link from "next/link";
import { AdminProductsTable } from "@/components/admin/admin-products-table";
import { getAdminProducts } from "@/lib/catalog";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-olive">Inventario</p>
          <h1 className="mt-2 text-3xl font-semibold">Productos</h1>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          Nuevo producto
        </Link>
      </div>
      <AdminProductsTable products={products} />
    </div>
  );
}
