import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const bookingSchema = z.object({
  leadId: z.string().uuid("Lead ID inválido"),
  bookingTime: z.string().datetime("Formato de data/hora inválido"),
  notes: z.string().max(500).optional(),
});

export const Route = createFileRoute("/api/public/bookings")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Payload inválido" }, { status: 400 });
        }

        const parsed = bookingSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: "Dados inválidos", issues: parsed.error.flatten() },
            { status: 422 },
          );
        }
        const data = parsed.data;

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          console.error("[bookings] Supabase env variables missing");
          return Response.json(
            { ok: false, error: "Servidor indisponível" },
            { status: 500 },
          );
        }

        const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        // Verifica se o lead existe
        const { data: lead, error: leadError } = await supabase
          .from("leads")
          .select("id, name, phone")
          .eq("id", data.leadId)
          .single();

        if (leadError || !lead) {
          console.warn(`[bookings] Lead não encontrado: ${data.leadId}`);
          return Response.json(
            { ok: false, error: "Lead não encontrado para agendamento" },
            { status: 404 },
          );
        }

        // Insere o agendamento
        const { data: inserted, error: insertError } = await supabase
          .from("bookings")
          .insert({
            lead_id: data.leadId,
            booking_time: data.bookingTime,
            status: "agendado",
            notes: data.notes || null,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("[bookings] Falha ao inserir agendamento:", insertError);
          return Response.json(
            { ok: false, error: "Não foi possível registrar o agendamento" },
            { status: 500 },
          );
        }

        console.log(`[bookings] Agendamento realizado: ID=${inserted.id}, Lead=${lead.name}, Data=${data.bookingTime}`);

        return Response.json({ ok: true, bookingId: inserted.id }, { status: 200 });
      },
    },
  },
});
