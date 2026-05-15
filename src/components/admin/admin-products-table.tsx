"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, statusLabels } from "@/lib/format";
import type { StoreProduct } from "@/lib/types";

export function AdminProductsTable({ products }: { products: StoreProduct[] }) {
  const router = useRouter();

  async function remove(id: string) {
    if (!window.confirm("Eliminar producto?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-linen text-xs uppercase text-ink/50">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-md bg-mist">
                      <Image src={product.images[0]} alt={product.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-ink/45">Talla {product.size}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{product.brand.name}</td>
                <td className="px-4 py-3">{formatCurrency(product.salePrice ?? product.price)}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">{statusLabels[product.status]}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/products/${product.id}/edit`} className="font-semibold text-navy">
                      Editar
                    </Link>
                    <button onClick={() => remove(product.id)} className="font-semibold text-red-600">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
