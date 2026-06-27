import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { leadFormSchema, normalizePhone } from "@/lib/leads.schema";
import { dispatchNotifications } from "@/lib/notifications";

// Rate limit em memória — 5 submissões por IP-hash a cada 10 minutos.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const rateBucket = new Map<string, number[]>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const hits = (rateBucket.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) return false;
  hits.push(now);
  rateBucket.set(key, hits);
  return true;
}

/** Gera UUID v4 usando a Web Crypto API (nativa no Cloudflare Workers e browsers). */
function generateUUID(): string {
  return globalThis.crypto.randomUUID();
}

/** Gera um hash SHA-256 do IP usando a Web Crypto API. */
async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export const Route = createFileRoute("/api/public/leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          console.warn("[leads] Falha ao parsear payload JSON.");
          return Response.json({ ok: false, error: "Payload inválido" }, { status: 400 });
        }

        const parsed = leadFormSchema.safeParse(body);
        if (!parsed.success) {
          console.warn("[leads] Erro de validação:", parsed.error.flatten());
          return Response.json(
            { ok: false, error: "Dados inválidos", issues: parsed.error.flatten() },
            { status: 422 },
          );
        }
        const data = parsed.data;

        // Honeypot
        if (data.website && data.website.length > 0) {
          console.warn(`[Anti-Spam] Honeypot ativado. Bot detectado. IP/Payload website: ${data.website}`);
          // Finja sucesso para não treinar bots.
          return Response.json({ ok: true, leadId: null }, { status: 200 });
        }

        const ip = getClientIp(request);
        const ipHash = await hashIp(ip);

        if (!checkRateLimit(ipHash)) {
          console.warn(`[Rate Limit] Limite de requisições atingido para o IP hash: ${ipHash}`);
          return Response.json(
            { ok: false, error: "Muitas tentativas. Aguarde alguns minutos." },
            { status: 429 },
          );
        }

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          console.error("[leads] Conexão com Supabase ausente nas variáveis de ambiente.");
          return Response.json(
            { ok: false, error: "Servidor indisponível" },
            { status: 500 },
          );
        }

        const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        const phoneNormalized = normalizePhone(data.phone);

        const leadId = generateUUID();

        const { error } = await supabase
          .from("leads")
          .insert({
            id: leadId,
            name: data.name,
            email: data.email,
            phone: phoneNormalized,
            goal: data.goal,
            notes: data.notes || null,
            best_contact_time: data.bestContactTime || null,
            source: data.source || "direct",
            utm_source: data.utm_source || null,
            utm_medium: data.utm_medium || null,
            utm_campaign: data.utm_campaign || null,
            ip_hash: ipHash,
          });

        if (error) {
          console.error("[leads] Falha ao inserir lead no Supabase:", error);
          return Response.json(
            { ok: false, error: "Não foi possível registrar agora" },
            { status: 500 },
          );
        }

        console.log(`[leads] Lead registrado: ID=${leadId}, Nome=${data.name}, Email=${data.email}`);

        // Dispara e-mail, alertas de Discord e Telegram
        try {
          await dispatchNotifications({
            id: leadId,
            name: data.name,
            email: data.email,
            phone: phoneNormalized,
            goal: data.goal,
            notes: data.notes,
            bestContactTime: data.bestContactTime,
            source: data.source,
            utm_source: data.utm_source,
            utm_medium: data.utm_medium,
            utm_campaign: data.utm_campaign,
          });
        } catch (e) {
          console.error("[leads] Falha no disparo de notificações:", e);
        }

        // Webhook para Google Sheets (opcional)
        const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
        if (sheetsUrl) {
          try {
            const sheetsRes = await fetch(sheetsUrl, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: leadId,
                created_at: new Date().toISOString(),
                name: data.name,
                email: data.email,
                phone: phoneNormalized,
                goal: data.goal,
                notes: data.notes ?? "",
                best_contact_time: data.bestContactTime ?? "",
                source: data.source ?? "direct",
                utm_source: data.utm_source ?? "",
                utm_medium: data.utm_medium ?? "",
                utm_campaign: data.utm_campaign ?? "",
              }),
            });
            console.log("[leads] Google Sheets webhook enviado. Status:", sheetsRes.status);
          } catch (e) {
            console.error("[leads] sheets webhook failed", e);
          }
        }

        return Response.json({ ok: true, leadId: leadId }, { status: 200 });
      },
    },
  },
});