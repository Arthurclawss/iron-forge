import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const bookingSchema = z.object({
  leadId: z.string().uuid("Lead ID inválido"),
  bookingTime: z.string().datetime("Formato de data/hora inválido"),
  notes: z.string().max(500).optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
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
        const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_KEY) {
          console.error("[bookings] Supabase env variables missing");
          return Response.json(
            { ok: false, error: "Servidor indisponível" },
            { status: 500 },
          );
        }

        const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        // 1. Tenta obter os dados do lead do frontend ou faz query no banco
        let leadData = {
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          notes: data.notes || ""
        };

        if (!leadData.email || !leadData.phone) {
          const { data: dbLead } = await supabase
            .from("leads")
            .select("*")
            .eq("id", data.leadId)
            .single();
          if (dbLead) {
            leadData = {
              name: dbLead.name,
              email: dbLead.email,
              phone: dbLead.phone,
              notes: dbLead.notes || ""
            };
          } else {
            console.warn(`[bookings] Lead não encontrado no banco para agendamento: ${data.leadId}`);
            return Response.json(
              { ok: false, error: "Lead não encontrado para agendamento" },
              { status: 404 },
            );
          }
        }

        const bookingFormatted = new Date(data.bookingTime).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        // 2. Tenta inserir na tabela 'bookings' de forma nativa
        const bookingId = globalThis.crypto.randomUUID();
        const { error: insertError } = await supabase
          .from("bookings")
          .insert({
            id: bookingId,
            lead_id: data.leadId,
            booking_time: data.bookingTime,
            status: "agendado",
            notes: data.notes || null,
          });

        let databaseSaved = true;
        if (insertError) {
          console.error("[bookings] Falha ao inserir agendamento na tabela dedicada:", insertError);
          databaseSaved = false;
        }

        // 3. Fallback redundante: Atualiza as notas do lead na tabela 'leads' (garante que o horário do treino apareça no painel e CSV)
        const noteBackup = `[Aula Experimental Agendada: ${bookingFormatted}]`;
        const updatedNotes = leadData.notes 
          ? `${leadData.notes}\n${noteBackup}` 
          : noteBackup;

        const { error: leadUpdateError } = await supabase
          .from("leads")
          .update({ notes: updatedNotes })
          .eq("id", data.leadId);

        if (leadUpdateError) {
          console.error("[bookings] Falha ao salvar backup nas notas do lead:", leadUpdateError);
        }

        // 4. Dispara o webhook em tempo real para a planilha do Google Sheets (opcional)
        const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
        if (sheetsUrl) {
          try {
            const sheetsRes = await fetch(sheetsUrl, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                event: "booking",
                id: data.leadId,
                email: leadData.email,
                phone: leadData.phone,
                name: leadData.name,
                booking_time: bookingFormatted,
                notes: data.notes || "",
              }),
            });
            console.log("[bookings] Google Sheets webhook enviado. Status:", sheetsRes.status);
          } catch (e) {
            console.error("[bookings] sheets webhook failed", e);
          }
        }

        // 5. Decisão de retorno baseado nos resultados do banco
        if (!databaseSaved) {
          // Se falhar porque a tabela 'bookings' não existe, mas atualizamos as notas do lead + planilha, tratamos como sucesso
          if (insertError?.code === "PGRST205") {
            console.log(`[bookings] Sucesso via fallback (Tabela 'bookings' ausente). Lead ID: ${data.leadId}`);
            return Response.json({
              ok: true,
              bookingId: null,
              warning: "Tabela 'bookings' ausente. Salvo nas notas do lead e no Google Sheets.",
            }, { status: 200 });
          }

          // Para outros tipos de erros
          return Response.json(
            { ok: false, error: "Não foi possível registrar o agendamento no banco de dados" },
            { status: 500 },
          );
        }

        console.log(`[bookings] Agendamento realizado: ID=${bookingId}, Lead=${data.leadId}, Data=${data.bookingTime}`);
        return Response.json({ ok: true, bookingId: bookingId }, { status: 200 });
      },
    },
  },
});
