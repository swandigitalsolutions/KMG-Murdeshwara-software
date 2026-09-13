import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { createCuttingStone, deleteCuttingStone } from "./actions";
import PhotoUploadField from "@/components/PhotoUploadField";
import DeleteButton from "@/components/DeleteButton";
import PrintButton from "@/components/PrintButton";
import DownloadPdfButton from "@/components/DownloadPdfButton";

export default async function CuttingStonePage() {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const [records, company] = await Promise.all([
    prisma.cuttingStone.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { date: "desc" },
      include: { createdBy: { select: { name: true } } },
    }),
    prisma.company.findUnique({ where: { id: companyId } }),
  ]);

  const pdfColumns = [
    { key: "date", label: "Date" },
    { key: "partyName", label: "Party Name" },
    { key: "measurement", label: "Measurement" },
    { key: "addedBy", label: "Added By" },
  ];
  const pdfRows = records.map((r) => ({
    date: format(r.date, "dd-MM-yyyy"),
    partyName: r.partyName,
    measurement: r.measurement,
    addedBy: r.createdBy.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-xl font-semibold text-slate-900">Cutting Stone</h1>
        <div className="flex gap-2">
          <PrintButton />
          <DownloadPdfButton
            title="Cutting Stone"
            companyName={company?.name ?? ""}
            columns={pdfColumns}
            rows={pdfRows}
            fileName="cutting-stone.pdf"
          />
        </div>
      </div>

      <form
        action={createCuttingStone}
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Party Name</label>
          <input
            type="text"
            name="partyName"
            required
            placeholder="Sharma Stone Suppliers"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Measurement</label>
          <input
            type="text"
            name="measurement"
            required
            placeholder="52 x 18 x 9.5"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <PhotoUploadField />
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
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Party Name</th>
              <th className="px-4 py-2.5 font-medium">Measurement</th>
              <th className="px-4 py-2.5 font-medium">Photo</th>
              <th className="px-4 py-2.5 font-medium">Added By</th>
              <th className="px-4 py-2.5 font-medium print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5">{format(r.date, "dd-MM-yyyy")}</td>
                <td className="px-4 py-2.5">{r.partyName}</td>
                <td className="px-4 py-2.5">{r.measurement}</td>
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
                    <Link href={`/cutting-stone/${r.id}/edit`} className="text-sm text-slate-600 hover:text-slate-900">
                      Edit
                    </Link>
                    <DeleteButton action={deleteCuttingStone.bind(null, r.id)} />
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
