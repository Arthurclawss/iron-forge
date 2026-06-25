import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "motion/react";
import { ArrowRight, Flame, Star } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";

interface HeroProps {
  prefersReducedMotion: boolean;
}

export default function Hero({ prefersReducedMotion }: HeroProps) {
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
    [ssx, ssy] as any,
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
              ["--drift" as any]: `${drift}px`,
            }}
          />
        );
      })}
    </div>
  );
}
