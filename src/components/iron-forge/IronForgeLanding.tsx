import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import FitnessCalculator from "./FitnessCalculator";
import PaymentModal, { type PlanKey } from "./PaymentModal";

// Modularized Sub-sections
import Nav from "./sections/Nav";
import Hero from "./sections/Hero";
import TrustBadges from "./sections/TrustBadges";
import PillarsCardStack from "./sections/PillarsCardStack";
import Benefits from "./sections/Benefits";
import Gallery from "./sections/Gallery";
import Results from "./sections/Results";
import Transformation from "./sections/Transformation";
import Plans from "./sections/Plans";
import Testimonials from "./sections/Testimonials";
import FAQ from "./sections/FAQ";
import Footer from "./sections/Footer";
import FloatingWidgets from "./sections/FloatingWidgets";

/* ═══════════════════════════════════════════════════════════
   Iron Forge — premium landing orchestrator
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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground animate-fade-in">
      <FloatingWidgets prefersReducedMotion={prefersReducedMotion} />
      <Nav />
      <main className="relative">
        <Hero prefersReducedMotion={prefersReducedMotion} />
        <TrustBadges />
        <PillarsCardStack />
        <Benefits />
        <Gallery />
        <Results />
        <Transformation />
        <FitnessCalculator onSelectPlan={setSelectedPlan} />
        <Plans onSelectPlan={setSelectedPlan} />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />

      {/* Payment modal — renders above everything */}
      {selectedPlan && (
        <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  );
}