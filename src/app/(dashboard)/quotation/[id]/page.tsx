import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import PrintButton from "@/components/PrintButton";
import DownloadDocPdfButton from "@/components/DownloadDocPdfButton";
import QuotationPdfDocument from "@/components/pdf/QuotationPdfDocument";

export default async function QuotationViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const quotation = await prisma.quotation.findFirst({
    where: { id, companyId, deletedAt: null },
    include: { items: { orderBy: { sortOrder: "asc" } }, company: true },
  });
  if (!quotation) notFound();

  const dateStr = format(quotation.date, "dd-MM-yyyy");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/quotation" className="text-sm text-slate-600 hover:text-slate-900">
          ← Back to quotations
        </Link>
        <div className="flex gap-2">
          <PrintButton />
          <DownloadDocPdfButton
            fileName={`quotation-${quotation.quotationNo}.pdf`}
            document={
              <QuotationPdfDocument
                companyName={quotation.company.name}
                phone1={quotation.company.phone1}
                phone2={quotation.company.phone2}
                quotationNo={quotation.quotationNo}
                partyName={quotation.partyName}
                date={dateStr}
                items={quotation.items}
                total={quotation.total}
              />
            }
          />
          <Link
            href={`/quotation/${quotation.id}/edit`}
            className="inline-flex items-center text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-300 rounded-xl p-8 max-w-3xl mx-auto print:border-none print:shadow-none">
        <div className="flex items-start justify-between">
          <div className="w-24" />
          <div className="text-center flex-1">
            <div className="text-sm underline">MEASUREMENT SHEET</div>
            <div className="text-2xl font-bold mt-1">{quotation.company.name}</div>
          </div>
          <div className="w-32 text-right text-xs text-slate-600">
            {quotation.company.phone1 && <div>M: {quotation.company.phone1}</div>}
            {quotation.company.phone2 && <div>M: {quotation.company.phone2}</div>}
          </div>
        </div>

        <div className="flex justify-between text-sm mt-6 mb-4">
          <div>No. {quotation.quotationNo}</div>
          <div>Date: {dateStr}</div>
        </div>
        <div className="text-sm mb-4">To: {quotation.partyName}</div>

        <table className="w-full text-sm border border-slate-800 border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-800 px-2 py-1.5">Sl.No</th>
              <th className="border border-slate-800 px-2 py-1.5">Particulars</th>
              <th className="border border-slate-800 px-2 py-1.5">PCS</th>
              <th className="border border-slate-800 px-2 py-1.5">Qty</th>
              <th className="border border-slate-800 px-2 py-1.5">Rate</th>
              <th className="border border-slate-800 px-2 py-1.5">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item, i) => (
              <tr key={item.id}>
                <td className="border border-slate-800 px-2 py-1.5 text-center">{i + 1}</td>
                <td className="border border-slate-800 px-2 py-1.5">{item.particulars}</td>
                <td className="border border-slate-800 px-2 py-1.5 text-center">{item.pcs}</td>
                <td className="border border-slate-800 px-2 py-1.5 text-center">{item.qty}</td>
                <td className="border border-slate-800 px-2 py-1.5 text-right">{item.rate}</td>
                <td className="border border-slate-800 px-2 py-1.5 text-right">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-3 text-sm font-semibold gap-8">
          <div>TOTAL</div>
          <div>{quotation.total.toFixed(2)}</div>
        </div>

        <div className="flex justify-between mt-16 text-sm">
          <div>Receiver Signature</div>
          <div>For {quotation.company.name}</div>
        </div>
      </div>
    </div>
  );
}
