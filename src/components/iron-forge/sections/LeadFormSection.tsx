import LeadForm from "./LeadForm";

export default function LeadFormSection() {
  return (
    <section
      id="cadastro"
      className="relative scroll-mt-24 border-t border-white/5 bg-[oklch(0.09_0.005_20)] py-24 md:py-32"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2 md:px-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-primary">
            Aula experimental gratuita
          </span>
          <h2 className="mt-4 font-display text-balance text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight">
            Comece sua <span className="gradient-text-ember">transformação</span> hoje
          </h2>
          <p className="mt-4 max-w-md text-white/65">
            Preencha o formulário e um especialista entra em contato em até 15 minutos
            para agendar sua aula experimental sem compromisso.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/70">
            {[
              "Avaliação física completa",
              "Plano de treino personalizado",
              "Tour pela estrutura premium",
              "7 dias grátis se decidir continuar",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[oklch(0.12_0.005_20)] p-6 md:p-8">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
