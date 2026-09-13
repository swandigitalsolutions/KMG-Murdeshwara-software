"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { parseLineItems } from "@/lib/formItems";
import type { BillType } from "@prisma/client";

const MODULE = "Bill";

function pathFor(billType: BillType) {
  return billType === "EWAY" ? "/bill/eway" : "/bill/normal";
}

function buildItems(formData: FormData) {
  const rows = parseLineItems(formData, ["particulars", "hsnCode", "qty", "rate"]);
  return rows
    .map((r, i) => {
      const qty = Number(r.qty || 0);
      const rate = Number(r.rate || 0);
      return {
        particulars: r.particulars,
        hsnCode: r.hsnCode || null,
        qty,
        rate,
        amount: qty * rate,
        sortOrder: i,
      };
    })
    .filter((r) => r.particulars);
}

function computeTotals(subtotal: number, cgstPercent: number, sgstPercent: number, igstPercent: number) {
  const cgstAmount = (subtotal * cgstPercent) / 100;
  const sgstAmount = (subtotal * sgstPercent) / 100;
  const igstAmount = (subtotal * igstPercent) / 100;
  return { grandTotal: subtotal + cgstAmount + sgstAmount + igstAmount };
}

export async function createBill(billType: BillType, formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const partyAddress = String(formData.get("partyAddress") || "").trim();
  const partyGstin = String(formData.get("partyGstin") || "").trim() || undefined;
  const vehicleNo = String(formData.get("vehicleNo") || "").trim() || undefined;
  const ewayBillNo = String(formData.get("ewayBillNo") || "").trim() || undefined;
  const date = new Date(String(formData.get("date")));
  const cgstPercent = Number(formData.get("cgstPercent") || 2.5);
  const sgstPercent = Number(formData.get("sgstPercent") || 2.5);
  const igstPercent = Number(formData.get("igstPercent") || 0);

  if (!partyAddress || Number.isNaN(date.getTime())) {
    throw new Error("Please fill party address and date.");
  }
  if (billType === "EWAY" && !ewayBillNo) {
    throw new Error("E-way bill number is required for an E-Way Bill.");
  }

  const items = buildItems(formData);
  if (items.length === 0) throw new Error("Add at least one item.");
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const { grandTotal } = computeTotals(subtotal, cgstPercent, sgstPercent, igstPercent);

  const countExisting = await prisma.bill.count({ where: { companyId, billType } });
  const prefix = billType === "EWAY" ? "EW" : "B";
  const invoiceNo = `${prefix}-${countExisting + 1}`;

  const record = await prisma.bill.create({
    data: {
      companyId,
      billType,
      invoiceNo,
      date,
      partyAddress,
      partyGstin,
      vehicleNo,
      ewayBillNo,
      subtotal,
      cgstPercent,
      sgstPercent,
      igstPercent,
      grandTotal,
      createdById: session.sub,
      items: { create: items },
    },
  });

  await logAudit(session, companyId, "CREATE", MODULE, record.id, `Created ${billType} bill ${invoiceNo}`);
  revalidatePath(pathFor(billType));
  redirect(pathFor(billType));
}

export async function updateBill(billType: BillType, id: string, formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.bill.findFirst({ where: { id, companyId } });
  if (!existing) throw new Error("Record not found.");

  const partyAddress = String(formData.get("partyAddress") || "").trim();
  const partyGstin = String(formData.get("partyGstin") || "").trim() || undefined;
  const vehicleNo = String(formData.get("vehicleNo") || "").trim() || undefined;
  const ewayBillNo = String(formData.get("ewayBillNo") || "").trim() || undefined;
  const date = new Date(String(formData.get("date")));
  const cgstPercent = Number(formData.get("cgstPercent") || 2.5);
  const sgstPercent = Number(formData.get("sgstPercent") || 2.5);
  const igstPercent = Number(formData.get("igstPercent") || 0);

  if (billType === "EWAY" && !ewayBillNo) {
    throw new Error("E-way bill number is required for an E-Way Bill.");
  }

  const items = buildItems(formData);
  if (items.length === 0) throw new Error("Add at least one item.");
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const { grandTotal } = computeTotals(subtotal, cgstPercent, sgstPercent, igstPercent);

  await prisma.$transaction([
    prisma.billItem.deleteMany({ where: { billId: id } }),
    prisma.bill.update({
      where: { id },
      data: {
        partyAddress,
        partyGstin,
        vehicleNo,
        ewayBillNo,
        date,
        subtotal,
        cgstPercent,
        sgstPercent,
        igstPercent,
        grandTotal,
        items: { create: items },
      },
    }),
  ]);

  await logAudit(session, companyId, "UPDATE", MODULE, id, `Updated ${billType} bill ${existing.invoiceNo}`);
  revalidatePath(pathFor(billType));
  redirect(pathFor(billType));
}

export async function deleteBill(billType: BillType, id: string) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.bill.findFirst({ where: { id, companyId } });
  if (!existing) return;

  await prisma.bill.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit(session, companyId, "DELETE", MODULE, id, `Deleted ${billType} bill ${existing.invoiceNo}`);
  revalidatePath(pathFor(billType));
}
