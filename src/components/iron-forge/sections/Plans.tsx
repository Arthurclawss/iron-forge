import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { type PlanKey } from "../PaymentModal";
import ScrollHighlightText from "./shared/ScrollHighlightText";
import Reveal from "./shared/Reveal";

interface PlansProps {
  onSelectPlan: (plan: PlanKey) => void;
}

export default function Plans({ onSelectPlan }: PlansProps) {
  const plans = [
    {
      key: "spark" as PlanKey,
      name: "Spark",
      price: "99",
      tagline: "Comece a forjar.",
      features: ["Acesso à musculação", "Aulas em grupo", "Avaliação inicial"],
      cta: "Quero o Spark",
      featured: false,
    },
    {
      key: "forge" as PlanKey,
      name: "Forge",
      price: "199",
      tagline: "Nosso plano mais escolhido.",
      features: [
        "Acesso 24h",
        "Personal trainer 4×/mês",
        "Avaliação física trimestral",
        "Nutricionista incluso",
        "Recovery zone liberada",
      ],
      cta: "Assinar agora",
      featured: true,
    },
    {
      key: "iron" as PlanKey,
      name: "Iron",
      price: "299",
      tagline: "Resultado máximo.",
      features: [
        "Tudo do Forge",
        "Personal ilimitado",
        "Acompanhamento médico",
        "Programa nutricional 1:1",
        "Eventos VIP",
      ],
      cta: "Quero o Iron",
      featured: false,
    },
  ];
  return (
    <section id="planos" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ScrollHighlightText
          kicker="Planos"
          text="Escolha o seu caminho"
          highlightIndexStart={3}
        />
        <p className="mx-auto mt-6 max-w-xl text-center text-pretty text-white/60">
          Cancele quando quiser. Pague via PIX ou PayPal/Cartão.
        </p>

        {/* Payment methods badges */}
        <div className="mx-auto mt-4 flex items-center justify-center gap-3 flex-wrap">
          {["PIX", "PayPal", "Visa", "Mastercard", "Amex"].map((m) => (
            <span
              key={m}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/40"
            >
              {m}
            </span>
          ))}
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <article
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border p-8 transition-transform hover:-translate-y-1",
                  p.featured
                    ? "border-primary/40 bg-gradient-to-b from-primary/[0.08] to-transparent ember-glow"
                    : "border-white/10 bg-white/[0.02]",
                )}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-ember px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white shadow-lg">
                    ★ Mais escolhido
                  </span>
                )}
                <h3 className="font-display text-3xl tracking-tight">{p.name}</h3>
                <p className="mt-1 text-sm text-white/60">{p.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-sm text-white/40">R$</span>
                  <span className="font-display text-6xl tracking-tight">{p.price}</span>
                  <span className="text-sm text-white/40">/mês</span>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-white/75">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => onSelectPlan(p.key)}
                  className={cn(
                    "mt-auto pt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]",
                    p.featured
                      ? "gradient-ember text-white ember-glow"
                      : "border border-white/15 text-white hover:bg-white/5",
                  )}
                >
                  {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
