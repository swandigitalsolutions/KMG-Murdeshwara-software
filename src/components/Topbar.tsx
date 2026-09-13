import { logoutAction } from "@/app/(dashboard)/actions";

export default function Topbar({
  userName,
  role,
  companyName,
}: {
  userName: string;
  role: "ADMIN" | "STAFF";
  companyName: string;
}) {
  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white flex items-center justify-between px-6 print:hidden">
      <span className="text-sm font-medium text-slate-800">{companyName}</span>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium text-slate-800">{userName}</div>
          <div className="text-xs text-slate-500">{role === "ADMIN" ? "Admin" : "Staff"}</div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
