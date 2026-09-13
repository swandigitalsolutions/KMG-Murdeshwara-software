"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { savePhoto } from "@/lib/storage";

const MODULE = "StockRawMaterial";
const BASE_PATH = "/stock-raw-material";

export async function createStockRawMaterial(formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const date = new Date(String(formData.get("date")));
  const vehicleNo = String(formData.get("vehicleNo") || "").trim();
  const measurement = String(formData.get("measurement") || "").trim();
  const photo = formData.get("photo") as File | null;

  if (!vehicleNo || !measurement || Number.isNaN(date.getTime())) {
    throw new Error("Please fill date, vehicle number and measurement.");
  }

  let photoUrl: string | undefined;
  if (photo && photo.size > 0) {
    photoUrl = await savePhoto(photo, `${companyId}/stock-raw-material`);
  }

  const record = await prisma.stockRawMaterial.create({
    data: { companyId, date, vehicleNo, measurement, photoUrl, createdById: session.sub },
  });

  await logAudit(session, companyId, "CREATE", MODULE, record.id, `Added stock entry (${vehicleNo})`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function updateStockRawMaterial(id: string, formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.stockRawMaterial.findFirst({ where: { id, companyId } });
  if (!existing) throw new Error("Record not found.");

  const date = new Date(String(formData.get("date")));
  const vehicleNo = String(formData.get("vehicleNo") || "").trim();
  const measurement = String(formData.get("measurement") || "").trim();
  const photo = formData.get("photo") as File | null;

  let photoUrl = existing.photoUrl;
  if (photo && photo.size > 0) {
    photoUrl = await savePhoto(photo, `${companyId}/stock-raw-material`);
  }

  await prisma.stockRawMaterial.update({
    where: { id },
    data: { date, vehicleNo, measurement, photoUrl },
  });

  await logAudit(session, companyId, "UPDATE", MODULE, id, `Updated stock entry (${vehicleNo})`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function deleteStockRawMaterial(id: string) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.stockRawMaterial.findFirst({ where: { id, companyId } });
  if (!existing) return;

  await prisma.stockRawMaterial.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit(session, companyId, "DELETE", MODULE, id, `Deleted stock entry (${existing.vehicleNo})`);
  revalidatePath(BASE_PATH);
}
