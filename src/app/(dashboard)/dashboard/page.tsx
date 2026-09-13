import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser, getActiveCompanyId } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await requireUser();
  const companyId = await getActiveCompanyId(session);

  const [stockCount, cuttingCount, blockCount, vehicleCount, expenseAgg, ledgerEntries, quotationCount, billCount, company] =
    await Promise.all([
      prisma.stockRawMaterial.count({ where: { companyId, deletedAt: null } }),
      prisma.cuttingStone.count({ where: { companyId, deletedAt: null } }),
      prisma.block.count({ where: { companyId, deletedAt: null } }),
      prisma.vehicle.count({ where: { companyId, deletedAt: null } }),
      prisma.expense.aggregate({ where: { companyId, deletedAt: null }, _sum: { amount: true } }),
      prisma.ledgerEntry.findMany({ where: { companyId, deletedAt: null }, select: { customerName: true, debit: true, credit: true } }),
      prisma.quotation.count({ where: { companyId, deletedAt: null } }),
      prisma.bill.count({ where: { companyId, deletedAt: null } }),
      prisma.company.findUnique({ where: { id: companyId } }),
    ]);

  const balances = new Map<string, number>();
  for (const e of ledgerEntries) {
    balances.set(e.customerName, (balances.get(e.customerName) ?? 0) + e.debit - e.credit);
  }
  const totalOutstanding = [...balances.values()].reduce((s, v) => s + (v > 0 ? v : 0), 0);

  const cards = [
    { label: "Stock Raw Material", value: stockCount, href: "/stock-raw-material" },
    { label: "Cutting Stone", value: cuttingCount, href: "/cutting-stone" },
    { label: "Blocks", value: blockCount, href: "/blocks" },
    { label: "Vehicles", value: vehicleCount, href: "/vehicles" },
    { label: "Quotations", value: quotationCount, href: "/quotation" },
    { label: "Bills", value: billCount, href: "/bill/normal" },
    { label: "Total Expenses", value: `₹${(expenseAgg._sum.amount ?? 0).toFixed(2)}`, href: "/expenses" },
    { label: "Outstanding Dues", value: `₹${totalOutstanding.toFixed(2)}`, href: "/customer-ledger" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">{company?.name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-400 transition"
          >
            <div className="text-2xl font-semibold text-slate-900">{c.value}</div>
            <div className="text-sm text-slate-500 mt-1">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
