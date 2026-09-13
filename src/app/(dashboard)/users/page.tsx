import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createUser, toggleUserActive, updateCompanyDetails } from "./actions";

export default async function UsersPage() {
  const session = await requireAdmin();

  const [users, company] = await Promise.all([
    prisma.user.findMany({ where: { companyId: session.companyId }, orderBy: { createdAt: "asc" } }),
    prisma.company.findUnique({ where: { id: session.companyId } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 mb-4">Staff &amp; Users</h1>

        <form action={createUser} className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" name="name" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" name="email" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" name="password" required minLength={6} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select name="role" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="sm:col-span-4">
            <button type="submit" className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition">
              Create Account
            </button>
          </div>
        </form>

        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5">{u.name}</td>
                  <td className="px-4 py-2.5">{u.email}</td>
                  <td className="px-4 py-2.5">{u.role}</td>
                  <td className="px-4 py-2.5">
                    <span className={u.active ? "text-emerald-600" : "text-slate-400"}>
                      {u.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <form action={toggleUserActive.bind(null, u.id, !u.active)}>
                      <button type="submit" className="text-sm text-slate-600 hover:text-slate-900">
                        {u.active ? "Disable" : "Enable"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {company && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Profile</h2>
          <p className="text-sm text-slate-500 mb-4">This information appears on printed quotations and bills.</p>
          <form action={updateCompanyDetails} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
              <input type="text" name="name" defaultValue={company.name} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea name="address" rows={2} defaultValue={company.address ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone 1</label>
                <input type="text" name="phone1" defaultValue={company.phone1 ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone 2</label>
                <input type="text" name="phone2" defaultValue={company.phone2 ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
              <input type="text" name="gstin" defaultValue={company.gstin ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 transition">
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
