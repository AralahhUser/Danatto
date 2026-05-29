import { AdminPasswordForm } from "@/components/admin/admin-password-form";
import { requireAdminSession } from "@/lib/auth";

export default async function AdminSecurityPage() {
  const session = await requireAdminSession();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Seguridad</p>
        <h1 className="mt-2 text-3xl font-semibold">Acceso admin</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
          Cambia la contrasena del panel cuando necesites renovar el acceso o reemplazar una clave temporal.
        </p>
      </div>
      <AdminPasswordForm email={session.email} />
    </div>
  );
}
