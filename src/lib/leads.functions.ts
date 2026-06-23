import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LEAD_STATUSES } from "@/lib/leads.schema";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error("Falha ao verificar permissão");
  if (!data) throw new Error("Acesso negado");
}

export const getLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days?: number } | undefined) =>
    z.object({ days: z.number().int().min(1).max(3650).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    let query = context.supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.days) {
      const since = new Date(Date.now() - data.days * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", since);
    }
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getLeadStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("leads")
      .select("status, source, created_at");
    if (error) throw new Error(error.message);
    const list = rows ?? [];
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const inMonth = list.filter((l: any) => new Date(l.created_at).getTime() >= monthAgo);
    const matriculados = list.filter((l: any) => l.status === "matriculado").length;
    const sourceCounts: Record<string, number> = {};
    list.forEach((l: any) => {
      const s = l.source || "direct";
      sourceCounts[s] = (sourceCounts[s] ?? 0) + 1;
    });
    const topSource =
      Object.entries(sourceCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—";
    return {
      total: list.length,
      month: inMonth.length,
      conversion: list.length ? (matriculados / list.length) * 100 : 0,
      matriculados,
      topSource,
      sourceCounts,
    };
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(LEAD_STATUSES),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("leads")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*, leads(name, email, phone)")
      .order("booking_time", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as any[];
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "agendado" | "confirmado" | "cancelado" | "concluido" }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["agendado", "confirmado", "cancelado", "concluido"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });