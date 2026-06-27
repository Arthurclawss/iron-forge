import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowRight, Flame, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { siteConfig, buildWhatsAppUrl } from "../../../../config/site";

interface FloatingWidgetsProps {
  prefersReducedMotion: boolean;
}

export default function FloatingWidgets({ prefersReducedMotion }: FloatingWidgetsProps) {
  return (
    <>
      <ScrollProgress />
      <UrgencyBar />
      <WhatsAppFloat />
      <ExitIntentPopup />
      <SocialProofToast />
      <FloatingCTA />
    </>
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
          className="absolute right-4 top-4 text-white/40 hover:text-white text-xl cursor-pointer"
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


