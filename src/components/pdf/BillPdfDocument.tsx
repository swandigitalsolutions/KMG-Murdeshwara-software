import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica" },
  outerBorder: { borderWidth: 1, borderColor: "#000", padding: 14, flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  gtin: { fontSize: 8 },
  phones: { fontSize: 8, textAlign: "right" },
  center: { alignItems: "center", marginTop: 2 },
  invoiceTitle: { fontSize: 10, textDecoration: "underline" },
  companyName: { fontSize: 20, fontWeight: 700, marginTop: 2 },
  subtitle: { fontSize: 9, marginTop: 2 },
  address: { fontSize: 8, marginTop: 2, textAlign: "center" },
  metaSection: { flexDirection: "row", marginTop: 10, borderTopWidth: 1, borderColor: "#000" },
  partyBox: { width: "55%", padding: 6, borderRightWidth: 1, borderColor: "#000" },
  invoiceBox: { width: "45%", padding: 6 },
  metaLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  table: { marginTop: 0, borderTopWidth: 1, borderColor: "#000" },
  row: { flexDirection: "row" },
  headerCell: { fontWeight: 700, backgroundColor: "#f0f0f0" },
  cell: { borderStyle: "solid", borderWidth: 0.5, borderColor: "#000", padding: 5 },
  colSl: { width: "6%" },
  colParticulars: { width: "34%" },
  colHsn: { width: "14%" },
  colQty: { width: "12%" },
  colRate: { width: "14%" },
  colAmount: { width: "20%" },
  bottomSection: { flexDirection: "row", marginTop: 0, borderTopWidth: 0 },
  rupeesBox: { width: "60%", padding: 8, borderRightWidth: 1, borderColor: "#000", justifyContent: "flex-end" },
  totalsBox: { width: "40%" },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", padding: 4, borderBottomWidth: 0.5, borderColor: "#000" },
  signatureSection: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  footerNote: { fontSize: 7.5, marginTop: 10, textAlign: "center", color: "#333" },
});

export type BillPdfItem = {
  particulars: string;
  hsnCode: string | null;
  qty: number;
  rate: number;
  amount: number;
};

export default function BillPdfDocument({
  companyName,
  companyAddress,
  phone1,
  phone2,
  gstin,
  isEway,
  invoiceNo,
  date,
  vehicleNo,
  ewayBillNo,
  partyAddress,
  partyGstin,
  items,
  subtotal,
  cgstPercent,
  sgstPercent,
  igstPercent,
  grandTotal,
}: {
  companyName: string;
  companyAddress?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  gstin?: string | null;
  isEway: boolean;
  invoiceNo: string;
  date: string;
  vehicleNo?: string | null;
  ewayBillNo?: string | null;
  partyAddress: string;
  partyGstin?: string | null;
  items: BillPdfItem[];
  subtotal: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  grandTotal: number;
}) {
  const cgstAmount = (subtotal * cgstPercent) / 100;
  const sgstAmount = (subtotal * sgstPercent) / 100;
  const igstAmount = (subtotal * igstPercent) / 100;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.topRow}>
            <Text style={styles.gtin}>{gstin ? `GSTIN: ${gstin}` : ""}</Text>
            <View style={styles.center}>
              <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            </View>
            <View>
              {phone1 && <Text style={styles.phones}>M: {phone1}</Text>}
              {phone2 && <Text style={styles.phones}>M: {phone2}</Text>}
            </View>
          </View>
          <View style={styles.center}>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.subtitle}>Stone Merchants &amp; Building Material Suppliers</Text>
            {companyAddress && <Text style={styles.address}>{companyAddress}</Text>}
          </View>

          <View style={styles.metaSection}>
            <View style={styles.partyBox}>
              <Text style={{ fontWeight: 700, marginBottom: 3 }}>Party Address:</Text>
              <Text>{partyAddress}</Text>
              <Text style={{ marginTop: 6 }}>Party GSTIN: {partyGstin ?? ""}</Text>
            </View>
            <View style={styles.invoiceBox}>
              <View style={styles.metaLine}>
                <Text>Invoice No:</Text>
                <Text>{invoiceNo}</Text>
              </View>
              <View style={styles.metaLine}>
                <Text>Date:</Text>
                <Text>{date}</Text>
              </View>
              <View style={styles.metaLine}>
                <Text>Vehicle No:</Text>
                <Text>{vehicleNo ?? ""}</Text>
              </View>
              <View style={styles.metaLine}>
                <Text>E-Way Bill No:</Text>
                <Text>{isEway ? ewayBillNo ?? "" : "-"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.table}>
            <View style={[styles.row, styles.headerCell]}>
              <Text style={[styles.cell, styles.colSl, styles.headerCell]}>Sl.No</Text>
              <Text style={[styles.cell, styles.colParticulars, styles.headerCell]}>Particulars</Text>
              <Text style={[styles.cell, styles.colHsn, styles.headerCell]}>HSN Code</Text>
              <Text style={[styles.cell, styles.colQty, styles.headerCell]}>QTY</Text>
              <Text style={[styles.cell, styles.colRate, styles.headerCell]}>Rate</Text>
              <Text style={[styles.cell, styles.colAmount, styles.headerCell]}>Amount</Text>
            </View>
            {items.map((it, i) => (
              <View style={styles.row} key={i}>
                <Text style={[styles.cell, styles.colSl]}>{i + 1}</Text>
                <Text style={[styles.cell, styles.colParticulars]}>{it.particulars}</Text>
                <Text style={[styles.cell, styles.colHsn]}>{it.hsnCode ?? ""}</Text>
                <Text style={[styles.cell, styles.colQty]}>{it.qty}</Text>
                <Text style={[styles.cell, styles.colRate]}>{it.rate}</Text>
                <Text style={[styles.cell, styles.colAmount]}>{it.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.bottomSection, { borderWidth: 0.5, borderColor: "#000", borderTopWidth: 0 }]}>
            <View style={styles.rupeesBox}>
              <Text>Received the above mentioned goods</Text>
            </View>
            <View style={styles.totalsBox}>
              <View style={styles.totalsRow}>
                <Text>Total</Text>
                <Text>{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text>CGST {cgstPercent}%</Text>
                <Text>{cgstAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text>SGST {sgstPercent}%</Text>
                <Text>{sgstAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text>IGST {igstPercent}%</Text>
                <Text>{igstAmount.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalsRow, { fontWeight: 700, borderBottomWidth: 0 }]}>
                <Text>G. Total</Text>
                <Text>{grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.signatureSection}>
            <Text>Receiver Signature</Text>
            <Text>For {companyName}{"\n"}Proprietor</Text>
          </View>

          <Text style={styles.footerNote}>Goods once sold cannot be taken back or exchanged</Text>
        </View>
      </Page>
    </Document>
  );
}
