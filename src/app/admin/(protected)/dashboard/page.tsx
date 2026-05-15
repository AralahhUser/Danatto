import Link from "next/link";
import { Boxes, CircleDollarSign, PackageCheck, PackageX, TriangleAlert } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getDashboardStats } from "@/lib/admin-data";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-olive">Operacion</p>
          <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          Crear producto
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat icon={<CircleDollarSign />} label="Ventas" value={formatCurrency(stats.totalSales)} />
        <Stat icon={<Boxes />} label="Pedidos recientes" value={String(stats.recentOrders.length)} />
        <Stat icon={<PackageX />} label="Vendidos" value={String(stats.sold)} />
        <Stat icon={<PackageCheck />} label="Disponibles" value={String(stats.available)} />
        <Stat icon={<TriangleAlert />} label="Bajo stock" value={String(stats.lowStock)} />
      </div>
      <section className="mt-8 rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold">Pedidos recientes</h2>
        <div className="mt-5 grid gap-3">
          {stats.recentOrders.length ? (
            stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-md bg-mist p-4 text-sm">
                <span className="font-semibold">Pedido {order.id.slice(0, 8)}</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            ))
          ) : (
            <p className="rounded-md bg-linen p-4 text-sm text-ink/60">Aun no hay pedidos registrados.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-linen text-navy">{icon}</div>
      <p className="text-sm text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
