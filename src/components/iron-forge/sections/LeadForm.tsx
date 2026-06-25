import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { ArrowRight, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import confetti from "canvas-confetti";

import { leadFormSchema, type LeadFormInput, LEAD_GOALS, goalLabels } from "@/lib/leads.schema";
import { captureUtmParams, trackEvent } from "@/lib/analytics";
import { siteConfig, buildWhatsAppUrl } from "../../../../config/site";

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function fireConfetti() {
  const colors = ["#ff4d2e", "#ffb199", "#ffffff", "#ff7a4d"];
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors });
  setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.5 }, colors }), 250);
}

export default function LeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<null | { 
    id: string | null;
    name: string;
    email: string;
    phone: string;
    notes?: string;
  }>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { goal: "hipertrofia", website: "" },
    mode: "onBlur",
  });

  const phoneVal = watch("phone") ?? "";

  useEffect(() => {
    const utm = captureUtmParams();
    setValue("source", utm.source);
    if (utm.utm_source) setValue("utm_source", utm.utm_source);
    if (utm.utm_medium) setValue("utm_medium", utm.utm_medium);
    if (utm.utm_campaign) setValue("utm_campaign", utm.utm_campaign);
  }, [setValue]);

  const onSubmit = async (values: LeadFormInput) => {
    if (submitting) return;
    setServerError(null);
    setSubmitting(true);
    trackEvent("lead_submit", { goal: values.goal, source: values.source });

    try {
      const res = await fetch(siteConfig.leadsEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; leadId?: string; error?: string };
      if (!res.ok || !json.ok) {
        setServerError(json.error ?? "Não foi possível enviar. Tente novamente.");
        return;
      }
      setSuccess({ 
        id: json.leadId ?? null,
        name: values.name,
        email: values.email,
        phone: values.phone,
        notes: values.notes
      });
      trackEvent("lead_success", { leadId: json.leadId });
      fireConfetti();
    } catch (e) {
      console.error(e);
      setServerError("Falha de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <SuccessScreen 
        leadId={success.id} 
        leadName={success.name}
        leadEmail={success.email}
        leadPhone={success.phone}
        leadNotes={success.notes}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="relative grid gap-4"
      aria-label="Formulário de cadastro Iron Forge"
    >
      {/* Honeypot — escondido para humanos */}
      <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden>
        <label>
          Não preencha este campo
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </label>
      </div>

      <Field label="Nome completo" error={errors.name?.message}>
        <input
          {...register("name")}
          type="text"
          autoComplete="name"
          placeholder="Seu nome completo"
          className={inputCls(!!errors.name)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="WhatsApp" error={errors.phone?.message}>
          <input
            {...register("phone")}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            value={phoneVal ? maskPhone(phoneVal) : ""}
            onChange={(e) => setValue("phone", maskPhone(e.target.value), { shouldValidate: true })}
            className={inputCls(!!errors.phone)}
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            className={inputCls(!!errors.email)}
          />
        </Field>
      </div>

      <Field label="Seu objetivo" error={errors.goal?.message}>
        <div className="flex flex-wrap gap-2">
          {LEAD_GOALS.map((g) => {
            const checked = watch("goal") === g;
            return (
              <label
                key={g}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                  checked
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-white/15 text-white/70 hover:border-white/30"
                }`}
              >
                <input
                  type="radio"
                  value={g}
                  {...register("goal")}
                  className="sr-only"
                />
                {goalLabels[g]}
              </label>
            );
          })}
        </div>
      </Field>

      <details className="group rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm">
        <summary className="cursor-pointer list-none text-white/70 group-open:text-white">
          + Adicionar detalhes (opcional)
        </summary>
        <div className="mt-4 grid gap-4">
          <Field label="Melhor horário para contato" error={errors.bestContactTime?.message}>
            <input
              {...register("bestContactTime")}
              type="text"
              placeholder="Ex: dias úteis após as 18h"
              className={inputCls(false)}
            />
          </Field>
          <Field label="Observações" error={errors.notes?.message}>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Algo que devemos saber?"
              className={inputCls(false)}
            />
          </Field>
        </div>
      </details>

      {serverError && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {serverError}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={submitting}
        whileTap={{ scale: 0.98 }}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full gradient-ember px-7 py-3.5 text-sm font-semibold text-white ember-glow disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
          </>
        ) : (
          <>
            Garantir minha vaga <ArrowRight className="h-4 w-4" />
          </>
        )}
      </motion.button>
      <p className="text-center text-xs text-white/40">
        Seus dados são protegidos. Sem spam, sem ligações automáticas.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-left">
      <span className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</span>
      {children}
      {error && <span className="text-xs text-red-300">{error}</span>}
    </label>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-lg border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30",
    "outline-none transition-colors focus:border-primary focus:bg-white/[0.05]",
    hasError ? "border-red-500/50" : "border-white/10",
  ].join(" ");
}

function SuccessScreen({ 
  leadName,
}: { 
  leadId: string | null;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  leadNotes?: string;
}) {
  const whatsAppUrl = buildWhatsAppUrl(`Olá! Acabei de me cadastrar no site. Meu nome é ${leadName}. Gostaria de agendar minha aula experimental com a IA!`);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = whatsAppUrl;
    }, 2000);
    return () => clearTimeout(timer);
  }, [whatsAppUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid place-items-center gap-5 p-6 text-center"
    >
      <div className="grid h-16 w-16 place-items-center rounded-full gradient-ember ember-glow">
        <CheckCircle2 className="h-8 w-8 text-white" />
      </div>
      <div>
        <h3 className="font-display text-2xl tracking-tight text-white">Cadastro Recebido! 🎉</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/65">
          Olá <strong>{leadName}</strong>, seu cadastro foi registrado com sucesso.
        </p>
        <p className="mx-auto mt-4 max-w-sm text-xs text-primary animate-pulse font-semibold">
          Redirecionando para o WhatsApp em instantes para agendar seu treino com nossa IA...
        </p>
      </div>
      <a
        href={whatsAppUrl}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
      >
        <MessageCircle className="h-4 w-4" /> Falar com a IA no WhatsApp Agora
      </a>
    </motion.div>
  );
}
