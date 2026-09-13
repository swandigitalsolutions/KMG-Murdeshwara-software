import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findCompanyNameSafe } from "@/lib/companyLookup";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const [kmgName, murdeswarName] = await Promise.all([
    findCompanyNameSafe("KMG", "KMG Stones"),
    findCompanyNameSafe("MURDESWAR", "Murdeshwara Stones"),
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Stone Business Panel</h1>
        <p className="text-sm text-slate-500 mb-10">Choose your business to sign in</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/kmg/login"
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition p-10"
          >
            <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
              KM
            </div>
            <div className="text-lg font-semibold text-slate-900">{kmgName}</div>
            <div className="text-sm text-slate-500 mt-1">Sign in to KMG panel</div>
          </Link>
          <Link
            href="/murdeswar/login"
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition p-10"
          >
            <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
              MU
            </div>
            <div className="text-lg font-semibold text-slate-900">{murdeswarName}</div>
            <div className="text-sm text-slate-500 mt-1">Sign in to Murdeshwara panel</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
