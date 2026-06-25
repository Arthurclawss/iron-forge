import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Star, Trophy } from "lucide-react";
import SectionTitle from "./shared/SectionTitle";
import t1 from "@/assets/t1.jpg";
import t2 from "@/assets/t2.jpg";
import t3 from "@/assets/t3.jpg";

export default function Testimonials() {
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
