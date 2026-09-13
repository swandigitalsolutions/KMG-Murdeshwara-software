import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { createVehicle, deleteVehicle } from "./actions";
import DeleteButton from "@/components/DeleteButton";
import PrintButton from "@/components/PrintButton";
import DownloadPdfButton from "@/components/DownloadPdfButton";

export default async function VehiclesPage() {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const [records, company] = await Promise.all([
    prisma.vehicle.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { date: "desc" },
    }),
    prisma.company.findUnique({ where: { id: companyId } }),
  ]);

  const pdfColumns = [
    { key: "sno", label: "S.No" },
    { key: "date", label: "Date" },
    { key: "vehicleNo", label: "Vehicle No" },
    { key: "tonnage", label: "Tonnage" },
    { key: "amount", label: "Amount" },
  ];
  const pdfRows = records.map((r, i) => ({
    sno: String(i + 1),
    date: format(r.date, "dd-MM-yyyy"),
    vehicleNo: r.vehicleNo,
    tonnage: r.tonnage.toString(),
    amount: r.amount.toFixed(2),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-xl font-semibold text-slate-900">Vehicles</h1>
        <div className="flex gap-2">
          <PrintButton />
          <DownloadPdfButton
            title="Vehicles"
            companyName={company?.name ?? ""}
            columns={pdfColumns}
            rows={pdfRows}
            fileName="vehicles.pdf"
          />
        </div>
      </div>

      <form
        action={createVehicle}
        className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end print:hidden"
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle No</label>
          <input
            type="text"
            name="vehicleNo"
            required
            placeholder="KA-13-C-6489"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tonnage</label>
          <input
            type="number"
            step="0.01"
            name="tonnage"
            required
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
        <div className="sm:col-span-4">
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
              <th className="px-4 py-2.5 font-medium">S.No</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Vehicle No</th>
              <th className="px-4 py-2.5 font-medium">Tonnage</th>
              <th className="px-4 py-2.5 font-medium">Amount</th>
              <th className="px-4 py-2.5 font-medium print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r, i) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5">{i + 1}</td>
                <td className="px-4 py-2.5">{format(r.date, "dd-MM-yyyy")}</td>
                <td className="px-4 py-2.5">{r.vehicleNo}</td>
                <td className="px-4 py-2.5">{r.tonnage}</td>
                <td className="px-4 py-2.5">₹{r.amount.toFixed(2)}</td>
                <td className="px-4 py-2.5 print:hidden">
                  <div className="flex items-center gap-3">
                    <Link href={`/vehicles/${r.id}/edit`} className="text-sm text-slate-600 hover:text-slate-900">
                      Edit
                    </Link>
                    <DeleteButton action={deleteVehicle.bind(null, r.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
