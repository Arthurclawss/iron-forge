import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
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
  ChevronDown,
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
import nutritionPrep from "@/assets/nutrition_prep.png";
import recoverySauna from "@/assets/recovery_sauna.png";
import FitnessCalculator from "./FitnessCalculator";
import PaymentModal, { type PlanKey } from "./PaymentModal";
import { siteConfig, buildWhatsAppUrl } from "../../../config/site";
import { trackEvent } from "@/lib/analytics";

/* ═══════════════════════════════════════════════════════════
   Iron Forge — premium landing
   ═══════════════════════════════════════════════════════════ */

export default function IronForgeLanding() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);

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
      <main className="relative">
        <Hero prefersReducedMotion={prefersReducedMotion} />
        <TrustBadges />
        <PillarsCardStack />
        <Benefits />
        <Gallery />
        <Results />
        <Transformation />
        <FitnessCalculator />
        <Plans onSelectPlan={setSelectedPlan} />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppFloat />
      <ExitIntentPopup />
      <SocialProofToast />
      <FloatingCTA />
      {/* Payment modal — renders above everything */}
      {selectedPlan && (
        <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
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

  // scroll parallax for floating elements
  const imgLeftScrollY = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const imgRightScrollY = useTransform(scrollYProgress, [0, 1], [0, -320]);
  const imgLeftMouseX = useTransform(smx, [-1, 1], [-25, 25]);
  const imgLeftMouseY = useTransform(smy, [-1, 1], [-20, 20]);
  const imgRightMouseX = useTransform(smx, [-1, 1], [25, -25]);
  const imgRightMouseY = useTransform(smy, [-1, 1], [20, -20]);

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
            src="/crie_um_video_para_uma_landing.mp4"
            type="video/mp4"
          />
          <img src={heroImg} className="h-full w-full object-cover" alt="Treinamento de força de elite na arena Iron Forge" />
        </video>
      </motion.div>

      {/* Floating Left Parallax Card */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute left-[4%] top-[30%] z-20 hidden xl:block pointer-events-none"
          style={{ y: imgLeftScrollY }}
        >
          <motion.div
            className="w-56 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 shadow-2xl backdrop-blur-md pointer-events-auto select-none"
            style={{ x: imgLeftMouseX, y: imgLeftMouseY, rotate: -4 }}
            whileHover={{ scale: 1.05, rotate: -1, transition: { duration: 0.3 } }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
              <img src={gallery1} alt="Treino Foco" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full bg-primary/20 border border-primary/30 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white backdrop-blur-md font-semibold">
                Treino de Elite
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Floating Right Parallax Card */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute right-[4%] top-[20%] z-20 hidden lg:block pointer-events-none"
          style={{ y: imgRightScrollY }}
        >
          <motion.div
            className="w-52 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 shadow-2xl backdrop-blur-md pointer-events-auto select-none"
            style={{ x: imgRightMouseX, y: imgRightMouseY, rotate: 6 }}
            whileHover={{ scale: 1.05, rotate: 2, transition: { duration: 0.3 } }}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
              <img src={gallery2} alt="Espaço Cross" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full bg-primary/20 border border-primary/30 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white backdrop-blur-md font-semibold">
                Performance
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}

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
          Premium Strength Club · Ponta Negra, Natal / RN
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
function GalleryItem({ src, title, h, speed = 1 }: { src: string; title: string; h: "tall" | "short"; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [80 * speed, -80 * speed]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.02, 1.15, 1.02]);
  const rotate = useTransform(scrollYProgress, [0, 1], [h === "tall" ? -3 : 3, h === "tall" ? 3 : -3]);

  return (
    <motion.figure
      ref={ref}
      style={{ y }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl",
        h === "tall" ? "aspect-[3/4]" : "aspect-[4/5] md:mt-16",
      )}
    >
      <motion.img
        src={src}
        alt={title}
        style={{ scale, rotate }}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.22]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-1/2 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ animation: "shimmer-sweep 1.6s ease-out" }}
      />
      <figcaption className="absolute bottom-5 left-5 text-xs uppercase tracking-[0.25em] text-white/85 font-bold">
        {title}
      </figcaption>
    </motion.figure>
  );
}

