import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  const company = await prisma.company.findUnique({ where: { id: session.companyId } });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isAdmin={session.role === "ADMIN"} companyName={company?.name ?? session.companyCode} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar userName={session.name} role={session.role} companyName={company?.name ?? session.companyCode} />
        <main className="flex-1 p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
