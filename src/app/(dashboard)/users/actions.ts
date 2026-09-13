"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const BASE_PATH = "/users";

export async function createUser(formData: FormData) {
  const session = await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "STAFF") as "ADMIN" | "STAFF";

  if (!name || !email || password.length < 6) {
    throw new Error("Name, email and a password of at least 6 characters are required.");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, companyId: session.companyId },
  });

  await logAudit(
    session,
    session.companyId,
    "CREATE",
    "User",
    user.id,
    `Created ${role.toLowerCase()} account for ${name} (${email})`
  );
  revalidatePath(BASE_PATH);
}

export async function toggleUserActive(id: string, active: boolean) {
  const session = await requireAdmin();
  const user = await prisma.user.update({
    where: { id, companyId: session.companyId },
    data: { active },
  });
  await logAudit(
    session,
    user.companyId,
    "UPDATE",
    "User",
    user.id,
    `${active ? "Activated" : "Deactivated"} account for ${user.name}`
  );
  revalidatePath(BASE_PATH);
}

export async function updateCompanyDetails(formData: FormData) {
  const session = await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const address = String(formData.get("address") || "").trim() || null;
  const phone1 = String(formData.get("phone1") || "").trim() || null;
  const phone2 = String(formData.get("phone2") || "").trim() || null;
  const gstin = String(formData.get("gstin") || "").trim() || null;

  if (!name) throw new Error("Company name is required.");

  await prisma.company.update({
    where: { id: session.companyId },
    data: { name, address, phone1, phone2, gstin },
  });

  await logAudit(session, session.companyId, "UPDATE", "Company", session.companyId, `Updated company profile for ${name}`);
  revalidatePath(BASE_PATH);
}
