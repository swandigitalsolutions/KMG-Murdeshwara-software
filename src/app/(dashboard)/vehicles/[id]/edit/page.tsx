import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { updateVehicle } from "../../actions";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const record = await prisma.vehicle.findFirst({ where: { id, companyId, deletedAt: null } });
  if (!record) notFound();

  const updateWithId = updateVehicle.bind(null, id);

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Edit Vehicle Entry</h1>
      <form action={updateWithId} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle No</label>
          <input
            type="text"
            name="vehicleNo"
            required
            defaultValue={record.vehicleNo}
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
            defaultValue={record.tonnage}
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
            defaultValue={record.amount}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
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
