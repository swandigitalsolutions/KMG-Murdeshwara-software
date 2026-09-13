import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getActiveCompanyId } from "@/lib/auth";

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  UPDATE: "bg-amber-50 text-amber-700 border-amber-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
};

export default async function AuditLogPage() {
  const session = await requireAdmin();
  const companyId = await getActiveCompanyId(session);

  const logs = await prisma.auditLog.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { user: { select: { name: true, role: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Audit Log</h1>
        <p className="text-sm text-slate-500 mt-1">
          Every create, update and delete made by staff and admins — including anything staff deleted.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">When</th>
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Action</th>
              <th className="px-4 py-2.5 font-medium">Module</th>
              <th className="px-4 py-2.5 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2.5 whitespace-nowrap">{format(log.createdAt, "dd-MM-yyyy HH:mm")}</td>
                <td className="px-4 py-2.5">
                  {log.user.name} <span className="text-xs text-slate-400">({log.user.role.toLowerCase()})</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${ACTION_STYLES[log.action]}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2.5">{log.module}</td>
                <td className="px-4 py-2.5 text-slate-600">{log.summary}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
