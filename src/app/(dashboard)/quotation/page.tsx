import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { deleteQuotation } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export default async function QuotationListPage() {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const quotations = await prisma.quotation.findMany({
    where: { companyId, deletedAt: null },
    orderBy: { date: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Quotations</h1>
        <Link
          href="/quotation/new"
          className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition"
        >
          + New Quotation
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">No.</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Party Name</th>
              <th className="px-4 py-2.5 font-medium">Total</th>
              <th className="px-4 py-2.5 font-medium">Added By</th>
              <th className="px-4 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotations.map((q) => (
              <tr key={q.id}>
                <td className="px-4 py-2.5">{q.quotationNo}</td>
                <td className="px-4 py-2.5">{format(q.date, "dd-MM-yyyy")}</td>
                <td className="px-4 py-2.5">{q.partyName}</td>
                <td className="px-4 py-2.5">₹{q.total.toFixed(2)}</td>
                <td className="px-4 py-2.5">{q.createdBy.name}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Link href={`/quotation/${q.id}`} className="text-sm text-slate-600 hover:text-slate-900">
                      View / Print
                    </Link>
                    <Link href={`/quotation/${q.id}/edit`} className="text-sm text-slate-600 hover:text-slate-900">
                      Edit
                    </Link>
                    <DeleteButton action={deleteQuotation.bind(null, q.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {quotations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No quotations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
