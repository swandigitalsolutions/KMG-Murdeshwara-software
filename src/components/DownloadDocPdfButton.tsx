"use client";

import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import { FileDown } from "lucide-react";
import type { DocumentProps } from "@react-pdf/renderer";

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

export default function DownloadDocPdfButton({
  document,
  fileName,
  label = "Download PDF",
}: {
  document: ReactElement<DocumentProps>;
  fileName: string;
  label?: string;
}) {
  return (
    <PDFDownloadLink
      document={document}
      fileName={fileName}
      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
    >
      <FileDown size={15} />
      {label}
    </PDFDownloadLink>
  );
}
