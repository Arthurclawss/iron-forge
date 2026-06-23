import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const schema = z.object({
  orderId: z.string().min(1, "Order ID obrigatório"),
  plan: z.enum(["spark", "forge", "iron"]),
  leadId: z.string().uuid().optional(),
});

const PAYPAL_PLANS: Record<string, number> = {
  spark: 149,
  forge: 289,
  iron: 499,
};

async function getPayPalAccessToken(clientId: string, clientSecret: string, mode: string) {
  const base = mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export const Route = createFileRoute("/api/public/paypal-capture-order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Payload inválido" }, { status: 400 });
        }

        const parsed = schema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Dados inválidos" }, { status: 422 });
        }

        const { orderId, plan, leadId } = parsed.data;
        const amount = PAYPAL_PLANS[plan];

        const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
        const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
        const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
          return Response.json({ ok: false, error: "PayPal não configurado." }, { status: 500 });
        }

        const accessToken = await getPayPalAccessToken(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE);
        if (!accessToken) {
          return Response.json({ ok: false, error: "Falha na autenticação com PayPal" }, { status: 500 });
        }

        const base = PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
        const captureRes = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const captureData = (await captureRes.json()) as {
          id?: string;
          status?: string;
          payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
          purchase_units?: Array<{
            payments?: {
              captures?: Array<{ id?: string; status?: string }>;
            };
          }>;
        };

        const captureStatus = captureData.status;
        const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        const payerEmail = captureData.payer?.email_address;
        const payerName = [
          captureData.payer?.name?.given_name,
          captureData.payer?.name?.surname,
        ]
          .filter(Boolean)
          .join(" ");

        console.log(`[paypal] Capture: ${captureId} | Status: ${captureStatus} | Payer: ${payerEmail}`);

        // Salva no Supabase (fire-and-forget)
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
        if (SUPABASE_URL && SUPABASE_KEY) {
          const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
            auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          });
          void supabase
            .from("payments" as never)
            .insert({
              lead_id: leadId || null,
              plan,
              amount,
              currency: "BRL",
              method: "paypal",
              status: captureStatus === "COMPLETED" ? "approved" : "declined",
              provider_id: captureId || orderId,
              payer_email: payerEmail || null,
              payer_name: payerName || null,
              metadata: captureData as never,
            } as never)
            .then(({ error }) => {
              if (error) console.error("[paypal] Falha ao salvar pagamento:", error);
            });
        }

        if (captureStatus === "COMPLETED") {
          return Response.json({ ok: true, captureId, payerEmail, payerName });
        }

        return Response.json(
          { ok: false, error: "Pagamento não aprovado", status: captureStatus },
          { status: 400 },
        );
      },
    },
  },
});
