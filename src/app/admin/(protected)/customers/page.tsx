import { getCustomers } from "@/lib/admin-data";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Clientes</p>
        <h1 className="mt-2 text-3xl font-semibold">Gestion de clientes</h1>
      </div>
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-linen text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">DNI</th>
                <th className="px-4 py-3">Telefono</th>
                <th className="px-4 py-3">Ubicacion</th>
                <th className="px-4 py-3">Agencia Shalom</th>
                <th className="px-4 py-3">Compras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3 font-semibold">{customer.name}</td>
                  <td className="px-4 py-3">{customer.dni || "-"}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">
                    {[customer.department, customer.province || customer.city, customer.district].filter(Boolean).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{customer.shalomAgencyName || "-"}</p>
                    {customer.shalomAgencyAddress ? <p className="mt-1 text-xs text-ink/50">{customer.shalomAgencyAddress}</p> : null}
                  </td>
                  <td className="px-4 py-3">{customer.orders.length}</td>
                </tr>
              ))}
              {!customers.length ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-ink/50">Sin clientes todavia.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
