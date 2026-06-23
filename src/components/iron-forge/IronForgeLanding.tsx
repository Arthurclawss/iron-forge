import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import beforeImg from "@/assets/before.jpg";
import afterImg from "@/assets/after.jpg";
import t1 from "@/assets/t1.jpg";
import t2 from "@/assets/t2.jpg";
import t3 from "@/assets/t3.jpg";
import LeadFormSection from "./LeadFormSection";
import FitnessCalculator from "./FitnessCalculator";
import { siteConfig, buildWhatsAppUrl } from "../../../config/site";
import { trackEvent } from "@/lib/analytics";

/* ═══════════════════════════════════════════════════════════
   Iron Forge — premium landing
   ═══════════════════════════════════════════════════════════ */

export default function IronForgeLanding() {
  const prefersReducedMotion = useReducedMotion() ?? false;

  // ── Lenis smooth scroll (lazy, client only) ────────────────
  useEffect(() => {
    if (prefersReducedMotion) return;
    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [prefersReducedMotion]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <ScrollProgress />
      <UrgencyBar />
      <Nav />
      <main>
        <Hero prefersReducedMotion={prefersReducedMotion} />
        <TrustBadges />
        <Benefits />
        <Gallery />
        <Results />
        <Transformation />
        <FitnessCalculator />
        <Plans />
        <Testimonials />
        <LeadFormSection />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppFloat />
      <ExitIntentPopup />
      <SocialProofToast />
      <FloatingCTA />
    </div>
  );
}

/* ───────────────────── Scroll progress ───────────────────── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.2 });
  return (
    <motion.div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[80] h-[2px] origin-left gradient-ember"
      style={{ scaleX }}
    />
  );
}

/* ───────────────────── Urgency bar ───────────────────── */
function UrgencyBar() {
  const [spots, setSpots] = useState(17);
  useEffect(() => {
    const id = window.setInterval(() => {
      setSpots((s) => (s > 12 ? s - 1 : s));
    }, 18000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="relative z-[60] overflow-hidden border-b border-white/10 bg-[oklch(0.18_0.06_22)] text-[13px]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-white/90">
        <Flame className="h-3.5 w-3.5 text-primary" />
        <span>
          Apenas{" "}
          <strong className="text-primary tabular-nums">{spots} vagas</strong> disponíveis este mês ·
          <span className="hidden sm:inline"> Bloqueio de preço por 12 meses</span>
        </span>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-primary/30 to-transparent" />
    </div>
  );
}

/* ───────────────────── Nav ───────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#beneficios", label: "Benefícios" },
    { href: "#estrutura", label: "Estrutura" },
    { href: "#resultados", label: "Resultados" },
    { href: "#planos", label: "Planos" },
    { href: "#depoimentos", label: "Depoimentos" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled ? "backdrop-blur-xl bg-background/70 border-b border-white/5" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="grid h-9 w-9 place-items-center rounded-lg gradient-ember ember-glow transition-transform group-hover:scale-105">
            <Flame className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl tracking-[0.12em]">
            IRON <span className="text-primary">FORGE</span>
          </span>
        </a>

        <nav aria-label="Principal" className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-sm text-white/70 transition-colors hover:text-white"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <a
          href="#cadastro"
          className="hidden md:inline-flex items-center gap-2 rounded-full gradient-ember px-5 py-2.5 text-sm font-semibold text-white ember-glow transition-transform hover:scale-[1.03]"
        >
          Matricule-se
          <ArrowRight className="h-3.5 w-3.5" />
        </a>

        <button
          className="md:hidden grid h-10 w-10 place-items-center rounded-lg border border-white/10"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-white/80 hover:bg-white/5"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#cadastro"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full gradient-ember px-5 py-3 text-sm font-semibold text-white"
              >
                Matricule-se <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ───────────────────── Hero ───────────────────── */
function Hero({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const smy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });

  // parallax outputs (different speeds)
  const bgX = useTransform(smx, [-1, 1], [25, -25]);
  const bgY = useTransform(smy, [-1, 1], [15, -15]);
  const titleX = useTransform(smx, [-1, 1], [-12, 12]);
  const titleY = useTransform(smy, [-1, 1], [-8, 8]);
  const glowX = useTransform(smx, [-1, 1], [60, -60]);
  const glowY = useTransform(smy, [-1, 1], [40, -40]);
  const ctaX = useTransform(smx, [-1, 1], [-6, 6]);

  // spotlight position (px-based for radial-gradient)
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(35);
  const ssx = useSpring(spotX, { stiffness: 80, damping: 22 });
  const ssy = useSpring(spotY, { stiffness: 80, damping: 22 });
  const spotBg = useTransform(
    [ssx, ssy] as never,
    ([x, y]: number[]) =>
      `radial-gradient(700px 500px at ${x}% ${y}%, oklch(0.62 0.24 22 / 0.35), transparent 60%)`,
  );

  // hero reveal on scroll
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const handler = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      mx.set(x * 2 - 1);
      my.set(y * 2 - 1);
      spotX.set(x * 100);
      spotY.set(y * 100);
    };
    el.addEventListener("pointermove", handler);
    return () => el.removeEventListener("pointermove", handler);
  }, [mx, my, spotX, spotY, prefersReducedMotion]);

  const words = ["FORJE", "SEU", "FÍSICO", "EXTRAORDINÁRIO"];

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate min-h-[100svh] overflow-hidden"
    >
      {/* Background video with reveal + parallax */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 bg-background"
        style={{ x: bgX, y: bgY, scale: 1.12 }}
        initial={prefersReducedMotion ? false : { scale: 1.3, opacity: 0 }}
        animate={{ scale: 1.12, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
          poster={heroImg}
        >
          <source
            src="https://player.vimeo.com/external/435674703.sd.mp4?s=7fdfafb69e38e6e580e55b4e3e3b3b44b80b7e28&profile_id=165&oauth2_token_id=57447761"
            type="video/mp4"
          />
          <img src={heroImg} className="h-full w-full object-cover" alt="" />
        </video>
      </motion.div>

      {/* grid overlay */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] mix-blend-screen"
        style={{ x: titleX, y: titleY, scale: 1.05 }}
      >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </motion.div>

      {/* gradient washes (overlay escuro para leitura perfeita) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-black/65 backdrop-blur-[2px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/20 via-background/50 to-background" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen"
        style={{ background: spotBg }}
      />

      {/* moving light rays */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[140%] w-[800px] -translate-x-1/2 opacity-40 mix-blend-screen"
        style={{ x: glowX, y: glowY, background: "conic-gradient(from 200deg at 50% 0%, transparent 0deg, oklch(0.62 0.24 22 / 0.5) 30deg, transparent 80deg)" }}
      />

      {/* embers */}
      {!prefersReducedMotion && <Embers />}

      {/* content */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-5 pt-20 pb-24 text-center md:px-8"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-white/70 backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Premium Strength Club · São Paulo
        </motion.div>

        <motion.h1
          className="font-display text-[clamp(3rem,9vw,8rem)] leading-[0.9] tracking-tight text-balance"
          style={{ x: titleX, y: titleY }}
        >
          {words.map((w, i) => (
            <motion.span
              key={w}
              className="mr-4 inline-block"
              initial={prefersReducedMotion ? false : { y: 80, opacity: 0, filter: "blur(20px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{
                delay: 0.4 + i * 0.12,
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {i === 3 ? (
                <span className="gradient-text-ember ember-text-glow">{w}</span>
              ) : (
                <span className="text-white">{w}</span>
              )}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7 }}
          className="mt-8 max-w-2xl text-pretty text-base text-white/65 md:text-lg"
        >
          A academia mais premium do Brasil. Treinos personalizados, equipamentos de última geração e
          uma comunidade que não aceita medianidade.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="mt-10 flex flex-col items-center gap-4"
          style={{ x: ctaX }}
        >
          <a
            href="#cadastro"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full gradient-ember px-8 py-4 text-base font-semibold text-white ember-glow animate-pulse-glow"
          >
            <span className="relative z-10">Começar agora — 7 dias grátis</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
            <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/30 blur-md" style={{ animation: "shimmer-sweep 3.2s ease-in-out infinite" }} />
          </a>

          <div className="flex items-center gap-3 text-xs text-white/60">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
              ))}
            </div>
            <span>
              <strong className="text-white">4.9/5</strong> · baseado em{" "}
              <strong className="text-white">2.400+</strong> alunos
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/40"
      >
        Role para descobrir
      </motion.div>
    </section>
  );
}

function Embers() {
  const dots = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden">
      {dots.map((i) => {
        const left = (i * 47) % 100;
        const delay = (i % 9) * 0.9;
        const dur = 9 + (i % 6) * 2;
        const size = 2 + (i % 4);
        const drift = ((i % 7) - 3) * 30;
        return (
          <span
            key={i}
            className="absolute bottom-0 rounded-full bg-primary"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              boxShadow: "0 0 12px oklch(0.62 0.24 22 / 0.9), 0 0 24px oklch(0.62 0.24 22 / 0.4)",
              animation: `ember-rise ${dur}s linear ${delay}s infinite`,
              ["--drift" as never]: `${drift}px`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ───────────────────── Trust badges ───────────────────── */
function TrustBadges() {
  const items = [
    { icon: Star, label: "Google Reviews", sub: "4.9 · 1.2k avaliações" },
    { icon: Award, label: "Personais Certificados", sub: "CREF · ISAK · NSCA" },
    { icon: ShieldCheck, label: "Equipamentos Premium", sub: "Technogym · Hammer" },
    { icon: Clock, label: "Atendimento 24h", sub: "Suporte ao aluno" },
  ];
  return (
    <section className="relative border-y border-white/5 bg-[oklch(0.14_0.005_20)]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
        {items.map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 bg-[oklch(0.14_0.005_20)] px-4 py-7 text-center"
          >
            <Icon className="h-5 w-5 text-primary" />
            <div className="text-sm font-semibold text-white">{label}</div>
            <div className="text-[11px] text-white/50">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────── Section title ───────────────────── */
function SectionTitle({ kicker, title, subtitle }: { kicker: string; title: React.ReactNode; subtitle?: string }) {
  return (
    <Reveal>
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-primary">
          <span className="h-1 w-1 rounded-full bg-primary" />
          {kicker}
        </div>
        <h2 className="font-display text-balance text-[clamp(2rem,5vw,4rem)] leading-[1] tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="mx-auto mt-5 max-w-xl text-pretty text-white/60">{subtitle}</p>}
      </div>
    </Reveal>
  );
}

/* Reveal helper */
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────── Benefits with 3D tilt ───────────────────── */
function Benefits() {
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
        <SectionTitle
          kicker="Por que Iron Forge"
          title={<>Tudo o que uma academia <span className="gradient-text-ember">comum não tem</span></>}
          subtitle="Cada detalhe foi desenhado para acelerar seu resultado e levar sua experiência a outro nível."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b, i) => (
            <TiltCard key={b.title} {...b} delay={i * 0.06} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TiltCard({ icon: Icon, title, body, delay }: { icon: typeof Dumbbell; title: string; body: string; delay: number }) {
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
            [sx, sy] as never,
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

/* ───────────────────── Gallery (parallax) ───────────────────── */
function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const y3 = useTransform(scrollYProgress, [0, 1], [40, -90]);
  const y4 = useTransform(scrollYProgress, [0, 1], [90, -40]);

  const items = [
    { src: gallery1, y: y1, title: "Sala de musculação", h: "tall" as const },
    { src: gallery2, y: y2, title: "Funcional & Cross", h: "short" as const },
    { src: gallery3, y: y3, title: "Powerlifting platform", h: "short" as const },
    { src: gallery4, y: y4, title: "Performance zone", h: "tall" as const },
  ];

  return (
    <section id="estrutura" ref={ref} className="relative py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionTitle
          kicker="Estrutura"
          title={<>Uma arena <span className="gradient-text-ember">cinematográfica</span></>}
          subtitle="2.800 m² projetados por arquitetos especializados em design de performance."
        />
      </div>
      <div className="mx-auto mt-16 grid max-w-7xl grid-cols-2 gap-4 px-5 md:grid-cols-4 md:gap-6 md:px-8">
        {items.map((it, i) => (
          <motion.figure
            key={i}
            style={{ y: it.y }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5",
              it.h === "tall" ? "aspect-[3/4]" : "aspect-[4/5] md:mt-12",
            )}
          >
            <img
              src={it.src}
              alt={it.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-x-1/2 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ animation: "shimmer-sweep 1.6s ease-out" }}
            />
            <figcaption className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.25em] text-white/80">
              {it.title}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────── Results / counters ───────────────────── */
function Results() {
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

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!inView) return;
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

function Bar({ label, pct, delay = 0 }: { label: string; pct: number; delay?: number }) {
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

/* ───────────────────── Transformation (before/after) ───────────────────── */
function Transformation() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(55);
  const dragging = useRef(false);

  useEffect(() => {
    const up = () => (dragging.current = false);
    const move = (e: PointerEvent) => {
      if (!dragging.current || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      setPos(Math.max(2, Math.min(98, x)));
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionTitle
          kicker="Transformação"
          title={<>Antes & depois <span className="gradient-text-ember">de verdade</span></>}
          subtitle="Marcos, 34 anos · −18 kg e +12% massa magra em 4 meses no programa Forge."
        />

        <Reveal>
          <div
            ref={ref}
            className="relative mx-auto mt-14 aspect-[4/3] max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-black select-none md:aspect-[16/9]"
            onPointerDown={(e) => {
              dragging.current = true;
              const r = e.currentTarget.getBoundingClientRect();
              setPos(Math.max(2, Math.min(98, ((e.clientX - r.left) / r.width) * 100)));
            }}
          >
            <img src={afterImg} alt="Depois da transformação" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `polygon(0 0, ${pos}% 0, ${pos}% 100%, 0 100%)` }}>
              <img src={beforeImg} alt="Antes da transformação" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/80 backdrop-blur">Antes</span>
            <span className="absolute right-4 top-4 rounded-full gradient-ember px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white">Depois</span>
            <div
              className="pointer-events-none absolute inset-y-0 z-10 w-[2px] gradient-ember"
              style={{ left: `calc(${pos}% - 1px)` }}
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-background/70 p-3 ember-glow backdrop-blur">
                <div className="flex gap-1">
                  <ArrowRight className="h-4 w-4 -scale-x-100 text-white" />
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-white/50">Arraste a linha para comparar</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────── Plans ───────────────────── */
function Plans() {
  const plans = [
    {
      name: "Spark",
      price: "149",
      tagline: "Comece a forjar.",
      features: ["Acesso à musculação", "Aulas em grupo", "Avaliação inicial"],
      cta: "Quero o Spark",
      featured: false,
    },
    {
      name: "Forge",
      price: "289",
      tagline: "Nosso plano mais escolhido.",
      features: [
        "Acesso 24h",
        "Personal trainer 4×/mês",
        "Avaliação física trimestral",
        "Nutricionista incluso",
        "Recovery zone liberada",
      ],
      cta: "Começar 7 dias grátis",
      featured: true,
    },
    {
      name: "Iron",
      price: "499",
      tagline: "Resultado máximo.",
      features: [
        "Tudo do Forge",
        "Personal ilimitado",
        "Acompanhamento médico",
        "Programa nutricional 1:1",
        "Eventos VIP",
      ],
      cta: "Falar com consultor",
      featured: false,
    },
  ];
  return (
    <section id="planos" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionTitle
          kicker="Planos"
          title={<>Escolha o seu <span className="gradient-text-ember">caminho</span></>}
          subtitle="Cancele quando quiser. Primeira semana grátis em todos os planos."
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
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
                <a
                  href="#"
                  className={cn(
                    "mt-10 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.02]",
                    p.featured
                      ? "gradient-ember text-white ember-glow"
                      : "border border-white/15 text-white hover:bg-white/5",
                  )}
                >
                  {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Testimonials slider ───────────────────── */
function Testimonials() {
  const slides = [
    {
      img: t1,
      name: "Lucas Mendes",
      role: "Empresário, 32",
      stars: 5,
      result: "−14 kg em 5 meses",
      quote:
        "A Iron Forge mudou completamente minha rotina. O acompanhamento é cirúrgico — eu nunca tinha tido resultado tão consistente.",
    },
    {
      img: t2,
      name: "Beatriz Lima",
      role: "Médica, 28",
      stars: 5,
      result: "+8% massa magra",
      quote:
        "Ambiente premium e zero julgamento. Os personais entendem do meu objetivo de hipertrofia e ajustam cada treino.",
    },
    {
      img: t3,
      name: "Rafael Costa",
      role: "Engenheiro, 41",
      stars: 5,
      result: "Powerlifting +60 kg total",
      quote:
        "Equipamentos absurdos, sala de força impecável. Subi meu agachamento 60 kg em 6 meses com o programa Iron.",
    },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  return (
    <section id="depoimentos" className="relative overflow-hidden border-y border-white/5 bg-[oklch(0.11_0.005_20)] py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionTitle
          kicker="Depoimentos"
          title={<>Histórias <span className="gradient-text-ember">forjadas aqui</span></>}
        />
        <div className="relative mt-14 min-h-[440px] md:min-h-[360px]">
          <AnimatePresence mode="wait">
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="grid items-center gap-8 rounded-3xl border border-white/10 bg-white/[0.02] p-7 md:grid-cols-[260px_1fr] md:p-10"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <img src={slides[i].img} alt={slides[i].name} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </div>
              <div>
                <div className="mb-3 flex items-center gap-1">
                  {Array.from({ length: slides[i].stars }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="font-display text-2xl leading-snug text-white md:text-3xl">
                  “{slides[i].quote}”
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-white">{slides[i].name}</span>
                  <span className="text-white/40">·</span>
                  <span className="text-white/60">{slides[i].role}</span>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                    <Trophy className="h-3 w-3" /> {slides[i].result}
                  </span>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-2">
            {slides.map((_, k) => (
              <button
                key={k}
                aria-label={`Depoimento ${k + 1}`}
                onClick={() => setI(k)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === k ? "w-8 bg-primary" : "w-2 bg-white/20 hover:bg-white/40",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── FAQ ───────────────────── */
function FAQ() {
  const items = [
    {
      q: "Posso cancelar quando quiser?",
      a: "Sim. Todos os planos são mensais e sem fidelidade. Cancele direto no app em 1 clique.",
    },
    {
      q: "Tem personal incluso?",
      a: "Os planos Forge e Iron incluem sessões com personal CREF. O Spark oferece personal sob demanda.",
    },
    {
      q: "Funciona para iniciantes?",
      a: "Totalmente. 38% dos nossos alunos nunca treinaram antes. Você recebe um onboarding 1:1 com um treinador.",
    },
    {
      q: "A academia abre nos finais de semana?",
      a: "Abrimos das 7h às 20h aos sábados e das 8h às 14h aos domingos. Plano Forge e Iron têm acesso 24h.",
    },
    {
      q: "Como funciona a semana grátis?",
      a: "Você experimenta toda a estrutura por 7 dias, com personal e avaliação inicial. Sem cartão, sem compromisso.",
    },
  ];
  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionTitle kicker="FAQ" title={<>Perguntas <span className="gradient-text-ember">frequentes</span></>} />
        <Reveal>
          <Accordion type="single" collapsible className="mt-12 space-y-3">
            {items.map((it, i) => (
              <AccordionItem
                key={i}
                value={`q-${i}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-5"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-white hover:no-underline">
                  {it.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-white/65">{it.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────── Footer ───────────────────── */
function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-[oklch(0.1_0.005_20)] pt-24 pb-10">
      {/* CTA final */}
      <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
        <Reveal>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-10 md:p-16">
            <Flame className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-5 font-display text-balance text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-tight">
              Pronto para <span className="gradient-text-ember">forjar</span> a sua melhor versão?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/60">
              Comece com 7 dias grátis. Sem cartão. Sem compromisso. Só resultado.
            </p>
            <a
              href="#cadastro"
              className="mt-8 inline-flex items-center gap-3 rounded-full gradient-ember px-7 py-3.5 text-sm font-semibold text-white ember-glow animate-pulse-glow"
            >
              Quero meu acesso <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-20 grid max-w-7xl gap-12 px-5 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg gradient-ember ember-glow">
              <Flame className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl tracking-[0.12em]">
              IRON <span className="text-primary">FORGE</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-white/55">
            Forjando físicos extraordinários desde 2019.
          </p>
          <div className="mt-5 flex gap-3">
            {[Instagram, Youtube, MessageCircle].map((I, i) => (
              <a
                key={i}
                href="#"
                aria-label="Rede social"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-primary hover:text-primary"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">Endereço</div>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/75">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Av. Paulista, 1.800 · Bela Vista · São Paulo / SP
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">Horário</div>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/75">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Seg–Sex 5h–23h · Sáb 7h–20h · Dom 8h–14h
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">Contato</div>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/75">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            (11) 4002-8922
          </p>
        </div>
      </div>

      {/* stylized map */}
      <div className="mx-auto mt-12 max-w-7xl px-5 md:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.14_0.005_20)] p-1">
          <svg viewBox="0 0 1200 220" className="h-40 w-full opacity-70" aria-hidden>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1200" height="220" fill="url(#grid)" />
            <path d="M0 140 Q300 60 600 140 T1200 110" stroke="oklch(0.62 0.24 22 / 0.6)" strokeWidth="2" fill="none" />
            <circle cx="600" cy="120" r="9" fill="oklch(0.62 0.24 22)" />
            <circle cx="600" cy="120" r="20" fill="none" stroke="oklch(0.62 0.24 22 / 0.5)" strokeWidth="2">
              <animate attributeName="r" from="9" to="40" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-5 text-xs text-white/40 md:flex md:items-center md:justify-between md:px-8">
        <span>© {new Date().getFullYear()} Iron Forge. Todos os direitos reservados.</span>
        <span className="mt-2 block md:mt-0">Forjado em São Paulo.</span>
      </div>
    </footer>
  );
}

/* ───────────────────── WhatsApp float ───────────────────── */
function WhatsAppFloat() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 400);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={buildWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar no WhatsApp"
          onClick={() => trackEvent("whatsapp_click", { from: "float" })}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          className="fixed bottom-6 right-6 z-[70] grid h-14 w-14 place-items-center rounded-full gradient-ember text-white ember-glow animate-pulse-glow"
        >
          <MessageCircle className="h-6 w-6" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────── Exit Intent Popup ───────────────────── */
function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeen = sessionStorage.getItem("exit_intent_seen");
    if (hasSeen) return;

    // Detect mouse leaving viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 20) {
        setIsOpen(true);
        sessionStorage.setItem("exit_intent_seen", "true");
      }
    };

    // Backup: 35 seconds inactivity timer
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem("exit_intent_seen", "true");
    }, 35000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/25 bg-[oklch(0.12_0.005_20)] p-8 text-center shadow-2xl ember-glow"
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-white/40 hover:text-white text-xl"
        >
          ✕
        </button>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary mx-auto">
          <Flame className="h-6 w-6 animate-pulse" />
        </span>
        <h3 className="font-display text-3xl tracking-tight mt-4">
          NÃO VÁ EMBORA AINDA!
        </h3>
        <p className="mt-3 text-sm text-white/70">
          Temos uma oferta exclusiva de fechamento de página:
        </p>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xl font-bold text-primary">10% OFF na primeira mensalidade</p>
          <p className="text-xs text-white/50 mt-1">+ Onboarding e On-site Personal Trainer grátis</p>
        </div>
        <p className="mt-4 text-xs text-yellow-300 font-semibold uppercase tracking-wider">
          🔥 Apenas mais 3 cupons disponíveis hoje
        </p>
        <a
          href="#cadastro"
          onClick={() => setIsOpen(false)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full gradient-ember py-3.5 text-sm font-semibold text-white hover:scale-[1.02] transition-transform"
        >
          Garantir minha vaga com desconto
          <ArrowRight className="h-4 w-4" />
        </a>
      </motion.div>
    </div>
  );
}

/* ───────────────────── Social Proof Toasts ───────────────────── */
function SocialProofToast() {
  const [current, setCurrent] = useState<string | null>(null);
  const notices = [
    "Arthur (Jardins) acabou de agendar uma aula experimental! 🔥",
    "Juliana (Bela Vista) matriculou-se no plano Forge! ⭐",
    "Felipe (Paraíso) garantiu 1 das vagas promocionais! 🚀",
    "Carla (Pinheiros) realizou o agendamento há 5 minutos! 🏋️‍♂️",
    "Rodrigo (Consolação) iniciou o programa experimental! 💪",
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrent(notices[index]);
      index = (index + 1) % notices.length;

      // Ocultar após 5 segundos
      setTimeout(() => {
        setCurrent(null);
      }, 5000);
    }, 18000); // Mostra a cada 18 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-[60] flex max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-[oklch(0.12_0.005_20)] p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Flame className="h-4 w-4" />
          </div>
          <p className="text-xs text-white/80 leading-snug">{current}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────── Floating CTA ───────────────────── */
function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 700);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed inset-x-0 bottom-0 z-[59] border-t border-white/10 bg-background/85 px-5 py-4 backdrop-blur-md md:px-8"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-left">
              <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">Iron Forge Premium</p>
              <p className="text-sm text-white font-semibold mt-0.5">🔥 7 dias grátis · Apenas 12 vagas este mês</p>
            </div>
            <a
              href="#cadastro"
              className="inline-flex items-center justify-center gap-2 rounded-full gradient-ember px-6 py-2.5 text-xs font-semibold text-white hover:scale-[1.02] transition-transform"
            >
              Matricule-se Agora
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}