"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-graphite flex flex-col md:flex-row">
      {/* Left: identity panel */}
      <div className="relative hidden md:flex md:w-1/2 flex-col justify-between p-12 border-r border-grid overflow-hidden">
        <div className="absolute inset-0 bg-tick-row opacity-40" />
        <div className="relative">
          <div className="font-mono text-xs text-ink-dim tracking-wide">AP-PMS · CONTROL CONSOLE</div>
        </div>
        <div className="relative">
          <h1 className="font-display text-5xl font-semibold leading-[1.05] text-ink">
            Know what needs
            <br />
            attention. Today.
          </h1>
          <p className="mt-5 max-w-md text-ink-dim">
            One console for every project, task, deadline and invoice target
            across the portfolio — built for daily management control, not
            just record-keeping.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-6 font-mono text-xs text-ink-faint">
          <div>
            <div className="text-2xl font-display text-ink">03</div>
            active projects tracked
          </div>
          <div>
            <div className="text-2xl font-display text-ink">15</div>
            team members
          </div>
          <div>
            <div className="text-2xl font-display text-ink">24/7</div>
            deadline monitoring
          </div>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <div className="font-mono text-xs text-ink-dim tracking-wide mb-2">AP-PMS</div>
            <h1 className="font-display text-2xl font-semibold text-ink">Sign in to the console</h1>
          </div>
          <div className="hidden md:block mb-8">
            <h2 className="font-display text-xl font-semibold text-ink">Sign in</h2>
            <p className="text-sm text-ink-dim mt-1">Use the credentials issued by your DGM.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ap-pms.local"
                className="w-full rounded bg-slate border border-grid px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-signal-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded bg-slate border border-grid px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-signal-blue focus:outline-none"
              />
            </div>

            {error && (
              <div className="rounded border border-signal-red/30 bg-signal-red/10 px-3 py-2 text-sm text-signal-red">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-signal-blue text-graphite font-medium py-2.5 text-sm hover:bg-signal-blue/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-8 rounded border border-grid bg-slate/60 p-4 font-mono text-xs text-ink-faint leading-relaxed">
            Demo credentials (seeded)
            <br />
            DGM — dgm@ap-pms.local / Welcome@123
          </div>
        </div>
      </div>
    </div>
  );
}
