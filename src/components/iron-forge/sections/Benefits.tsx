import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import { Dumbbell, Users, Heart, Zap, Shield, Sparkles } from "lucide-react";
import ScrollHighlightText from "./shared/ScrollHighlightText";

interface TiltCardProps {
  icon: any;
  title: string;
  body: string;
  delay: number;
}

function TiltCard({ icon: Icon, title, body, delay }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useMotionValue(50);
  const sy = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 14);
    rx.set(-(py - 0.5) * 14);
    sx.set(px * 100);
    sy.set(py * 100);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={{ opacity: 0, y: 26 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
      className="group relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-7 transition-colors hover:border-white/15"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: useTransform(
            [sx, sy] as any,
            ([x, y]: number[]) =>
              `radial-gradient(380px circle at ${x}% ${y}%, oklch(0.62 0.24 22 / 0.18), transparent 55%)`,
          ),
        }}
      />
      <div className="relative">
        <div className="mb-5 inline-grid h-12 w-12 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/30 text-primary transition-transform group-hover:scale-110 group-hover:rotate-[8deg]">
          <Icon className="h-5 w-5 animate-float-slow" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{body}</p>
      </div>
    </motion.div>
  );
}

export default function Benefits() {
  const items = [
    { icon: Dumbbell, title: "Equipamentos de elite", body: "Tecnologia Technogym & Hammer Strength. Manutenção diária." },
    { icon: Users, title: "Personal sob demanda", body: "Profissionais CREF disponíveis em todos os horários." },
    { icon: Heart, title: "Plano nutricional", body: "Nutricionista esportivo incluso no plano Forge." },
    { icon: Zap, title: "Treinos personalizados", body: "Programação adaptativa baseada em performance real." },
    { icon: Shield, title: "Comunidade premium", body: "Eventos, workshops e acesso a embaixadores Iron Forge." },
    { icon: Sparkles, title: "Recovery & wellness", body: "Sauna, banho frio, massagem e zona de mobilidade." },
  ];
  return (
    <section id="beneficios" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ScrollHighlightText
          kicker="Por que Iron Forge"
          text="Tudo o que uma academia comum não tem"
          highlightIndexStart={5}
        />
        <p className="mx-auto mt-6 max-w-xl text-center text-pretty text-white/60">
          Cada detalhe foi desenhado para acelerar seu resultado e levar sua experiência a outro nível.
        </p>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b, i) => (
            <TiltCard key={b.title} {...b} delay={i * 0.06} />
          ))}
        </div>
      </div>
    </section>
  );
}
