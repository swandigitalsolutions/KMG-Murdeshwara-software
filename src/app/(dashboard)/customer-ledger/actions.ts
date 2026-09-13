"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const MODULE = "LedgerEntry";
const BASE_PATH = "/customer-ledger";

export async function createLedgerEntry(formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const customerName = String(formData.get("customerName") || "").trim();
  const date = new Date(String(formData.get("date")));
  const description = String(formData.get("description") || "").trim() || undefined;
  const debit = Number(formData.get("debit") || 0);
  const credit = Number(formData.get("credit") || 0);

  if (!customerName || Number.isNaN(date.getTime())) {
    throw new Error("Please fill customer name and date.");
  }
  if (!debit && !credit) {
    throw new Error("Enter a debit or credit amount.");
  }

  const record = await prisma.ledgerEntry.create({
    data: { companyId, customerName, date, description, debit, credit, createdById: session.sub },
  });

  await logAudit(session, companyId, "CREATE", MODULE, record.id, `Added ledger entry for ${customerName}`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function updateLedgerEntry(id: string, formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.ledgerEntry.findFirst({ where: { id, companyId } });
  if (!existing) throw new Error("Record not found.");

  const customerName = String(formData.get("customerName") || "").trim();
  const date = new Date(String(formData.get("date")));
  const description = String(formData.get("description") || "").trim() || undefined;
  const debit = Number(formData.get("debit") || 0);
  const credit = Number(formData.get("credit") || 0);

  await prisma.ledgerEntry.update({
    where: { id },
    data: { customerName, date, description, debit, credit },
  });

  await logAudit(session, companyId, "UPDATE", MODULE, id, `Updated ledger entry for ${customerName}`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function deleteLedgerEntry(id: string) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.ledgerEntry.findFirst({ where: { id, companyId } });
  if (!existing) return;

  await prisma.ledgerEntry.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit(session, companyId, "DELETE", MODULE, id, `Deleted ledger entry for ${existing.customerName}`);
  revalidatePath(BASE_PATH);
}
