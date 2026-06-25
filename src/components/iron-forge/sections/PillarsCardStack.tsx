import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import SectionTitle from "./shared/SectionTitle";
import Reveal from "./shared/Reveal";
import gallery1 from "@/assets/gallery-1.jpg";
import nutritionPrep from "@/assets/nutrition_prep.png";
import recoverySauna from "@/assets/recovery_sauna.png";

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
      <span className="absolute top-4 left-4 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
        {tag}
      </span>
    </div>
  );
}

export default function PillarsCardStack() {
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
