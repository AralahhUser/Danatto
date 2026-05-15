import { AdminResourceManager } from "@/components/admin/admin-resource-manager";
import { getCoupons } from "@/lib/admin-data";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Promociones</p>
        <h1 className="mt-2 text-3xl font-semibold">Cupones</h1>
      </div>
      <AdminResourceManager
        title="Cupon"
        endpoint="/api/admin/coupons"
        items={coupons}
        fields={[
          { name: "code", label: "Codigo", required: true },
          { name: "discountType", label: "Tipo", required: true },
          { name: "discountValue", label: "Valor", type: "number", required: true },
          { name: "expiresAt", label: "Vence" },
          { name: "active", label: "Activo", type: "checkbox" }
        ]}
      />
    </div>
  );
}
