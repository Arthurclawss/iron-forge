import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { ArrowRight, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import confetti from "canvas-confetti";

import { leadFormSchema, type LeadFormInput, LEAD_GOALS, goalLabels } from "@/lib/leads.schema";
import { captureUtmParams, trackEvent } from "@/lib/analytics";
import { siteConfig, buildWhatsAppUrl } from "../../../config/site";

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
  const [success, setSuccess] = useState<null | { id: string | null }>(null);
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
      setSuccess({ id: json.leadId ?? null });
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
    return <SuccessScreen leadId={success.id} />;
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

function SuccessScreen({ leadId }: { leadId: string | null }) {
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsAppUrl = buildWhatsAppUrl();

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0) { // Excluir domingo
        days.push(d);
      }
    }
    return days;
  };

  const timeSlots = ["08:00", "10:00", "14:00", "16:00", "18:00", "20:00"];

  const handleBook = async () => {
    if (!leadId || !bookingDate || !bookingTime) return;
    setLoading(true);
    setError(null);

    const [hour, minute] = bookingTime.split(":");
    const finalDateTime = new Date(bookingDate);
    finalDateTime.setHours(Number(hour), Number(minute), 0, 0);

    try {
      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          bookingTime: finalDateTime.toISOString(),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Não foi possível realizar o agendamento.");
        return;
      }

      setBooked(true);
      trackEvent("whatsapp_click", { from: "booking_success" });
    } catch (e) {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getGoogleCalUrl = () => {
    if (!bookingDate || !bookingTime) return "#";
    const [hour, minute] = bookingTime.split(":");
    const start = new Date(bookingDate);
    start.setHours(Number(hour), Number(minute), 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1h treino

    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Aula+Experimental+Iron+Forge&dates=${fmt(start)}/${fmt(end)}&details=Sua+aula+experimental+na+Iron+Forge+Premium+Strength+Club.&location=Av.+Paulista,+1.800+-+Bela+Vista+-+São+Paulo`;
  };

  if (booked && bookingDate && bookingTime) {
    const dateFormatted = bookingDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });

    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid place-items-center gap-5 p-4 text-center"
      >
        <div className="grid h-16 w-16 place-items-center rounded-full gradient-ember ember-glow">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="font-display text-2xl tracking-tight text-white">Aula Agendada!</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-white/65">
            Seu treino foi agendado para <strong className="text-primary">{dateFormatted} às {bookingTime}</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-full mt-2">
          <a
            href={getGoogleCalUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 py-3 text-xs font-semibold text-white hover:bg-white/10"
          >
            🗓️ Adicionar ao Google Calendar
          </a>
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="h-4 w-4" /> Entrar no Grupo de Alunos
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-5 p-2 text-left"
    >
      <div className="text-center">
        <h3 className="font-display text-2xl tracking-tight text-white">Cadastro Recebido! 🎉</h3>
        <p className="mt-1 text-xs text-white/50">
          Garanta o seu horário reservando sua aula experimental abaixo:
        </p>
      </div>

      <div>
        <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-2">1. Selecione o dia</span>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {getNextDays().map((day) => {
            const isSelected = bookingDate?.toDateString() === day.toDateString();
            const label = day.toLocaleDateString("pt-BR", { weekday: "short" });
            const num = day.getDate();
            return (
              <button
                key={day.toDateString()}
                type="button"
                onClick={() => setBookingDate(day)}
                className={`rounded-lg border px-3 py-2 text-center transition-all shrink-0 min-w-[65px] ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 text-white/60 hover:border-white/20"
                }`}
              >
                <div className="text-[9px] uppercase tracking-widest">{label}</div>
                <div className="text-sm font-bold mt-0.5">{num}</div>
              </button>
            );
          })}
        </div>
      </div>

      {bookingDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-2">2. Selecione o Horário</span>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => {
              const isSelected = bookingTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setBookingTime(time)}
                  className={`rounded-lg border py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/10 text-white/60 hover:border-white/20"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      {leadId && bookingDate && bookingTime ? (
        <button
          type="button"
          onClick={handleBook}
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full gradient-ember py-3.5 text-xs font-semibold text-white hover:scale-[1.01] transition-transform disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Reservando...
            </>
          ) : (
            <>
              Confirmar Agendamento de Aula
            </>
          )}
        </button>
      ) : (
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 py-3 text-xs font-semibold text-white/70 hover:text-white"
        >
          Pular e Falar no WhatsApp
        </a>
      )}
    </motion.div>
  );
}