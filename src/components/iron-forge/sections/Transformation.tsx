import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import SectionTitle from "./shared/SectionTitle";
import Reveal from "./shared/Reveal";
import beforeImg from "@/assets/before.jpg";
import afterImg from "@/assets/after.jpg";

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
    [smx, smy, srad] as any,
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

export default function Transformation() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile ? <TransformationMobile /> : <TransformationDesktop />;
}
