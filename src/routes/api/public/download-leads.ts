import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/public/download-leads")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const secretToken = process.env.LEADS_TOKEN || "ironforge_crm_secret_2026";

        if (token !== secretToken) {
          return new Response("Acesso negado: Token invalido", { status: 403 });
        }

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_KEY) {
          return new Response("Erro de configuracao do servidor", { status: 500 });
        }

        const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        // 1. Busca os leads (tenta RPC seguro para contornar RLS do anon key, com fallback para select)
        let leadsRows: any[] = [];
        let leadsError: any = null;

        const rpcLeads = await supabase
          .rpc("get_leads_secure", { token_input: token || "" });

        if (rpcLeads.error) {
          console.warn("[download-leads] RPC get_leads_secure falhou, usando select de fallback:", rpcLeads.error.message);
          const fallbackLeads = await supabase
            .from("leads")
            .select("*")
            .order("created_at", { ascending: false });
          leadsRows = fallbackLeads.data ?? [];
          leadsError = fallbackLeads.error;
        } else {
          leadsRows = rpcLeads.data ?? [];
        }

        if (leadsError) {
          return new Response("Erro ao buscar leads: " + leadsError.message, { status: 500 });
        }

        // 2. Busca os agendamentos defensivamente (tenta RPC seguro, com fallback)
        const bookingsMap = new Map<string, any>();
        let bookingsRows: any[] = [];

        const rpcBookings = await supabase
          .rpc("get_bookings_secure", { token_input: token || "" });

        if (rpcBookings.error) {
          console.warn("[download-leads] RPC get_bookings_secure falhou, usando select de fallback:", rpcBookings.error.message);
          try {
            const fallbackBookings = await supabase
              .from("bookings")
              .select("lead_id, booking_time, status");
            if (!fallbackBookings.error && fallbackBookings.data) {
              bookingsRows = fallbackBookings.data;
            }
          } catch (e) {
            console.warn("[download-leads] Tabela bookings não acessível:", e);
          }
        } else {
          bookingsRows = rpcBookings.data ?? [];
        }

        bookingsRows.forEach((b: any) => {
          bookingsMap.set(b.lead_id, b);
        });

        const format = url.searchParams.get("format");
        if (format === "json") {
          const combined = (leadsRows ?? []).map((lead: any) => {
            const booking = bookingsMap.get(lead.id);
            return {
              ...lead,
              booking_time: booking ? booking.booking_time : null,
              booking_status: booking ? booking.status : null,
            };
          });

          return Response.json(combined, {
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          });
        }

        const list = leadsRows ?? [];
        const headers = [
          "ID",
          "Data de Cadastro",
          "Nome",
          "Email",
          "WhatsApp",
          "Objetivo",
          "Status",
          "Origem",
          "UTM Source",
          "UTM Medium",
          "UTM Campaign",
          "Horario para Contato",
          "Notas",
          "Agendamento"
        ];

        const escape = (v: unknown) => {
          if (v == null) return "";
          const s = String(v).replace(/"/g, '""');
          return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
        };

        const lines = [
          headers.join(","),
          ...list.map((r: any) => {
            const booking = bookingsMap.get(r.id);
            const bookingTimeStr = booking 
              ? new Date(booking.booking_time).toLocaleString("pt-BR")
              : "";
            return [
              r.id,
              new Date(r.created_at).toLocaleString("pt-BR"),
              r.name,
              r.email,
              r.phone,
              r.goal,
              r.status,
              r.source,
              r.utm_source,
              r.utm_medium,
              r.utm_campaign,
              r.best_contact_time,
              r.notes,
              bookingTimeStr
            ].map(escape).join(",");
          })
        ];

        // Adicionar BOM UTF-8 para garantir acentuacao correta no Excel
        const csvContent = "\uFEFF" + lines.join("\n");

        return new Response(csvContent, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": "attachment; filename=planilha_leads_iron_forge.csv"
          }
        });
      }
    }
  }
});
