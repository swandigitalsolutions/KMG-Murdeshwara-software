"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { parseLineItems } from "@/lib/formItems";

const MODULE = "Quotation";
const BASE_PATH = "/quotation";

function buildItems(formData: FormData) {
  const rows = parseLineItems(formData, ["particulars", "pcs", "qty", "rate"]);
  return rows
    .map((r, i) => {
      const qty = Number(r.qty || 0);
      const rate = Number(r.rate || 0);
      return {
        particulars: r.particulars,
        pcs: r.pcs || null,
        qty,
        rate,
        amount: qty * rate,
        sortOrder: i,
      };
    })
    .filter((r) => r.particulars);
}

export async function createQuotation(formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const partyName = String(formData.get("partyName") || "").trim();
  const date = new Date(String(formData.get("date")));
  if (!partyName || Number.isNaN(date.getTime())) {
    throw new Error("Please fill party name and date.");
  }

  const items = buildItems(formData);
  if (items.length === 0) throw new Error("Add at least one item.");
  const total = items.reduce((s, i) => s + i.amount, 0);

  const countThisYear = await prisma.quotation.count({ where: { companyId } });
  const quotationNo = `Q-${countThisYear + 1}`;

  const record = await prisma.quotation.create({
    data: {
      companyId,
      quotationNo,
      partyName,
      date,
      total,
      createdById: session.sub,
      items: { create: items },
    },
  });

  await logAudit(session, companyId, "CREATE", MODULE, record.id, `Created quotation ${quotationNo} for ${partyName}`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function updateQuotation(id: string, formData: FormData) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.quotation.findFirst({ where: { id, companyId } });
  if (!existing) throw new Error("Record not found.");

  const partyName = String(formData.get("partyName") || "").trim();
  const date = new Date(String(formData.get("date")));
  const items = buildItems(formData);
  if (items.length === 0) throw new Error("Add at least one item.");
  const total = items.reduce((s, i) => s + i.amount, 0);

  await prisma.$transaction([
    prisma.quotationItem.deleteMany({ where: { quotationId: id } }),
    prisma.quotation.update({
      where: { id },
      data: {
        partyName,
        date,
        total,
        items: { create: items },
      },
    }),
  ]);

  await logAudit(session, companyId, "UPDATE", MODULE, id, `Updated quotation ${existing.quotationNo}`);
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function deleteQuotation(id: string) {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const existing = await prisma.quotation.findFirst({ where: { id, companyId } });
  if (!existing) return;

  await prisma.quotation.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit(session, companyId, "DELETE", MODULE, id, `Deleted quotation ${existing.quotationNo}`);
  revalidatePath(BASE_PATH);
}
