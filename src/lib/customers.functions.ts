import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { customerFormSchema, normalizePhone, CUSTOMER_STATUSES } from "@/lib/customers.schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error("Falha ao verificar permissão");
  if (!data) throw new Error("Acesso negado");
}

// ---------------------------------------------------------------------------
// Customers — listagem
// ---------------------------------------------------------------------------

export const getCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { status?: string; search?: string } | undefined) =>
    z
      .object({
        status: z.enum(CUSTOMER_STATUSES).optional(),
        search: z.string().max(100).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    let query = context.supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (data.status) {
      query = query.eq("status", data.status);
    }

    if (data.search) {
      // Busca por nome, email ou telefone
      query = query.or(
        `name.ilike.%${data.search}%,email.ilike.%${data.search}%,phone.ilike.%${data.search}%`,
      );
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ---------------------------------------------------------------------------
// Customers — buscar um pelo ID
// ---------------------------------------------------------------------------

export const getCustomer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { data: row, error } = await context.supabase
      .from("customers")
      .select("*")
      .eq("id", data.id)
      .single();

    if (error) throw new Error(error.message);
    return row;
  });

// ---------------------------------------------------------------------------
// Customers — criar
// ---------------------------------------------------------------------------

export const createCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => customerFormSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const phoneNormalized = normalizePhone(data.phone);

    const { data: inserted, error } = await context.supabase
      .from("customers")
      .insert({
        name: data.name,
        email: data.email,
        phone: phoneNormalized,
        birth_date: data.birth_date || null,
        cpf: data.cpf || null,
        plan: data.plan,
        plan_start: data.plan_start || null,
        plan_end: data.plan_end || null,
        status: data.status,
        monthly_value: data.monthly_value ?? null,
        address_street: data.address_street || null,
        address_city: data.address_city || null,
        address_state: data.address_state || null,
        address_zip: data.address_zip || null,
        goal: data.goal ?? null,
        health_notes: data.health_notes || null,
        personal_trainer: data.personal_trainer || null,
        emergency_name: data.emergency_name || null,
        emergency_phone: data.emergency_phone || null,
        lead_id: data.lead_id || null,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { ok: true, customerId: inserted.id };
  });

// ---------------------------------------------------------------------------
// Customers — atualizar
// ---------------------------------------------------------------------------

export const updateCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid() })
      .merge(customerFormSchema.partial())
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { id, phone, ...rest } = data as any;

    const payload: Record<string, unknown> = { ...rest };
    if (phone) payload.phone = normalizePhone(phone);

    // Normalizar campos opcionais vazios → null
    const nullableFields = [
      "birth_date", "cpf", "plan_start", "plan_end", "monthly_value",
      "address_street", "address_city", "address_state", "address_zip",
      "goal", "health_notes", "personal_trainer", "emergency_name",
      "emergency_phone", "lead_id",
    ];
    for (const field of nullableFields) {
      if (field in payload && (payload[field] === "" || payload[field] === undefined)) {
        payload[field] = null;
      }
    }

    const { error } = await context.supabase
      .from("customers")
      .update(payload)
      .eq("id", id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Customers — excluir
// ---------------------------------------------------------------------------

export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { error } = await context.supabase
      .from("customers")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Customers — estatísticas
// ---------------------------------------------------------------------------

export const getCustomerStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { data: rows, error } = await context.supabase
      .from("customers")
      .select("status, plan, monthly_value, created_at");

    if (error) throw new Error(error.message);
    const list = rows ?? [];

    const ativos = list.filter((c: any) => c.status === "ativo");
    const mrr = ativos.reduce((sum: number, c: any) => sum + (c.monthly_value ?? 0), 0);

    const planCounts: Record<string, number> = {};
    list.forEach((c: any) => {
      planCounts[c.plan] = (planCounts[c.plan] ?? 0) + 1;
    });

    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const newThisMonth = list.filter(
      (c: any) => new Date(c.created_at).getTime() >= monthAgo,
    ).length;

    return {
      total: list.length,
      ativos: ativos.length,
      mrr,
      newThisMonth,
      planCounts,
    };
  });

// ---------------------------------------------------------------------------
// Lead Notes — listar notas de um lead
// ---------------------------------------------------------------------------

export const getLeadNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { leadId: string }) =>
    z.object({ leadId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { data: rows, error } = await context.supabase
      .from("lead_notes")
      .select("id, created_at, author_id, body")
      .eq("lead_id", data.leadId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ---------------------------------------------------------------------------
// Lead Notes — adicionar nota
// ---------------------------------------------------------------------------

export const addLeadNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { leadId: string; body: string }) =>
    z
      .object({
        leadId: z.string().uuid(),
        body: z.string().trim().min(1).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { error } = await context.supabase.from("lead_notes").insert({
      lead_id: data.leadId,
      author_id: context.userId,
      body: data.body,
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Lead Notes — deletar nota
// ---------------------------------------------------------------------------

export const deleteLeadNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { noteId: string }) =>
    z.object({ noteId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { error } = await context.supabase
      .from("lead_notes")
      .delete()
      .eq("id", data.noteId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Leads — exportar CSV
// ---------------------------------------------------------------------------

export const exportLeadsCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { data: rows, error } = await context.supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const list = rows ?? [];

    const headers = [
      "id", "created_at", "name", "email", "phone",
      "goal", "status", "source", "utm_source", "utm_medium",
      "utm_campaign", "best_contact_time", "notes",
    ];

    const escape = (v: unknown) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
    };

    const lines = [
      headers.join(","),
      ...list.map((r: any) => headers.map((h) => escape(r[h])).join(",")),
    ];

    return { csv: lines.join("\n"), count: list.length };
  });

// ---------------------------------------------------------------------------
// Leads — busca com filtro textual (complementa getLeads existente)
// ---------------------------------------------------------------------------

export const searchLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { q?: string; status?: string } | undefined) =>
    z
      .object({
        q: z.string().max(100).optional(),
        status: z
          .enum(["novo", "contatado", "interessado", "matriculado", "perdido"])
          .optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    let query = context.supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (data.status) query = query.eq("status", data.status);

    if (data.q) {
      query = query.or(
        `name.ilike.%${data.q}%,email.ilike.%${data.q}%,phone.ilike.%${data.q}%`,
      );
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
