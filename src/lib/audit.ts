import "server-only";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export async function logAudit(
  session: SessionPayload,
  companyId: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  module: string,
  recordId: string,
  summary: string
) {
  await prisma.auditLog.create({
    data: {
      companyId,
      userId: session.sub,
      action,
      module,
      recordId,
      summary,
    },
  });
}
