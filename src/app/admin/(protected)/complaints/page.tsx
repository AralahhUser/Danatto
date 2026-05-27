import { AdminComplaintTable } from "@/components/admin/admin-complaint-table";
import { getComplaints } from "@/lib/admin-data";

export default async function AdminComplaintsPage() {
  const complaints = await getComplaints();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Atencion</p>
        <h1 className="mt-2 text-3xl font-semibold">Libro de reclamaciones</h1>
      </div>
      <AdminComplaintTable complaints={complaints} />
    </div>
  );
}
