"use client";

import dynamic from "next/dynamic";
import { FileDown } from "lucide-react";
import ListPdfDocument, { type PdfColumn } from "@/components/pdf/ListPdfDocument";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-400">
        <FileDown size={15} />
        Preparing…
      </span>
    ),
  }
);

export default function DownloadPdfButton({
  title,
  companyName,
  columns,
  rows,
  fileName,
}: {
  title: string;
  companyName: string;
  columns: PdfColumn[];
  rows: Record<string, string>[];
  fileName: string;
}) {
  return (
    <PDFDownloadLink
      document={<ListPdfDocument title={title} companyName={companyName} columns={columns} rows={rows} />}
      fileName={fileName}
      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
    >
      <FileDown size={15} />
      Download PDF
    </PDFDownloadLink>
  );
}
