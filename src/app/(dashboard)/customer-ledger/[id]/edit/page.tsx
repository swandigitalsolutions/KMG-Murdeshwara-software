import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { updateLedgerEntry } from "../../actions";

export default async function EditLedgerEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const record = await prisma.ledgerEntry.findFirst({ where: { id, companyId, deletedAt: null } });
  if (!record) notFound();

  const updateWithId = updateLedgerEntry.bind(null, id);

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Edit Ledger Entry</h1>
      <form action={updateWithId} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
          <input
            type="text"
            name="customerName"
            required
            defaultValue={record.customerName}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            required
            defaultValue={format(record.date, "yyyy-MM-dd")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input
            type="text"
            name="description"
            defaultValue={record.description ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Debit (owes)</label>
            <input
              type="number"
              step="0.01"
              name="debit"
              defaultValue={record.debit}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Credit (paid)</label>
            <input
              type="number"
              step="0.01"
              name="credit"
              defaultValue={record.credit}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
