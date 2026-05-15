import { AdminResourceManager } from "@/components/admin/admin-resource-manager";
import { getBrandsAdmin } from "@/lib/admin-data";

export default async function AdminBrandsPage() {
  const brands = await getBrandsAdmin();
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Catalogo</p>
        <h1 className="mt-2 text-3xl font-semibold">Marcas</h1>
      </div>
      <AdminResourceManager
        title="Marca"
        endpoint="/api/admin/brands"
        items={brands}
        fields={[
          { name: "name", label: "Nombre", required: true },
          { name: "slug", label: "Slug" },
          { name: "logoUrl", label: "Logo URL" }
        ]}
      />
    </div>
  );
}
