import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { updateCuttingStone } from "../../actions";
import PhotoUploadField from "@/components/PhotoUploadField";

export default async function EditCuttingStonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const record = await prisma.cuttingStone.findFirst({ where: { id, companyId, deletedAt: null } });
  if (!record) notFound();

  const updateWithId = updateCuttingStone.bind(null, id);

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Edit Cutting Stone Entry</h1>
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Party Name</label>
          <input
            type="text"
            name="partyName"
            required
            defaultValue={record.partyName}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Measurement</label>
          <input
            type="text"
            name="measurement"
            required
            defaultValue={record.measurement}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <PhotoUploadField existingUrl={record.photoUrl} />
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
