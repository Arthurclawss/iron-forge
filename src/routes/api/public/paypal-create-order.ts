import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const PAYPAL_PLANS: Record<string, number> = {
  spark: 149,
  forge: 289,
  iron: 499,
};

const schema = z.object({
  plan: z.enum(["spark", "forge", "iron"]),
});

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

export const Route = createFileRoute("/api/public/paypal-create-order")({
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
          return Response.json({ ok: false, error: "Plano inválido" }, { status: 422 });
        }

        const { plan } = parsed.data;
        const amount = PAYPAL_PLANS[plan];

        const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
        const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
        const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
          console.error("[paypal] Credenciais PayPal ausentes nas variáveis de ambiente.");
          return Response.json(
            { ok: false, error: "PayPal não configurado. Adicione PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET." },
            { status: 500 },
          );
        }

        const accessToken = await getPayPalAccessToken(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE);
        if (!accessToken) {
          return Response.json({ ok: false, error: "Falha na autenticação com PayPal" }, { status: 500 });
        }

        const base = PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
        const orderRes = await fetch(`${base}/v2/checkout/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "BRL",
                  value: amount.toFixed(2),
                },
                description: `Iron Forge — Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)} (mensal)`,
              },
            ],
            application_context: {
              brand_name: "Iron Forge Academia",
              locale: "pt-BR",
              shipping_preference: "NO_SHIPPING",
              user_action: "PAY_NOW",
            },
          }),
        });

        const order = (await orderRes.json()) as { id?: string; status?: string };
        if (!order.id) {
          console.error("[paypal] Falha ao criar order:", order);
          return Response.json({ ok: false, error: "Falha ao criar ordem de pagamento" }, { status: 500 });
        }

        console.log(`[paypal] Order criado: ${order.id} | Plano: ${plan} | Valor: R$${amount}`);
        return Response.json({ ok: true, orderId: order.id });
      },
    },
  },
});
