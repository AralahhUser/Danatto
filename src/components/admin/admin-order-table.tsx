"use client";

import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";

type OrderRow = {
  id: string;
  total: { toString: () => string } | number;
  paymentStatus: string;
  shippingStatus: string;
  paymentProvider: string;
  createdAt: Date;
  customer: { name: string; email: string; phone: string; city: string };
};

export function AdminOrderTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();

  async function update(id: string, field: "paymentStatus" | "shippingStatus", value: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value })
    });
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-linen text-xs uppercase text-ink/50">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Envio</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-semibold">{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{order.customer.name}</p>
                  <p className="text-xs text-ink/45">{order.customer.email}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="grid gap-2">
                    <span className="text-xs text-ink/45">{order.paymentProvider}</span>
                    <select
                      defaultValue={order.paymentStatus}
                      onChange={(event) => update(order.id, "paymentStatus", event.target.value)}
                      className="rounded-md border border-ink/10 px-2 py-1"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="pagado">Pagado</option>
                      <option value="fallido">Fallido</option>
                      <option value="reembolsado">Reembolsado</option>
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={order.shippingStatus}
                    onChange={(event) => update(order.id, "shippingStatus", event.target.value)}
                    className="rounded-md border border-ink/10 px-2 py-1"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_preparacion">En preparación</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
                <td className="px-4 py-3">{formatCurrency(Number(order.total))}</td>
                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString("es-PE")}</td>
              </tr>
            ))}
            {!orders.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">Sin pedidos todavia.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
