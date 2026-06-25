import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import SectionTitle from "./shared/SectionTitle";
import Reveal from "./shared/Reveal";

interface CounterProps {
  value: number;
  suffix?: string;
}

function Counter({ value, suffix = "" }: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  // Initialize with target value so crawlers see it in pure HTML
  const [n, setN] = useState(value);
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    if (!inView) {
      // If not in viewport yet, reset to 0 so it animates when scrolled to
      setN(0);
      return;
    }
    const start = performance.now();
    const dur = 1800;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setN(Math.floor(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setN(value);
        setDone(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <div
      ref={ref}
      className={cn(
        "font-display text-5xl tracking-tight tabular-nums transition-all md:text-6xl",
        done ? "ember-text-glow text-primary" : "text-white",
      )}
    >
      {n.toLocaleString("pt-BR")}
      <span className="text-primary">{suffix}</span>
    </div>
  );
}

interface BarProps {
  label: string;
  pct: number;
  delay?: number;
}

function Bar({ label, pct, delay = 0 }: BarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref}>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <span className="font-display text-primary">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : undefined}
          transition={{ duration: 1.3, delay, ease: [0.16, 1, 0.3, 1] }}
          className="h-full gradient-ember"
        />
      </div>
    </div>
  );
}

export default function Results() {
  const stats = [
    { value: 2400, label: "Atletas ativos", suffix: "+" },
    { value: 98, label: "Renovam o plano", suffix: "%" },
    { value: 12, label: "Treinadores CREF", suffix: "" },
    { value: 2800, label: "m² de arena", suffix: "" },
  ];
  const bars = [
    { label: "Aumento de força", pct: 92 },
    { label: "Ganho de massa magra", pct: 78 },
    { label: "Perda de gordura", pct: 84 },
    { label: "Adesão ao treino", pct: 96 },
  ];
  return (
    <section id="resultados" className="relative overflow-hidden border-y border-white/5 bg-[oklch(0.11_0.005_20)] py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionTitle
          kicker="Resultados reais"
          title={<>Números que <span className="gradient-text-ember">não mentem</span></>}
        />

        <div className="mt-16 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
                <Counter value={s.value} suffix={s.suffix} />
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/50">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-8 rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-3xl tracking-tight">Performance média após 90 dias</h3>
            <p className="mt-3 text-sm text-white/60">
              Medições reais de alunos avaliados pela nossa equipe de fisiologia esportiva.
            </p>
          </div>
          <div className="space-y-5">
            {bars.map((b, i) => (
              <Bar key={b.label} {...b} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
