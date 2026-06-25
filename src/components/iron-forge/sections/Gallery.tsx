import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import SectionTitle from "./shared/SectionTitle";
import heroImg from "@/assets/hero.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

interface GalleryItemProps {
  src: string;
  title: string;
  h: "tall" | "short";
  speed?: number;
}

function GalleryItem({ src, title, h, speed = 1 }: GalleryItemProps) {
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

export default function Gallery() {
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
