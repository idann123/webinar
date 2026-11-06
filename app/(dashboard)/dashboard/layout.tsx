import { requireSession } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  return (
    <DashboardShell user={{ nama: session.nama, role: session.role }}>
      {children}
    </DashboardShell>
  );
}