import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { createLedgerEntry, deleteLedgerEntry } from "./actions";
import DeleteButton from "@/components/DeleteButton";
import PrintButton from "@/components/PrintButton";
import DownloadPdfButton from "@/components/DownloadPdfButton";

export default async function CustomerLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer } = await searchParams;
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const [allRecords, company] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where: { companyId, deletedAt: null },
      orderBy: [{ customerName: "asc" }, { date: "asc" }],
      include: { createdBy: { select: { name: true } } },
    }),
    prisma.company.findUnique({ where: { id: companyId } }),
  ]);

  const balances = new Map<string, number>();
  for (const r of allRecords) {
    balances.set(r.customerName, (balances.get(r.customerName) ?? 0) + r.debit - r.credit);
  }
  const customerNames = [...balances.keys()].sort();

  const records = customer ? allRecords.filter((r) => r.customerName === customer) : allRecords;

  // running balance per customer, in date order
  const running = new Map<string, number>();
  const rowsWithBalance = records.map((r) => {
    const prev = running.get(r.customerName) ?? 0;
    const bal = prev + r.debit - r.credit;
    running.set(r.customerName, bal);
    return { ...r, balance: bal };
  });

  const pdfColumns = [
    { key: "date", label: "Date" },
    { key: "customerName", label: "Customer" },
    { key: "description", label: "Description" },
    { key: "debit", label: "Debit" },
    { key: "credit", label: "Credit" },
    { key: "balance", label: "Balance" },
  ];
  const pdfRows = rowsWithBalance.map((r) => ({
    date: format(r.date, "dd-MM-yyyy"),
    customerName: r.customerName,
    description: r.description ?? "",
    debit: r.debit ? r.debit.toFixed(2) : "",
    credit: r.credit ? r.credit.toFixed(2) : "",
    balance: r.balance.toFixed(2),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-xl font-semibold text-slate-900">Customer Ledger</h1>
        <div className="flex gap-2">
          <PrintButton />
          <DownloadPdfButton
            title={customer ? `Customer Ledger — ${customer}` : "Customer Ledger"}
            companyName={company?.name ?? ""}
            columns={pdfColumns}
            rows={pdfRows}
            fileName="customer-ledger.pdf"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        {customerNames.map((name) => {
          const bal = balances.get(name) ?? 0;
          return (
            <Link
              key={name}
              href={`/customer-ledger?customer=${encodeURIComponent(name)}`}
              className={`rounded-xl border p-3 text-left transition ${
                customer === name ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-400"
              }`}
            >
              <div className="text-sm font-medium truncate">{name}</div>
              <div className={`text-xs mt-0.5 ${customer === name ? "text-slate-300" : bal > 0 ? "text-red-600" : "text-emerald-600"}`}>
                {bal > 0 ? `Owes ₹${bal.toFixed(2)}` : bal < 0 ? `Advance ₹${Math.abs(bal).toFixed(2)}` : "Settled"}
              </div>
            </Link>
          );
        })}
        {customer && (
          <Link href="/customer-ledger" className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500 flex items-center justify-center hover:border-slate-400">
            Show all customers
          </Link>
        )}
      </div>

      <form
        action={createLedgerEntry}
        className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-5 gap-4 items-end print:hidden"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
          <input
            type="text"
            name="customerName"
            required
            defaultValue={customer ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
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
          <input type="text" name="description" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Debit (owes)</label>
          <input type="number" step="0.01" name="debit" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Credit (paid)</label>
          <input type="number" step="0.01" name="credit" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-5">
          <button
            type="submit"
            className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition"
          >
            Add Entry
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Customer</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
              <th className="px-4 py-2.5 font-medium">Debit</th>
              <th className="px-4 py-2.5 font-medium">Credit</th>
              <th className="px-4 py-2.5 font-medium">Balance</th>
              <th className="px-4 py-2.5 font-medium print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rowsWithBalance.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5">{format(r.date, "dd-MM-yyyy")}</td>
                <td className="px-4 py-2.5">{r.customerName}</td>
                <td className="px-4 py-2.5">{r.description ?? "—"}</td>
                <td className="px-4 py-2.5">{r.debit ? `₹${r.debit.toFixed(2)}` : "—"}</td>
                <td className="px-4 py-2.5">{r.credit ? `₹${r.credit.toFixed(2)}` : "—"}</td>
                <td className="px-4 py-2.5 font-medium">₹{r.balance.toFixed(2)}</td>
                <td className="px-4 py-2.5 print:hidden">
                  <div className="flex items-center gap-3">
                    <Link href={`/customer-ledger/${r.id}/edit`} className="text-sm text-slate-600 hover:text-slate-900">
                      Edit
                    </Link>
                    <DeleteButton action={deleteLedgerEntry.bind(null, r.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {rowsWithBalance.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No ledger entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
