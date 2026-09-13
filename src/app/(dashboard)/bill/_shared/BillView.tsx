import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import PrintButton from "@/components/PrintButton";
import DownloadDocPdfButton from "@/components/DownloadDocPdfButton";
import BillPdfDocument from "@/components/pdf/BillPdfDocument";
import type { BillType } from "@prisma/client";

export default async function BillView({
  id,
  billType,
  basePath,
}: {
  id: string;
  billType: BillType;
  basePath: string;
}) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const bill = await prisma.bill.findFirst({
    where: { id, companyId, billType, deletedAt: null },
    include: { items: { orderBy: { sortOrder: "asc" } }, company: true },
  });
  if (!bill) notFound();

  const dateStr = format(bill.date, "dd-MM-yyyy");
  const cgstAmount = (bill.subtotal * bill.cgstPercent) / 100;
  const sgstAmount = (bill.subtotal * bill.sgstPercent) / 100;
  const igstAmount = (bill.subtotal * bill.igstPercent) / 100;
  const isEway = billType === "EWAY";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link href={basePath} className="text-sm text-slate-600 hover:text-slate-900">
          ← Back
        </Link>
        <div className="flex gap-2">
          <PrintButton />
          <DownloadDocPdfButton
            fileName={`bill-${bill.invoiceNo}.pdf`}
            document={
              <BillPdfDocument
                companyName={bill.company.name}
                companyAddress={bill.company.address}
                phone1={bill.company.phone1}
                phone2={bill.company.phone2}
                gstin={bill.company.gstin}
                isEway={isEway}
                invoiceNo={bill.invoiceNo}
                date={dateStr}
                vehicleNo={bill.vehicleNo}
                ewayBillNo={bill.ewayBillNo}
                partyAddress={bill.partyAddress}
                partyGstin={bill.partyGstin}
                items={bill.items}
                subtotal={bill.subtotal}
                cgstPercent={bill.cgstPercent}
                sgstPercent={bill.sgstPercent}
                igstPercent={bill.igstPercent}
                grandTotal={bill.grandTotal}
              />
            }
          />
          <Link
            href={`${basePath}/${bill.id}/edit`}
            className="inline-flex items-center text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-800 rounded-xl p-8 max-w-3xl mx-auto print:border-none print:shadow-none">
        <div className="flex items-start justify-between text-xs text-slate-600">
          <div>{bill.company.gstin ? `GSTIN: ${bill.company.gstin}` : ""}</div>
          <div className="text-sm underline">TAX INVOICE</div>
          <div className="text-right">
            {bill.company.phone1 && <div>M: {bill.company.phone1}</div>}
            {bill.company.phone2 && <div>M: {bill.company.phone2}</div>}
          </div>
        </div>
        <div className="text-center mt-1">
          <div className="text-2xl font-bold">{bill.company.name}</div>
          <div className="text-sm">Stone Merchants &amp; Building Material Suppliers</div>
          {bill.company.address && <div className="text-xs text-slate-600 mt-1">{bill.company.address}</div>}
        </div>

        <div className="grid grid-cols-2 border border-slate-800 mt-4 text-sm">
          <div className="p-3 border-r border-slate-800">
            <div className="font-semibold mb-1">Party Address:</div>
            <div className="whitespace-pre-wrap">{bill.partyAddress}</div>
            <div className="mt-2">Party GSTIN: {bill.partyGstin ?? ""}</div>
          </div>
          <div className="p-3 space-y-1">
            <div className="flex justify-between">
              <span>Invoice No:</span>
              <span>{bill.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span>Vehicle No:</span>
              <span>{bill.vehicleNo ?? ""}</span>
            </div>
            <div className="flex justify-between">
              <span>E-Way Bill No:</span>
              <span>{isEway ? bill.ewayBillNo ?? "" : "-"}</span>
            </div>
          </div>
        </div>

        <table className="w-full text-sm border-x border-b border-slate-800 border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-800 px-2 py-1.5">Sl.No</th>
              <th className="border border-slate-800 px-2 py-1.5">Particulars</th>
              <th className="border border-slate-800 px-2 py-1.5">HSN Code</th>
              <th className="border border-slate-800 px-2 py-1.5">QTY</th>
              <th className="border border-slate-800 px-2 py-1.5">Rate</th>
              <th className="border border-slate-800 px-2 py-1.5">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, i) => (
              <tr key={item.id}>
                <td className="border border-slate-800 px-2 py-1.5 text-center">{i + 1}</td>
                <td className="border border-slate-800 px-2 py-1.5">{item.particulars}</td>
                <td className="border border-slate-800 px-2 py-1.5 text-center">{item.hsnCode}</td>
                <td className="border border-slate-800 px-2 py-1.5 text-center">{item.qty}</td>
                <td className="border border-slate-800 px-2 py-1.5 text-right">{item.rate}</td>
                <td className="border border-slate-800 px-2 py-1.5 text-right">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 border-x border-b border-slate-800 text-sm">
          <div className="p-3 border-r border-slate-800 flex items-end">
            <span>Received the above mentioned goods</span>
          </div>
          <div>
            <div className="flex justify-between px-3 py-1 border-b border-slate-800">
              <span>Total</span>
              <span>{bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-3 py-1 border-b border-slate-800">
              <span>CGST {bill.cgstPercent}%</span>
              <span>{cgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-3 py-1 border-b border-slate-800">
              <span>SGST {bill.sgstPercent}%</span>
              <span>{sgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-3 py-1 border-b border-slate-800">
              <span>IGST {bill.igstPercent}%</span>
              <span>{igstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-3 py-1 font-semibold">
              <span>G. Total</span>
              <span>{bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-10 text-sm">
          <div>Receiver Signature</div>
          <div className="text-right">
            For {bill.company.name}
            <br />
            Proprietor
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 mt-6">
          Goods once sold cannot be taken back or exchanged
        </div>
      </div>
    </div>
  );
}