function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Background parallax movement
  const bgY = useTransform(scrollYProgress, [0, 1], [-120, 120]);

  const items = [
    { src: gallery1, title: "Sala de musculação", h: "tall" as const, speed: 1.2 },
    { src: gallery2, title: "Funcional & Cross", h: "short" as const, speed: 2.4 },
    { src: gallery3, title: "Powerlifting platform", h: "short" as const, speed: 1.8 },
    { src: gallery4, title: "Performance zone", h: "tall" as const, speed: 0.9 },
  ];

  return (
    <section ref={sectionRef} id="estrutura" className="relative py-32 md:py-44 overflow-hidden bg-background">
      {/* Parallax Background Image */}
      <motion.div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.06] scale-125 filter blur-[2px]"
        style={{
          backgroundImage: `url(${heroImg})`,
          y: bgY
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background -z-10" />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionTitle
          kicker="Estrutura"
          title={<>Uma arena <span className="gradient-text-ember">cinematográfica</span></>}
          subtitle="2.800 m² projetados por arquitetos especializados em design de performance."
        />
      </div>
      <div className="mx-auto mt-20 grid max-w-7xl grid-cols-2 gap-6 px-5 md:grid-cols-4 md:gap-8 md:px-8">
        {items.map((it, i) => (
          <GalleryItem key={i} src={it.src} title={it.title} h={it.h} speed={it.speed} />
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile ? <TransformationMobile /> : <TransformationDesktop />;
}

/* ── Desktop version: spotlight follows mouse cursor ── */
function TransformationDesktop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rad = useMotionValue(140);
  
  const smx = useSpring(mx, { stiffness: 150, damping: 25 });
  const smy = useSpring(my, { stiffness: 150, damping: 25 });
  const srad = useSpring(rad, { stiffness: 150, damping: 25 });

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    rad.set(isHovered ? 200 : 140);
  }, [isHovered, rad]);

  const clipPath = useTransform(
    [smx, smy, srad] as never,
    ([x, y, r]: number[]) => `circle(${r}px at ${x}% ${y}%)`
  );

  const spotlightX = useTransform(smx, (x) => `${x}%`);
  const spotlightY = useTransform(smy, (y) => `${y}%`);
  const spotlightW = useTransform(srad, (r) => `${r * 2}px`);
  const spotlightH = useTransform(srad, (r) => `${r * 2}px`);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mx.set(x);
    my.set(y);
  };

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => {
    setIsHovered(false);
    mx.set(50);
    my.set(50);
  };

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
            ref={containerRef}
            className="relative mx-auto mt-14 aspect-[4/3] max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[oklch(0.06_0.005_20)] select-none md:aspect-[16/9] cursor-none"
            onPointerMove={handlePointerMove}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          >
            <img src={beforeImg} alt="Antes da transformação" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <motion.div className="absolute inset-0 overflow-hidden" style={{ clipPath }}>
              <img src={afterImg} alt="Depois da transformação" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </motion.div>

            <div className="absolute left-6 top-6 z-20 pointer-events-none rounded-full bg-black/75 border border-white/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-white/70 backdrop-blur-md font-semibold">Antes</div>
            <div className="absolute right-6 top-6 z-20 pointer-events-none rounded-full gradient-ember px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-white font-semibold shadow-lg shadow-primary/20">Depois</div>

            <AnimatePresence>
              {!isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none bg-black/30 backdrop-blur-[1px]"
                >
                  <div className="relative flex items-center justify-center w-28 h-28">
                    <div className="absolute inset-0 rounded-full border-2 border-white/80 animate-ping opacity-25" />
                    <div className="absolute inset-2 rounded-full border border-primary/60 animate-pulse bg-primary/10" />
                    <div className="absolute inset-4 rounded-full border border-white/20 bg-background/50 flex items-center justify-center text-white font-semibold font-display text-xs">Revelar</div>
                  </div>
                  <p className="mt-4 font-display text-xs tracking-widest text-white/90 uppercase bg-black/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur">
                    Passe o mouse
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {isHovered && (
              <motion.div
                className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50 bg-transparent shadow-[0_0_40px_rgba(255,77,46,0.3)]"
                style={{ left: spotlightX, top: spotlightY, width: spotlightW, height: spotlightH }}
              />
            )}
            <div ref={cardRef} className="absolute inset-0 pointer-events-none" />
          </div>

          <p className="mt-6 text-center text-xs text-white/40 font-medium">
            Mova o cursor sobre a imagem para revelar o físico transformado
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-10">
            <MetricCircle label="Gordura Corporal" fromVal="24%" toVal="12%" pct={50} delay={0.1} />
            <MetricCircle label="Peso Corporal" fromVal="96 kg" toVal="78 kg" pct={81} delay={0.2} />
            <MetricCircle label="Massa Magra" fromVal="38%" toVal="42.5%" pct={90} delay={0.3} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Mobile version: drag slider ── */
function TransformationMobile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPct, setSliderPct] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Animate hint on mount
  useEffect(() => {
    if (hasInteracted) return;
    let forward = true;
    let val = 40;
    const interval = setInterval(() => {
      if (!hasInteracted) {
        val = forward ? Math.min(val + 1.5, 65) : Math.max(val - 1.5, 35);
        if (val >= 65) forward = false;
        if (val <= 35) forward = true;
        setSliderPct(val);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [hasInteracted]);

  const updateFromEvent = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setSliderPct(Math.max(2, Math.min(98, raw)));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setHasInteracted(true);
    updateFromEvent(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromEvent(e.clientX);
  };
  const onPointerUp = () => setIsDragging(false);

  return (
    <section className="relative py-20 md:py-36">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionTitle
          kicker="Transformação"
          title={<>Antes & depois <span className="gradient-text-ember">de verdade</span></>}
          subtitle="Marcos, 34 anos · −18 kg e +12% massa magra em 4 meses no programa Forge."
        />

        <Reveal>
          {/* Slider container */}
          <div
            ref={containerRef}
            className="relative mx-auto mt-10 aspect-[3/4] max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.06_0.005_20)] select-none touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* BEFORE — full background */}
            <img src={beforeImg} alt="Antes da transformação" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />

            {/* AFTER — clipped to left of slider */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPct}% 0 0)` }}
            >
              <img src={afterImg} alt="Depois da transformação" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>

            {/* Divider line */}
            <div
              className="absolute inset-y-0 z-20 w-[2px] bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
              style={{ left: `${sliderPct}%`, transform: "translateX(-50%)" }}
            >
              {/* Handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xl shadow-black/40 border-2 border-primary/60">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M6 3L2 9L6 15" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 3L16 9L12 15" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute left-3 top-4 z-20 pointer-events-none rounded-full bg-black/75 border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-md font-semibold">Antes</div>
            <div className="absolute right-3 top-4 z-20 pointer-events-none rounded-full gradient-ember px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white font-semibold">Depois</div>

            {/* Hint overlay */}
            <AnimatePresence>
              {!hasInteracted && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                >
                  <div className="flex items-center gap-2 rounded-full bg-black/70 border border-white/15 px-4 py-2 backdrop-blur">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8H12M4 8L6.5 5.5M4 8L6.5 10.5M12 8L9.5 5.5M12 8L9.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
                    </svg>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-semibold">Arraste</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-4 text-center text-xs text-white/40 font-medium">
            Arraste o slider para revelar a transformação
          </p>

          {/* Metrics — stacked for mobile */}
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mt-8">
            <MetricCircle label="Gordura" fromVal="24%" toVal="12%" pct={50} delay={0.1} />
            <MetricCircle label="Peso" fromVal="96 kg" toVal="78 kg" pct={81} delay={0.2} />
            <MetricCircle label="Massa Magra" fromVal="38%" toVal="42.5%" pct={90} delay={0.3} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}


/* ───────────────────── Plans ───────────────────── */
function Plans({ onSelectPlan }: { onSelectPlan: (plan: PlanKey) => void }) {
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    {
      q: "Como funciona o cancelamento?",
      a: "Todos os nossos planos recorrentes (mensalidades) podem ser cancelados a qualquer momento diretamente no seu painel ou solicitando na recepção com até 5 dias de antecedência do próximo vencimento, sem qualquer multa ou taxa de fidelidade.",
    },
    {
      q: "Posso levar convidados para treinar comigo?",
      a: "Sim! Os alunos dos planos Forge e Legacy possuem direito a convites mensais gratuitos para trazer amigos ou familiares. Alunos do plano Spark podem adquirir passes diários de convidado com tarifas especiais na recepção.",
    },
    {
      q: "Como funciona a avaliação com a calculadora?",
      a: "Ao preencher seus dados na nossa calculadora de metas, nosso sistema estima o seu IMC e taxa metabólica diária (TDEE). Esses dados servem como base para o seu onboarding e são validados por um de nossos treinadores na sua primeira visita.",
    },
    {
      q: "A academia oferece estacionamento e acessibilidade?",
      a: "Sim, dispomos de estacionamento amplo, seguro e gratuito com manobrista para alunos ativos durante todo o horário de treino. Nossa estrutura é 100% acessível, com rampas, elevadores e vestiários adaptados.",
    },
  ];
  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionTitle kicker="FAQ" title={<>Perguntas <span className="gradient-text-ember">frequentes</span></>} />
        <Reveal>
          <div className="mt-12 space-y-3">
            {items.map((it, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-5"
                >
                  <h3>
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between py-5 text-left text-base font-semibold text-white cursor-pointer hover:text-primary transition-colors focus:outline-none"
                    >
                      <span>{it.q}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-white/50 transition-transform duration-300",
                          isOpen && "rotate-180 text-primary"
                        )}
                      />
                    </button>
                  </h3>
                  <div
                    className={cn(
                      "transition-all duration-300 ease-in-out overflow-hidden",
                      isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="text-white/65 text-sm leading-relaxed">{it.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
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
            {[
              { Icon: Instagram, label: "Acessar o Instagram da Iron Forge", href: siteConfig.social.instagram },
              { Icon: Youtube, label: "Acessar o canal do YouTube da Iron Forge", href: siteConfig.social.youtube },
              { Icon: MessageCircle, label: "Falar com a Iron Forge no WhatsApp", href: buildWhatsAppUrl() }
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">Endereço</div>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/75">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {siteConfig.address.full}
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">Horário</div>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/75">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {siteConfig.hours}
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">Contato</div>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/75">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            (84) 99123-4567
          </p>
        </div>
      </div>

      {/* Google Maps Embed */}
      <div className="mx-auto mt-12 max-w-7xl px-5 md:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.14_0.005_20)] p-1 h-80 shadow-2xl">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15876.541416972007!2d-35.1843231!3d-5.8860714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b2fc20054fffff%3A0xc3cbcfd1f67f5df5!2sPonta+Negra%2C+Natal+-+RN!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
            width="100%"
            height="100%"
            style={{ 
              border: 0 
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full rounded-xl"
            title="Localização da Iron Forge"
          />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-5 text-xs text-white/40 md:flex md:items-center md:justify-between md:px-8">
        <span>© {new Date().getFullYear()} Iron Forge. Todos os direitos reservados.</span>
        <span className="mt-2 block md:mt-0">Forjado em {siteConfig.address.city}.</span>
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

/* ───────────────────── Molten Flow Line (Fio de Aço) ───────────────────── */
function MoltenFlowLine() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 22, restDelta: 0.001 });
  const tipPercent = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] pointer-events-none z-10 hidden lg:block overflow-hidden">
      {/* Track */}
      <div className="absolute inset-y-0 left-0 w-full bg-white/[0.04]" />
      
      {/* Flow Line */}
      <motion.div
        className="absolute top-0 left-0 w-full origin-top bg-gradient-to-b from-primary/80 via-primary to-orange-500 shadow-[0_0_12px_#ff4500,0_0_24px_#ff4500]"
        style={{ height: useTransform(scaleY, [0, 1], ["0%", "100%"]) }}
      />
      
      {/* Glowing tip */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white -mt-2 shadow-[0_0_15px_#ff7f50,0_0_30px_#ff4500,0_0_45px_#ff4500] mix-blend-screen"
        style={{
          top: tipPercent,
        }}
      >
        <span className="absolute inset-0 rounded-full animate-ping bg-primary/80 opacity-75" />
      </motion.div>
    </div>
  );
}

/* ───────────────────── Pillars Card Stack ───────────────────── */
function PillarImage({ src, alt, tag }: { src: string; alt: string; tag: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.02, 1.15, 1.02]);

  return (
    <div ref={ref} className="relative w-full aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] group">
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale }}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
      <span className="absolute top-4 left-4 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md font-semibold">
        {tag}
      </span>
    </div>
  );
}

function PillarsCardStack() {
  const cards = [
    {
      title: "Treino de Elite",
      badge: "PILAR 01 · MUSCULAÇÃO",
      desc: "Sessões desenhadas para máxima hipertrofia e performance, utilizando os melhores equipamentos do mundo (Technogym e Hammer Strength) com acompanhamento cirúrgico.",
      img: gallery1,
      tag: "Força & Hipertrofia",
      stats: "Hammer Strength • Technogym"
    },
    {
      title: "Nutrição Personalizada",
      badge: "PILAR 02 · BIOIMPEDÂNCIA",
      desc: "Plano nutricional integrado ao seu treino. Consulta periódica com nutricionistas parceiros da Iron Forge para garantir que sua ingestão calórica esteja alinhada ao seu ganho de massa.",
      img: nutritionPrep,
      tag: "Dieta & Performance",
      stats: "Nutricionista Incluso • Bioimpedância"
    },
    {
      title: "Recovery Zone",
      badge: "PILAR 03 · SAÚDE & RECOVERY",
      desc: "Acelere sua regeneração muscular. Sala de recovery completa com sauna de madeira premium, crioterapia (banheira de gelo) e zona de mobilidade para você estar pronto para o próximo treino.",
      img: recoverySauna,
      tag: "Regeneração Ativa",
      stats: "Sauna • Crioterapia • Recovery"
    },
  ];

  return (
    <section id="metodo" className="relative py-28 md:py-36 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionTitle
          kicker="Os 3 Pilares"
          title={<>O Método <span className="gradient-text-ember">Iron Forge</span></>}
          subtitle="Resultados extraordinários exigem sinergia perfeita entre treino, alimentação e regeneração."
        />
        
        {/* Desktop Layout (Grid stack) */}
        <div className="hidden md:block mt-20 md:mt-28 space-y-24 md:space-y-32">
          {cards.map((card, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
              >
                {/* Image Block */}
                <div className={cn("w-full", !isEven && "md:order-last")}>
                  <PillarImage src={card.img} alt={card.title} tag={card.tag} />
                </div>

                {/* Content Block */}
                <div className="w-full flex flex-col justify-center">
                  <Reveal delay={0.1}>
                    <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                      {card.badge}
                    </span>
                    <h3 className="font-display text-4xl md:text-5xl tracking-tight text-white mt-3">
                      {card.title}
                    </h3>
                    <p className="mt-6 text-sm md:text-base leading-relaxed text-white/60">
                      {card.desc}
                    </p>
                    <div className="mt-8 border-t border-white/10 pt-5 text-xs text-white/40 uppercase tracking-widest flex justify-between">
                      <span>{card.stats}</span>
                      <span className="text-primary font-bold">0{idx + 1} / 03</span>
                    </div>
                  </Reveal>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Layout (Swipeable Carousel) */}
        <div className="block md:hidden mt-12">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 scroll-smooth pb-6 -mx-5 px-5 scrollbar-none">
            {cards.map((card, idx) => (
              <div
                key={idx}
                className="w-[85vw] min-w-[280px] max-w-[340px] shrink-0 snap-center rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <img src={card.img} alt={card.title} className="h-full w-full object-cover" />
                    <span className="absolute top-3 left-3 rounded-full bg-primary/20 border border-primary/30 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                      {card.tag}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                      {card.badge}
                    </span>
                    <h3 className="font-display text-2xl tracking-tight text-white mt-1">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-white/60">
                      {card.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-6 border-t border-white/5 pt-4 text-[10px] text-white/40 uppercase tracking-widest flex justify-between items-center">
                  <span>{card.stats}</span>
                  <span className="text-primary font-bold">0{idx + 1} / 03</span>
                </div>
              </div>
            ))}
          </div>
          {/* Swipe indicator */}
          <p className="text-center text-[10px] text-white/30 uppercase tracking-[0.2em] mt-3">
            ← Arraste para ver mais pilares →
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Scroll Highlight Text (Apple style) ───────────────────── */
function ScrollHighlightText({ text, kicker, kickerClass, highlightIndexStart }: { text: string; kicker?: string; kickerClass?: string; highlightIndexStart?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  const words = text.split(" ");

  return (
    <div ref={containerRef} className="mx-auto max-w-3xl text-center">
      {kicker && (
        <div className={cn("mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-primary", kickerClass)}>
          <span className="h-1 w-1 rounded-full bg-primary" />
          {kicker}
        </div>
      )}
      <h2 className="font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.1] tracking-tight flex flex-wrap justify-center gap-x-3 gap-y-2">
        {words.map((word, idx) => {
          const start = idx / words.length;
          const end = (idx + 1) / words.length;
          const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);
          const isHighlighted = highlightIndexStart !== undefined && idx >= highlightIndexStart;
          return (
            <motion.span
              key={idx}
              style={{ opacity }}
              className={cn("inline-block", isHighlighted ? "gradient-text-ember ember-text-glow font-bold" : "text-white")}
            >
              {word}
            </motion.span>
          );
        })}
      </h2>
    </div>
  );
}

/* ───────────────────── Metric Circle for before/after transformation ───────────────────── */
interface MetricCircleProps {
  label: string;
  fromVal: string;
  toVal: string;
  pct: number;
  delay?: number;
}

function MetricCircle({ label, fromVal, toVal, pct, delay = 0 }: MetricCircleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const dashArray = 251.2;

  return (
    <div ref={ref} className="flex flex-col items-center p-5 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-sm shadow-xl">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="48" cy="48" r="40" className="stroke-white/5 fill-none" strokeWidth="6" />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            className="stroke-primary fill-none"
            strokeWidth="6"
            strokeDasharray={dashArray}
            initial={{ strokeDashoffset: dashArray }}
            animate={inView ? { strokeDashoffset: dashArray - (dashArray * pct) / 100 } : {}}
            transition={{ duration: 1.5, delay, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xs text-white/40 line-through font-semibold">{fromVal}</span>
          <span className="text-lg font-bold text-white leading-none mt-0.5">{toVal}</span>
        </div>
      </div>
      <span className="mt-3 text-xs uppercase tracking-widest text-white/60 font-semibold text-center">{label}</span>
    </div>
  );
}