import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import SectionTitle from "./shared/SectionTitle";
import Reveal from "./shared/Reveal";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    {
      q: "Como funciona o cancelamento?",
      a: "Todos os nossos planos recorrentes (mensalidades) podem ser cancelados a qualquer momento diretamente no seu painel ou solicitando na recepção com até 5 dias de antecedência do próximo vencimento, sem qualquer multa ou taxa de fidelidade.",
    },
    {
      q: "Posso levar convidados para treinar comigo?",
      a: "Sim! Os alunos dos planos Forge e Legacy possuem direito a convites mensais gratuitos para trazer amigos ou familiares. Alunos do plano Spark podem adquirir passes diários de convidado com tarifas especiais na recepção.",
    },
    {
      q: "Como funciona a avaliação com a calculadora?",
      a: "Ao preencher seus dados na nossa calculadora de metas, nosso sistema estima o seu IMC e taxa metabólica diária (TDEE). Esses dados servem como base para o seu onboarding e são validados por um de nossos treinadores na sua primeira visita.",
    },
    {
      q: "A academia oferece estacionamento e acessibilidade?",
      a: "Sim, dispomos de estacionamento amplo, seguro e gratuito com manobrista para alunos activos durante todo o horário de treino. Nossa estrutura é 100% acessível, com rampas, elevadores e vestiários adaptados.",
    },
  ];
  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionTitle kicker="FAQ" title={<>Perguntas <span className="gradient-text-ember">frequentes</span></>} />
        <Reveal>
          <div className="mt-12 space-y-3">
            {items.map((it, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-5"
                >
                  <h3>
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between py-5 text-left text-base font-semibold text-white cursor-pointer hover:text-primary transition-colors focus:outline-none"
                    >
                      <span>{it.q}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-white/50 transition-transform duration-300",
                          isOpen && "rotate-180 text-primary"
                        )}
                      />
                    </button>
                  </h3>
                  <div
                    className={cn(
                      "transition-all duration-300 ease-in-out overflow-hidden",
                      isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="text-white/65 text-sm leading-relaxed">{it.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
