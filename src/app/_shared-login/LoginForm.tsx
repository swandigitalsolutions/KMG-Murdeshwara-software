"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginForm({
  companyCode,
  companyLabel,
}: {
  companyCode: "KMG" | "MURDESWAR";
  companyLabel: string;
}) {
  const boundAction = loginAction.bind(null, companyCode);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
            {companyLabel.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{companyLabel}</h1>
          <p className="text-sm text-slate-500 mt-1">Business Panel Login</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 disabled:opacity-60 transition"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <a href="/" className="block text-center text-xs text-slate-400 mt-5 hover:text-slate-600">
          ← Not {companyLabel}? Switch panel
        </a>
      </div>
    </div>
  );
}
