import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { updateQuotation } from "../../actions";
import QuotationForm from "../../QuotationForm";

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const quotation = await prisma.quotation.findFirst({
    where: { id, companyId, deletedAt: null },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!quotation) notFound();

  const updateWithId = updateQuotation.bind(null, id);

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Edit Quotation {quotation.quotationNo}</h1>
      <QuotationForm
        action={updateWithId}
        defaultPartyName={quotation.partyName}
        defaultDate={format(quotation.date, "yyyy-MM-dd")}
        initialRows={quotation.items.map((i) => ({
          particulars: i.particulars,
          pcs: i.pcs ?? "",
          qty: String(i.qty),
          rate: String(i.rate),
        }))}
        submitLabel="Save Changes"
      />
    </div>
  );
}
