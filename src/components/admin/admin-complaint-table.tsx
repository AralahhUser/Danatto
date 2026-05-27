"use client";

import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";

type ComplaintRow = {
  id: string;
  type: string;
  fullName: string;
  document: string;
  email: string;
  phone: string;
  orderNumber?: string | null;
  amount?: { toString: () => string } | number | null;
  product: string;
  detail: string;
  request: string;
  status: string;
  createdAt: Date;
};

export function AdminComplaintTable({ complaints }: { complaints: ComplaintRow[] }) {
  const router = useRouter();

  async function update(id: string, status: string) {
    await fetch(`/api/admin/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="bg-linen text-xs uppercase text-ink/50">
            <tr>
              <th className="px-4 py-3">Codigo</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Detalle</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {complaints.map((complaint) => (
              <tr key={complaint.id} className="align-top">
                <td className="px-4 py-3 font-semibold">{complaint.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{complaint.fullName}</p>
                  <p className="text-xs text-ink/45">Doc. {complaint.document}</p>
                  <p className="text-xs text-ink/45">{complaint.phone}</p>
                  <p className="text-xs text-ink/45">{complaint.email}</p>
                </td>
                <td className="px-4 py-3 capitalize">{complaint.type}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{complaint.product}</p>
                  <p className="text-xs text-ink/45">Pedido: {complaint.orderNumber || "-"}</p>
                  <p className="text-xs text-ink/45">
                    Monto: {complaint.amount ? formatCurrency(Number(complaint.amount)) : "-"}
                  </p>
                </td>
                <td className="max-w-sm px-4 py-3">
                  <p className="line-clamp-3 text-ink/65">{complaint.detail}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-ink/45">Pedido: {complaint.request}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={complaint.status}
                    onChange={(event) => update(complaint.id, event.target.value)}
                    className="rounded-md border border-ink/10 px-2 py-1"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En revision</option>
                    <option value="respondido">Respondido</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </td>
                <td className="px-4 py-3">{new Date(complaint.createdAt).toLocaleDateString("es-PE")}</td>
              </tr>
            ))}
            {!complaints.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink/50">
                  Sin reclamos registrados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
