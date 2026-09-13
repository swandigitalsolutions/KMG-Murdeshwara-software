"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { savePhoto } from "@/lib/storage";

const MODULE = "Expense";
const BASE_PATH = "/expenses";

export async function createExpense(formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const date = new Date(String(formData.get("date")));
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "").trim() || undefined;
  const amount = Number(formData.get("amount"));
  const photo = formData.get("photo") as File | null;

  if (!description || Number.isNaN(date.getTime()) || Number.isNaN(amount)) {
    throw new Error("Please fill date, description and amount.");
  }

  let photoUrl: string | undefined;
  if (photo && photo.size > 0) {
    photoUrl = await savePhoto(photo, `${companyId}/expenses`);
  }

  const record = await prisma.expense.create({
    data: { companyId, date, description, category, amount, photoUrl, createdById: session.sub },
  });

  await logAudit(session, companyId, "CREATE", MODULE, record.id, `Added expense (${description})`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function updateExpense(id: string, formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.expense.findFirst({ where: { id, companyId } });
  if (!existing) throw new Error("Record not found.");

  const date = new Date(String(formData.get("date")));
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "").trim() || undefined;
  const amount = Number(formData.get("amount"));
  const photo = formData.get("photo") as File | null;

  let photoUrl = existing.photoUrl;
  if (photo && photo.size > 0) {
    photoUrl = await savePhoto(photo, `${companyId}/expenses`);
  }

  await prisma.expense.update({
    where: { id },
    data: { date, description, category, amount, photoUrl },
  });

  await logAudit(session, companyId, "UPDATE", MODULE, id, `Updated expense (${description})`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function deleteExpense(id: string) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.expense.findFirst({ where: { id, companyId } });
  if (!existing) return;

  await prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit(session, companyId, "DELETE", MODULE, id, `Deleted expense (${existing.description})`);
  revalidatePath(BASE_PATH);
}
