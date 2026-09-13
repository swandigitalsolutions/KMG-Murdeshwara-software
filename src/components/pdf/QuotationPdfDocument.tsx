import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  headerCenter: { flex: 1, alignItems: "center" },
  underlineTitle: { fontSize: 11, textDecoration: "underline", marginBottom: 2 },
  companyName: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  phones: { fontSize: 8, textAlign: "right" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14, marginBottom: 10 },
  toLine: { marginBottom: 10 },
  table: { borderStyle: "solid", borderWidth: 1, borderColor: "#000" },
  row: { flexDirection: "row" },
  headerCell: { fontWeight: 700, backgroundColor: "#f0f0f0" },
  cell: {
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 5,
  },
  colSl: { width: "8%" },
  colParticulars: { width: "40%" },
  colPcs: { width: "12%" },
  colQty: { width: "13%" },
  colRate: { width: "13%" },
  colAmount: { width: "14%" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 6 },
  totalLabel: { fontWeight: 700, marginRight: 20 },
  signatureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 60 },
});

export type QuotationPdfItem = {
  particulars: string;
  pcs: string | null;
  qty: number;
  rate: number;
  amount: number;
};

export default function QuotationPdfDocument({
  companyName,
  phone1,
  phone2,
  quotationNo,
  partyName,
  date,
  items,
  total,
}: {
  companyName: string;
  phone1?: string | null;
  phone2?: string | null;
  quotationNo: string;
  partyName: string;
  date: string;
  items: QuotationPdfItem[];
  total: number;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ width: 90 }} />
          <View style={styles.headerCenter}>
            <Text style={styles.underlineTitle}>MEASUREMENT SHEET</Text>
            <Text style={styles.companyName}>{companyName}</Text>
          </View>
          <View style={{ width: 90 }}>
            {phone1 && <Text style={styles.phones}>M: {phone1}</Text>}
            {phone2 && <Text style={styles.phones}>M: {phone2}</Text>}
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text>No. {quotationNo}</Text>
          <Text>Date: {date}</Text>
        </View>
        <Text style={styles.toLine}>To: {partyName}</Text>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerCell]}>
            <Text style={[styles.cell, styles.colSl, styles.headerCell]}>Sl.No</Text>
            <Text style={[styles.cell, styles.colParticulars, styles.headerCell]}>Particulars</Text>
            <Text style={[styles.cell, styles.colPcs, styles.headerCell]}>PCS</Text>
            <Text style={[styles.cell, styles.colQty, styles.headerCell]}>Qty</Text>
            <Text style={[styles.cell, styles.colRate, styles.headerCell]}>Rate</Text>
            <Text style={[styles.cell, styles.colAmount, styles.headerCell]}>Amount</Text>
          </View>
          {items.map((it, i) => (
            <View style={styles.row} key={i}>
              <Text style={[styles.cell, styles.colSl]}>{i + 1}</Text>
              <Text style={[styles.cell, styles.colParticulars]}>{it.particulars}</Text>
              <Text style={[styles.cell, styles.colPcs]}>{it.pcs ?? ""}</Text>
              <Text style={[styles.cell, styles.colQty]}>{it.qty}</Text>
              <Text style={[styles.cell, styles.colRate]}>{it.rate}</Text>
              <Text style={[styles.cell, styles.colAmount]}>{it.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text>{total.toFixed(2)}</Text>
        </View>

        <View style={styles.signatureRow}>
          <Text>Receiver Signature</Text>
          <Text>For {companyName}</Text>
        </View>
      </Page>
    </Document>
  );
}
