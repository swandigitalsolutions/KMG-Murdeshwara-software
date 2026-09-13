"use client";

import LineItemsEditor, { type LineItemRow } from "@/components/LineItemsEditor";

const COLUMNS = [
  { key: "particulars", label: "Particulars" },
  { key: "hsnCode", label: "HSN Code" },
  { key: "qty", label: "QTY", type: "number" as const },
  { key: "rate", label: "Rate", type: "number" as const },
];

export default function BillForm({
  action,
  isEway,
  defaults,
  initialRows,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  isEway: boolean;
  defaults: {
    date: string;
    partyAddress?: string;
    partyGstin?: string;
    vehicleNo?: string;
    ewayBillNo?: string;
    cgstPercent?: number;
    sgstPercent?: number;
    igstPercent?: number;
  };
  initialRows?: LineItemRow[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Party Address</label>
          <textarea
            name="partyAddress"
            required
            rows={2}
            defaultValue={defaults.partyAddress}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Party GSTIN</label>
          <input
            type="text"
            name="partyGstin"
            defaultValue={defaults.partyGstin}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            required
            defaultValue={defaults.date}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle No</label>
          <input
            type="text"
            name="vehicleNo"
            defaultValue={defaults.vehicleNo}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        {isEway && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-Way Bill No</label>
            <input
              type="text"
              name="ewayBillNo"
              required
              defaultValue={defaults.ewayBillNo}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      <LineItemsEditor
        columns={COLUMNS}
        initialRows={initialRows}
        computeAmount={(row: LineItemRow) => {
          const amt = (Number(row.qty) || 0) * (Number(row.rate) || 0);
          return amt ? amt.toFixed(2) : "";
        }}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-3 gap-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">CGST %</label>
          <input
            type="number"
            step="0.01"
            name="cgstPercent"
            defaultValue={defaults.cgstPercent ?? 2.5}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">SGST %</label>
          <input
            type="number"
            step="0.01"
            name="sgstPercent"
            defaultValue={defaults.sgstPercent ?? 2.5}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">IGST %</label>
          <input
            type="number"
            step="0.01"
            name="igstPercent"
            defaultValue={defaults.igstPercent ?? 0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition"
      >
        {submitLabel}
      </button>
    </form>
  );
}
