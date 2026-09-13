"use client";

import LineItemsEditor, { type LineItemRow } from "@/components/LineItemsEditor";

const COLUMNS = [
  { key: "particulars", label: "Particulars (e.g. 54 x 24 x 09)" },
  { key: "pcs", label: "PCS" },
  { key: "qty", label: "Qty", type: "number" as const },
  { key: "rate", label: "Rate", type: "number" as const },
];

export default function QuotationForm({
  action,
  defaultPartyName,
  defaultDate,
  initialRows,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultPartyName?: string;
  defaultDate: string;
  initialRows?: LineItemRow[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Party Name (To)</label>
          <input
            type="text"
            name="partyName"
            required
            defaultValue={defaultPartyName}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            required
            defaultValue={defaultDate}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <LineItemsEditor
        columns={COLUMNS}
        initialRows={initialRows}
        computeAmount={(row: LineItemRow) => {
          const amt = (Number(row.qty) || 0) * (Number(row.rate) || 0);
          return amt ? amt.toFixed(2) : "";
        }}
      />

      <button
        type="submit"
        className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition"
      >
        {submitLabel}
      </button>
    </form>
  );
}
