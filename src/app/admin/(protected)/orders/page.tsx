import { AdminOrderTable } from "@/components/admin/admin-order-table";
import { getOrders } from "@/lib/admin-data";

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Ventas</p>
        <h1 className="mt-2 text-3xl font-semibold">Pedidos</h1>
      </div>
      <AdminOrderTable orders={orders} />
    </div>
  );
}
