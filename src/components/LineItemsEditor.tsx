"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export type LineItemColumn = {
  key: string; // used to build field name items-{key}-{i}
  label: string;
  type?: "text" | "number";
  placeholder?: string;
};

export type LineItemRow = Record<string, string>;

export default function LineItemsEditor({
  columns,
  initialRows,
  computeAmount,
}: {
  columns: LineItemColumn[];
  initialRows?: LineItemRow[];
  /** Optional: return a live-computed amount string for a row, shown read-only. */
  computeAmount?: (row: LineItemRow) => string;
}) {
  const emptyRow = () => Object.fromEntries(columns.map((c) => [c.key, ""])) as LineItemRow;
  const [rows, setRows] = useState<LineItemRow[]>(initialRows?.length ? initialRows : [emptyRow()]);

  function updateCell(index: number, key: string, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  return (
    <div>
      <input type="hidden" name="itemCount" value={rows.length} />
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2 font-medium">
                  {c.label}
                </th>
              ))}
              {computeAmount && <th className="px-3 py-2 font-medium">Amount</th>}
              <th className="px-3 py-2 font-medium w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.key} className="px-2 py-1.5">
                    <input
                      type={c.type ?? "text"}
                      step={c.type === "number" ? "0.01" : undefined}
                      name={`item-${c.key}-${i}`}
                      value={row[c.key] ?? ""}
                      placeholder={c.placeholder}
                      onChange={(e) => updateCell(i, c.key, e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                ))}
                {computeAmount && (
                  <td className="px-3 py-1.5 text-slate-600">{computeAmount(row)}</td>
                )}
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-slate-400 hover:text-red-600"
                    title="Remove row"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <Plus size={15} /> Add row
      </button>
    </div>
  );
}
