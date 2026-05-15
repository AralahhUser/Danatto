import { AdminResourceManager } from "@/components/admin/admin-resource-manager";
import { getCategoriesAdmin } from "@/lib/admin-data";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesAdmin();
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Catalogo</p>
        <h1 className="mt-2 text-3xl font-semibold">Categorias</h1>
      </div>
      <AdminResourceManager
        title="Categoria"
        endpoint="/api/admin/categories"
        items={categories}
        fields={[
          { name: "name", label: "Nombre", required: true },
          { name: "slug", label: "Slug" }
        ]}
      />
    </div>
  );
}
