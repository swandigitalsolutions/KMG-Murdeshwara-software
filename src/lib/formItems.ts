/** Reads back the indexed item-{key}-{i} fields written by LineItemsEditor. */
export function parseLineItems(formData: FormData, keys: string[]): Record<string, string>[] {
  const count = Number(formData.get("itemCount") || 0);
  const rows: Record<string, string>[] = [];
  for (let i = 0; i < count; i++) {
    const row: Record<string, string> = {};
    for (const key of keys) {
      row[key] = String(formData.get(`item-${key}-${i}`) || "").trim();
    }
    const hasContent = Object.values(row).some((v) => v !== "");
    if (hasContent) rows.push(row);
  }
  return rows;
}
