import { Star, Award, ShieldCheck, Clock } from "lucide-react";

export default function TrustBadges() {
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
