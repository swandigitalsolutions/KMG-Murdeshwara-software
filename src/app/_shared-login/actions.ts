"use server";

import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

export type LoginState = { error: string | null };

export async function loginAction(
  companyCode: "KMG" | "MURDESWAR",
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email }, include: { company: true } });
  } catch {
    return { error: "Cannot reach the database right now. Please try again once it's connected." };
  }
  if (!user || !user.active || user.company.code !== companyCode) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSession({
    sub: user.id,
    role: user.role,
    name: user.name,
    companyId: user.companyId,
    companyCode: user.company.code,
  });

  redirect("/dashboard");
}
