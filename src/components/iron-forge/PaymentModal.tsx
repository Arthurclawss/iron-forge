import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Copy,
  CheckCircle2,
  CreditCard,
  QrCode,
  Loader2,
  ArrowRight,
  Shield,
  Zap,
  Lock,
} from "lucide-react";
import QRCode from "react-qr-code";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { generatePixPayload } from "@/lib/pix";
import { siteConfig } from "../../../config/site";

const PLAN_LABELS: Record<string, string> = {
  spark: "Spark",
  forge: "Forge",
  iron: "Iron",
};

const PLAN_PRICES: Record<string, number> = {
  spark: 149,
  forge: 289,
  iron: 499,
};

export type PlanKey = "spark" | "forge" | "iron";

interface PaymentSectionProps {
  plan: PlanKey | null;
  onClose: () => void;
}

export default function PaymentModal({ plan, onClose }: PaymentSectionProps) {
  const [tab, setTab] = useState<"pix" | "paypal">("pix");

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!plan) return null;

  const price = PLAN_PRICES[plan];
  const label = PLAN_LABELS[plan];

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[oklch(0.09_0.005_20)] shadow-2xl"
        >
          {/* Header */}
          <div className="relative flex items-start justify-between border-b border-white/8 bg-white/[0.02] px-7 py-6">
            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] text-primary">
                <Zap className="h-2.5 w-2.5" /> Plano {label}
              </div>
              <h2 className="font-display text-2xl tracking-tight text-white">
                Finalizar matrícula
              </h2>
              <p className="mt-0.5 text-sm text-white/50">
                R${" "}
                <span className="font-display text-xl font-bold text-white">{price}</span>
                /mês · Cancele quando quiser
              </p>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-white/60 hover:border-white/20 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/8 bg-white/[0.01]">
            {(["pix", "paypal"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? "border-b-2 border-primary text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {t === "pix" ? (
                  <>
                    <QrCode className="h-3.5 w-3.5" /> PIX (instantâneo)
                  </>
                ) : (
                  <>
                    <CreditCard className="h-3.5 w-3.5" /> PayPal / Cartão
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="px-7 py-7">
            {tab === "pix" ? (
              <PixTab price={price} plan={plan} />
            ) : (
              <PayPalTab price={price} plan={plan} />
            )}
          </div>

          {/* Footer trust */}
          <div className="flex items-center justify-center gap-3 border-t border-white/5 px-7 py-4 text-[11px] text-white/30">
            <Lock className="h-3 w-3 shrink-0" />
            Pagamento 100% seguro · Dados criptografados
            <Shield className="h-3 w-3 shrink-0" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ────────── PIX Tab ────────── */
function PixTab({ price, plan }: { price: number; plan: PlanKey }) {
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"qr" | "success">("qr");

  const pixPayload = generatePixPayload({
    key: siteConfig.pix.key,
    name: siteConfig.pix.name,
    city: siteConfig.pix.city,
    amount: price,
    description: `Iron Forge - Plano ${PLAN_LABELS[plan]}`,
    txId: `IF${plan.toUpperCase()}${Date.now().toString().slice(-8)}`,
  });

  const copyKey = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.pix.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  }, []);

  const copyPayload = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  }, [pixPayload]);

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid place-items-center gap-4 py-4 text-center"
      >
        <div className="grid h-16 w-16 place-items-center rounded-full gradient-ember ember-glow">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl text-white">Pagamento registrado!</h3>
          <p className="mt-2 text-sm text-white/60">
            Após confirmação do PIX, nossa equipe entrará em contato em até 1 hora.
          </p>
        </div>
        <a
          href={`https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(`Olá! Realizei o pagamento PIX do Plano ${PLAN_LABELS[plan]} (R$${price}). Aguardo confirmação!`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-black"
        >
          Confirmar via WhatsApp <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-white/60">
        Escaneie o QR Code ou copie o código PIX e pague direto pelo seu banco.
      </p>

      {/* QR Code */}
      <div className="mx-auto w-fit rounded-2xl bg-white p-4 shadow-xl shadow-white/5">
        <QRCode
          value={pixPayload}
          size={190}
          level="M"
          style={{ display: "block" }}
        />
      </div>

      {/* Valor */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Valor</p>
        <p className="font-display text-3xl text-white">
          R$ {price.toLocaleString("pt-BR")}<span className="text-sm text-white/40">/mês</span>
        </p>
      </div>

      {/* Chave PIX copiável */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/40">
          Chave PIX ({siteConfig.pix.keyType})
        </p>
        <button
          onClick={copyKey}
          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80 transition-colors hover:border-primary/30 hover:bg-primary/5"
        >
          <span className="font-mono">{siteConfig.pix.key}</span>
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-white/40" />
          )}
        </button>
      </div>

      {/* Copiar código completo */}
      <button
        onClick={copyPayload}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs text-white/50 transition-colors hover:border-white/20 hover:text-white/70"
      >
        <Copy className="h-3 w-3" />
        {copied ? "Copiado!" : "Copiar código Pix Copia e Cola"}
      </button>

      {/* Instructions */}
      <ol className="space-y-2 rounded-xl border border-white/8 bg-white/[0.02] p-4 text-xs text-white/50">
        {[
          "Abra o app do seu banco",
          "Escolha pagar com PIX",
          "Escaneie o QR Code ou cole a chave",
          "Confirme o pagamento de R$ " + price,
        ].map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <button
        onClick={() => setStep("success")}
        className="w-full rounded-full gradient-ember py-3 text-sm font-semibold text-white ember-glow hover:opacity-90 transition-opacity"
      >
        Já realizei o pagamento ✓
      </button>
    </div>
  );
}

/* ────────── PayPal Tab ────────── */
function PayPalTab({ price, plan }: { price: number; plan: PlanKey }) {
  const [paypalReady, setPaypalReady] = useState(false);
  const [successData, setSuccessData] = useState<{ payerName?: string; payerEmail?: string } | null>(null);
  const [paypalError, setPaypalError] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "";

  const createOrder = async () => {
    setPaypalError(null);
    const res = await fetch("/api/public/paypal-create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = (await res.json()) as { ok: boolean; orderId?: string; error?: string };
    if (!data.ok || !data.orderId) {
      throw new Error(data.error || "Falha ao criar ordem");
    }
    return data.orderId;
  };

  const onApprove = async (data: { orderID: string }) => {
    const res = await fetch("/api/public/paypal-capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: data.orderID, plan }),
    });
    const result = (await res.json()) as { ok: boolean; payerName?: string; payerEmail?: string; error?: string };
    if (result.ok) {
      setSuccessData({ payerName: result.payerName, payerEmail: result.payerEmail });
    } else {
      setPaypalError(result.error || "Erro ao confirmar pagamento");
    }
  };

  if (successData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid place-items-center gap-4 py-4 text-center"
      >
        <div className="grid h-16 w-16 place-items-center rounded-full gradient-ember ember-glow">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl text-white">Pagamento aprovado! 🎉</h3>
          {successData.payerName && (
            <p className="mt-1 text-sm text-white/60">
              Obrigado, <strong className="text-white">{successData.payerName}</strong>
            </p>
          )}
          <p className="mt-2 text-sm text-white/60">
            Nossa equipe entrará em contato para ativar seu plano.
          </p>
        </div>
        <a
          href={`https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(`Olá! Realizei o pagamento PayPal do Plano ${PLAN_LABELS[plan]} (R$${price}). Nome: ${successData.payerName || ""}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-black"
        >
          Falar com a equipe <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </motion.div>
    );
  }

  if (!clientId) {
    return (
      <div className="space-y-4 py-2">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center text-sm text-amber-300/80">
          <p className="font-semibold text-amber-200">⚙️ PayPal em configuração</p>
          <p className="mt-1 text-xs text-amber-300/60">
            Adicione sua chave VITE_PAYPAL_CLIENT_ID no arquivo .env para ativar pagamentos via PayPal.
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-white/8 bg-white/[0.02] p-4 text-xs text-white/50">
          <p className="font-semibold text-white/70">Como configurar o PayPal:</p>
          <ol className="list-decimal space-y-1.5 pl-4">
            <li>Acesse <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">developer.paypal.com</a></li>
            <li>Faça login com sua conta PayPal</li>
            <li>Vá em <strong>Apps &amp; Credentials</strong></li>
            <li>Crie um App e copie o <strong>Client ID</strong></li>
            <li>Adicione no <code className="text-primary">.env</code>:<br />
              <code className="text-green-400">VITE_PAYPAL_CLIENT_ID=seu_client_id</code><br />
              <code className="text-green-400">PAYPAL_CLIENT_SECRET=seu_secret</code>
            </li>
          </ol>
        </div>

        <p className="text-center text-xs text-white/30">
          Use PIX para pagamentos imediatos enquanto configura o PayPal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-white/60">
        Pague com sua conta PayPal ou cartão de crédito/débito.
      </p>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Total</p>
        <p className="font-display text-3xl text-white">
          R$ {price}<span className="text-sm text-white/40">/mês</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white p-3">
        {!paypalReady && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando PayPal...
          </div>
        )}
        <PayPalScriptProvider
          options={{
            clientId,
            currency: "BRL",
            locale: "pt_BR",
            intent: "capture",
          }}
        >
          <PayPalButtons
            style={{ layout: "vertical", label: "pay", shape: "pill", height: 48 }}
            onInit={() => setPaypalReady(true)}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err) => {
              console.error("[paypal] Error:", err);
              setPaypalError("Ocorreu um erro no pagamento. Tente novamente.");
            }}
          />
        </PayPalScriptProvider>
      </div>

      {paypalError && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">
          {paypalError}
        </p>
      )}

      <p className="text-center text-xs text-white/30">
        Aceita Visa, Mastercard, Amex, Elo · Parcelamento disponível no PayPal
      </p>
    </div>
  );
}
