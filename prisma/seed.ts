import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const kmg = await prisma.company.upsert({
    where: { code: "KMG" },
    update: {},
    create: {
      code: "KMG",
      name: "KMG Stones",
      address:
        "Sy. No. 25/4, 25/6, Chikkagollahalli Village, Kundana Hobali, Devanahalli Taluk - 562110, Bangalore Rural Dist.",
      phone1: "9108318319",
      phone2: "9535988986",
      gstin: "29HCBPP8901D1ZG",
    },
  });

  const murdeswar = await prisma.company.upsert({
    where: { code: "MURDESWAR" },
    update: {},
    create: {
      code: "MURDESWAR",
      name: "Murdeshwara Stones",
    },
  });

  const adminPassword = "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const kmgAdminEmail = "admin@kmg.local";
  await prisma.user.upsert({
    where: { email: kmgAdminEmail },
    update: {},
    create: {
      name: "KMG Admin",
      email: kmgAdminEmail,
      passwordHash,
      role: "ADMIN",
      companyId: kmg.id,
    },
  });

  const murdeswarAdminEmail = "admin@murdeswar.local";
  await prisma.user.upsert({
    where: { email: murdeswarAdminEmail },
    update: {},
    create: {
      name: "Murdeswar Admin",
      email: murdeswarAdminEmail,
      passwordHash,
      role: "ADMIN",
      companyId: murdeswar.id,
    },
  });

  console.log("Seed complete.\n");
  console.log(`KMG login       -> /kmg/login       email: ${kmgAdminEmail}       password: ${adminPassword}`);
  console.log(`Murdeswar login -> /murdeswar/login email: ${murdeswarAdminEmail} password: ${adminPassword}`);
  console.log("\nLog in as each admin, then create that company's staff accounts from Staff & Users.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
