import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { createExpense, deleteExpense } from "./actions";
import PhotoUploadField from "@/components/PhotoUploadField";
import DeleteButton from "@/components/DeleteButton";
import PrintButton from "@/components/PrintButton";
import DownloadPdfButton from "@/components/DownloadPdfButton";

export default async function ExpensesPage() {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const [records, company] = await Promise.all([
    prisma.expense.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { date: "desc" },
      include: { createdBy: { select: { name: true } } },
    }),
    prisma.company.findUnique({ where: { id: companyId } }),
  ]);

  const total = records.reduce((sum, r) => sum + r.amount, 0);

  const pdfColumns = [
    { key: "date", label: "Date" },
    { key: "description", label: "Description" },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount" },
  ];
  const pdfRows = records.map((r) => ({
    date: format(r.date, "dd-MM-yyyy"),
    description: r.description,
    category: r.category ?? "",
    amount: r.amount.toFixed(2),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-xl font-semibold text-slate-900">Expenses</h1>
        <div className="flex gap-2">
          <PrintButton />
          <DownloadPdfButton
            title="Expenses"
            companyName={company?.name ?? ""}
            columns={pdfColumns}
            rows={pdfRows}
            fileName="expenses.pdf"
          />
        </div>
      </div>

      <form
        action={createExpense}
        className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-5 gap-4 items-end print:hidden"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            required
            defaultValue={format(new Date(), "yyyy-MM-dd")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input
            type="text"
            name="description"
            required
            placeholder="Diesel, labour, etc."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <input
            type="text"
            name="category"
            placeholder="Fuel"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            name="amount"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <PhotoUploadField />
        <div className="sm:col-span-5">
          <button
            type="submit"
            className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition"
          >
            Add Expense
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Amount</th>
              <th className="px-4 py-2.5 font-medium">Receipt</th>
              <th className="px-4 py-2.5 font-medium">Added By</th>
              <th className="px-4 py-2.5 font-medium print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5">{format(r.date, "dd-MM-yyyy")}</td>
                <td className="px-4 py-2.5">{r.description}</td>
                <td className="px-4 py-2.5">{r.category ?? "—"}</td>
                <td className="px-4 py-2.5">₹{r.amount.toFixed(2)}</td>
                <td className="px-4 py-2.5">
                  {r.photoUrl ? (
                    <a href={r.photoUrl} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.photoUrl} alt="" className="h-10 w-10 rounded object-cover border border-slate-200" />
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">{r.createdBy.name}</td>
                <td className="px-4 py-2.5 print:hidden">
                  <div className="flex items-center gap-3">
                    <Link href={`/expenses/${r.id}/edit`} className="text-sm text-slate-600 hover:text-slate-900">
                      Edit
                    </Link>
                    <DeleteButton action={deleteExpense.bind(null, r.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No expenses yet.
                </td>
              </tr>
            )}
          </tbody>
          {records.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-200 font-medium">
                <td className="px-4 py-2.5" colSpan={3}>
                  Total
                </td>
                <td className="px-4 py-2.5">₹{total.toFixed(2)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
