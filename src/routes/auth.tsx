import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Acesso administrativo — Iron Forge" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setInfo("Conta criada. Faça login para continuar.");
        setMode("signin");
      }
    } catch (e: any) {
      setErr(e?.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[oklch(0.08_0.005_20)] px-4 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[oklch(0.12_0.005_20)] p-8">
        <h1 className="font-display text-2xl tracking-tight">
          {mode === "signin" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-white/55">Acesso administrativo Iron Forge</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="senha (mín. 8 caracteres)"
            className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {err && <p className="text-sm text-red-300">{err}</p>}
          {info && <p className="text-sm text-emerald-300">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full gradient-ember px-6 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "…" : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>
        <button
          onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="mt-4 w-full text-center text-xs text-white/50 hover:text-white"
        >
          {mode === "signin" ? "Criar nova conta" : "Já tenho conta"}
        </button>
      </div>
    </div>
  );
}