import Reveal from "./Reveal";

interface SectionTitleProps {
  kicker: string;
  title: React.ReactNode;
  subtitle?: string;
}

export default function SectionTitle({ kicker, title, subtitle }: SectionTitleProps) {
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
