import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { deleteBill } from "./actions";
import DeleteButton from "@/components/DeleteButton";
import type { BillType } from "@prisma/client";

export default async function BillListPage({
  billType,
  title,
  basePath,
}: {
  billType: BillType;
  title: string;
  basePath: string;
}) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const bills = await prisma.bill.findMany({
    where: { companyId, billType, deletedAt: null },
    orderBy: { date: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  const deleteWithType = deleteBill.bind(null, billType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        <Link
          href={`${basePath}/new`}
          className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition"
        >
          + New {title}
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">Invoice No</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Party</th>
              <th className="px-4 py-2.5 font-medium">Grand Total</th>
              <th className="px-4 py-2.5 font-medium">Added By</th>
              <th className="px-4 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bills.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-2.5">{b.invoiceNo}</td>
                <td className="px-4 py-2.5">{format(b.date, "dd-MM-yyyy")}</td>
                <td className="px-4 py-2.5 max-w-xs truncate">{b.partyAddress}</td>
                <td className="px-4 py-2.5">₹{b.grandTotal.toFixed(2)}</td>
                <td className="px-4 py-2.5">{b.createdBy.name}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Link href={`${basePath}/${b.id}`} className="text-sm text-slate-600 hover:text-slate-900">
                      View / Print
                    </Link>
                    <Link href={`${basePath}/${b.id}/edit`} className="text-sm text-slate-600 hover:text-slate-900">
                      Edit
                    </Link>
                    <DeleteButton action={deleteWithType.bind(null, b.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No bills yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
