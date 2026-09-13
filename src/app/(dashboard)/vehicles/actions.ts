"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const MODULE = "Vehicle";
const BASE_PATH = "/vehicles";

export async function createVehicle(formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const date = new Date(String(formData.get("date")));
  const vehicleNo = String(formData.get("vehicleNo") || "").trim();
  const tonnage = Number(formData.get("tonnage"));
  const amount = Number(formData.get("amount"));

  if (!vehicleNo || Number.isNaN(date.getTime()) || Number.isNaN(tonnage) || Number.isNaN(amount)) {
    throw new Error("Please fill date, vehicle number, tonnage and amount.");
  }

  const record = await prisma.vehicle.create({
    data: { companyId, date, vehicleNo, tonnage, amount, createdById: session.sub },
  });

  await logAudit(session, companyId, "CREATE", MODULE, record.id, `Added vehicle entry (${vehicleNo})`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function updateVehicle(id: string, formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.vehicle.findFirst({ where: { id, companyId } });
  if (!existing) throw new Error("Record not found.");

  const date = new Date(String(formData.get("date")));
  const vehicleNo = String(formData.get("vehicleNo") || "").trim();
  const tonnage = Number(formData.get("tonnage"));
  const amount = Number(formData.get("amount"));

  await prisma.vehicle.update({
    where: { id },
    data: { date, vehicleNo, tonnage, amount },
  });

  await logAudit(session, companyId, "UPDATE", MODULE, id, `Updated vehicle entry (${vehicleNo})`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function deleteVehicle(id: string) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.vehicle.findFirst({ where: { id, companyId } });
  if (!existing) return;

  await prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit(session, companyId, "DELETE", MODULE, id, `Deleted vehicle entry (${existing.vehicleNo})`);
  revalidatePath(BASE_PATH);
}
