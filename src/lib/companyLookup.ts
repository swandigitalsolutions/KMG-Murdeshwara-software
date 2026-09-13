import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Looks up a company's display name, falling back to a default when the
 * database isn't reachable yet — keeps the public login/selector pages
 * usable before a real DATABASE_URL is configured.
 */
export async function findCompanyNameSafe(code: "KMG" | "MURDESWAR", fallback: string): Promise<string> {
  try {
    const company = await prisma.company.findUnique({ where: { code } });
    return company?.name ?? fallback;
  } catch {
    return fallback;
  }
}
