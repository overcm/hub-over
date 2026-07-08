import { requireAdmin } from "@/lib/permissions";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <AdminSidebar userName={user.name ?? user.email ?? ""} />
      <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
