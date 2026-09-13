import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 9, fontFamily: "Helvetica" },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 9, color: "#555", marginBottom: 12 },
  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#333" },
  row: { flexDirection: "row" },
  headerRow: { flexDirection: "row", backgroundColor: "#e5e7eb" },
  cell: {
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#333",
    padding: 4,
    flexGrow: 1,
    flexBasis: 0,
  },
  headerCell: { fontWeight: 700 },
});

export type PdfColumn = { key: string; label: string };

export default function ListPdfDocument({
  title,
  companyName,
  columns,
  rows,
}: {
  title: string;
  companyName: string;
  columns: PdfColumn[];
  rows: Record<string, string>[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <Text style={styles.title}>{companyName}</Text>
        <Text style={styles.subtitle}>{title}</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {columns.map((c) => (
              <Text key={c.key} style={[styles.cell, styles.headerCell]}>
                {c.label}
              </Text>
            ))}
          </View>
          {rows.map((row, i) => (
            <View style={styles.row} key={i}>
              {columns.map((c) => (
                <Text key={c.key} style={styles.cell}>
                  {row[c.key] ?? ""}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
