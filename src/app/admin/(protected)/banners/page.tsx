import { AdminResourceManager } from "@/components/admin/admin-resource-manager";
import { getBanners } from "@/lib/admin-data";

export default async function AdminBannersPage() {
  const banners = await getBanners();
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Contenido</p>
        <h1 className="mt-2 text-3xl font-semibold">Banners</h1>
      </div>
      <AdminResourceManager
        title="Banner"
        endpoint="/api/admin/banners"
        items={banners}
        fields={[
          { name: "title", label: "Titulo", required: true },
          { name: "subtitle", label: "Subtitulo" },
          { name: "imageUrl", label: "Imagen URL", required: true },
          { name: "buttonText", label: "Boton" },
          { name: "buttonLink", label: "Link" },
          { name: "active", label: "Activo", type: "checkbox" }
        ]}
      />
    </div>
  );
}
