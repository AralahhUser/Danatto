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
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Telefono</th>
                <th className="px-4 py-3">Direccion</th>
                <th className="px-4 py-3">Compras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3 font-semibold">{customer.name}</td>
                  <td className="px-4 py-3">{customer.email}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">{customer.address}, {customer.district}</td>
                  <td className="px-4 py-3">{customer.orders.length}</td>
                </tr>
              ))}
              {!customers.length ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-ink/50">Sin clientes todavia.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
