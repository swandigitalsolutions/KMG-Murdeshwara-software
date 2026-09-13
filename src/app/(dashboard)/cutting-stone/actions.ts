"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { savePhoto } from "@/lib/storage";

const MODULE = "CuttingStone";
const BASE_PATH = "/cutting-stone";

export async function createCuttingStone(formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const date = new Date(String(formData.get("date")));
  const partyName = String(formData.get("partyName") || "").trim();
  const measurement = String(formData.get("measurement") || "").trim();
  const photo = formData.get("photo") as File | null;

  if (!partyName || !measurement || Number.isNaN(date.getTime())) {
    throw new Error("Please fill date, party name and measurement.");
  }

  let photoUrl: string | undefined;
  if (photo && photo.size > 0) {
    photoUrl = await savePhoto(photo, `${companyId}/cutting-stone`);
  }

  const record = await prisma.cuttingStone.create({
    data: { companyId, date, partyName, measurement, photoUrl, createdById: session.sub },
  });

  await logAudit(session, companyId, "CREATE", MODULE, record.id, `Added cutting entry (${partyName})`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function updateCuttingStone(id: string, formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.cuttingStone.findFirst({ where: { id, companyId } });
  if (!existing) throw new Error("Record not found.");

  const date = new Date(String(formData.get("date")));
  const partyName = String(formData.get("partyName") || "").trim();
  const measurement = String(formData.get("measurement") || "").trim();
  const photo = formData.get("photo") as File | null;

  let photoUrl = existing.photoUrl;
  if (photo && photo.size > 0) {
    photoUrl = await savePhoto(photo, `${companyId}/cutting-stone`);
  }

  await prisma.cuttingStone.update({
    where: { id },
    data: { date, partyName, measurement, photoUrl },
  });

  await logAudit(session, companyId, "UPDATE", MODULE, id, `Updated cutting entry (${partyName})`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function deleteCuttingStone(id: string) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.cuttingStone.findFirst({ where: { id, companyId } });
  if (!existing) return;

  await prisma.cuttingStone.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit(session, companyId, "DELETE", MODULE, id, `Deleted cutting entry (${existing.partyName})`);
  revalidatePath(BASE_PATH);
}
