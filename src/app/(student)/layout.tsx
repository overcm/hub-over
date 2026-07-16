import { requireUser } from "@/lib/permissions";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { HeartbeatTracker } from "@/components/layout/HeartbeatTracker";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <HeartbeatTracker />
      <StudentSidebar userName={user.name ?? user.email ?? ""} />
      <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
