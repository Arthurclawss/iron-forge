import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface ScrollHighlightTextProps {
  text: string;
  kicker?: string;
  kickerClass?: string;
  highlightIndexStart?: number;
}

export default function ScrollHighlightText({ text, kicker, kickerClass, highlightIndexStart }: ScrollHighlightTextProps) {
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
