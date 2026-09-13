import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { updateBill } from "../../../_shared/actions";
import BillForm from "../../../_shared/BillForm";

export default async function EditEwayBillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const bill = await prisma.bill.findFirst({
    where: { id, companyId, billType: "EWAY", deletedAt: null },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!bill) notFound();

  const action = updateBill.bind(null, "EWAY", id);

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Edit E-Way Bill {bill.invoiceNo}</h1>
      <BillForm
        action={action}
        isEway
        defaults={{
          date: format(bill.date, "yyyy-MM-dd"),
          partyAddress: bill.partyAddress,
          partyGstin: bill.partyGstin ?? "",
          vehicleNo: bill.vehicleNo ?? "",
          ewayBillNo: bill.ewayBillNo ?? "",
          cgstPercent: bill.cgstPercent,
          sgstPercent: bill.sgstPercent,
          igstPercent: bill.igstPercent,
        }}
        initialRows={bill.items.map((i) => ({
          particulars: i.particulars,
          hsnCode: i.hsnCode ?? "",
          qty: String(i.qty),
          rate: String(i.rate),
        }))}
        submitLabel="Save Changes"
      />
    </div>
  );
}
