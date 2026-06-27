import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { Calculator, ArrowRight, Loader2, RefreshCw, Trophy, Flame } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import confetti from "canvas-confetti";

import { leadFormSchema, type LeadFormInput, goalLabels } from "@/lib/leads.schema";
import { siteConfig } from "../../../config/site";
import { trackEvent } from "@/lib/analytics";
import { type PlanKey } from "./PaymentModal";

interface CalculatorInputs {
  weight: number;
  height: number;
  age: number;
  gender: "masculino" | "feminino";
  activity: number;
  goal: "emagrecimento" | "hipertrofia" | "performance" | "condicionamento";
}

interface FitnessCalculatorProps {
  onSelectPlan?: (plan: PlanKey) => void;
}

export default function FitnessCalculator({ onSelectPlan }: FitnessCalculatorProps) {
  const [step, setStep] = useState<"input" | "gate" | "results">("input");
  const [calcData, setCalcData] = useState<CalculatorInputs>({
    weight: 75,
    height: 175,
    age: 28,
    gender: "masculino",
    activity: 1.55,
    goal: "hipertrofia",
  });

  const [results, setResults] = useState<{
    bmi: number;
    bmiCategory: string;
    tdee: number;
    targetCalories: number;
    macros: { name: string; value: number; color: string }[];
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Form para captura de leads no step "gate"
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { goal: "hipertrofia", website: "" },
    mode: "onBlur",
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    processResults();
    // Atualiza a meta no formulário de lead
    setValue("goal", calcData.goal === "emagrecimento" ? "emagrecimento" : 
                    calcData.goal === "hipertrofia" ? "hipertrofia" :
                    calcData.goal === "performance" ? "performance" : "condicionamento");
    setStep("gate");
  };

  const processResults = () => {
    const { weight, height, age, gender, activity, goal } = calcData;
    
    // Equação de Mifflin-St Jeor para TMB
    let bmr = 0;
    if (gender === "masculino") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = Math.round(bmr * activity);
    let targetCalories = tdee;
    
    // Ajuste de calorias com base no objetivo
    if (goal === "emagrecimento") targetCalories = Math.round(tdee - 450);
    else if (goal === "hipertrofia") targetCalories = Math.round(tdee + 350);

    // IMC
    const heightInMeters = height / 100;
    const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
    let bmiCategory = "Peso normal";
    if (bmi < 18.5) bmiCategory = "Abaixo do peso";
    else if (bmi >= 25 && bmi < 29.9) bmiCategory = "Sobrepeso";
    else if (bmi >= 30) bmiCategory = "Obesidade";

    // Macros
    // Hipertrofia: 40% Carb, 30% Prot, 30% Gord
    // Emagrecimento: 30% Carb, 40% Prot, 30% Gord
    // Performance / Condicionamento: 50% Carb, 25% Prot, 25% Gord
    let macros = [
      { name: "Carboidratos", value: 0, color: "#f59e0b" },
      { name: "Proteínas", value: 0, color: "#ff4d2e" },
      { name: "Gorduras", value: 0, color: "#3b82f6" },
    ];

    if (goal === "hipertrofia") {
      macros[0].value = Math.round((targetCalories * 0.40) / 4);
      macros[1].value = Math.round((targetCalories * 0.30) / 4);
      macros[2].value = Math.round((targetCalories * 0.30) / 9);
    } else if (goal === "emagrecimento") {
      macros[0].value = Math.round((targetCalories * 0.30) / 4);
      macros[1].value = Math.round((targetCalories * 0.40) / 4);
      macros[2].value = Math.round((targetCalories * 0.30) / 9);
    } else {
      macros[0].value = Math.round((targetCalories * 0.50) / 4);
      macros[1].value = Math.round((targetCalories * 0.25) / 4);
      macros[2].value = Math.round((targetCalories * 0.25) / 9);
    }

    setResults({ bmi, bmiCategory, tdee, targetCalories, macros });
  };



  const onSubmitLead = async (values: LeadFormInput) => {
    if (submitting) return;
    setServerError(null);
    setSubmitting(true);
    trackEvent("lead_submit", { goal: values.goal, source: "calculator" });

    // Anexa estatísticas da calculadora nas notas
    const statsNote = `Calculadora - Peso: ${calcData.weight}kg, Altura: ${calcData.height}cm, Idade: ${calcData.age}, Gênero: ${calcData.gender}. TDEE: ${results?.tdee || '—'}kcal.`;
    const payload = {
      ...values,
      notes: values.notes ? `${values.notes} | ${statsNote}` : statsNote,
      source: "calculator",
    };

    try {
      const res = await fetch(siteConfig.leadsEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setServerError(json.error ?? "Erro ao processar cadastro.");
        return;
      }
      
      setStep("results");
      trackEvent("lead_success", { leadId: json.leadId, from: "calculator" });
      
      // Confetes
      const colors = ["#ff4d2e", "#ffb199", "#ffffff", "#ff7a4d"];
      confetti({ particleCount: 70, spread: 60, colors });

      // Abre automaticamente o modal de pagamento
      onSelectPlan?.("forge");
    } catch (e) {
      setServerError("Falha de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setResults(null);
  };

  return (
    <section id="cadastro" className="relative py-16 sm:py-24 md:py-36 border-t border-white/5 bg-[oklch(0.10_0.005_20)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12 md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-primary">
            <Calculator className="h-3.5 w-3.5" />
            Ferramenta Interativa
          </div>
          <h2 className="font-display text-balance text-[clamp(2rem,5vw,4rem)] leading-[1] tracking-tight">
            Calcule sua <span className="gradient-text-ember">Meta Fitness</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-white/60 text-xs sm:text-sm">
            Descubra suas necessidades calóricas e obtenha um direcionamento personalizado da nossa equipe.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-4 sm:p-6 md:p-10 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {/* ETAPA 1: INPUT DOS PARAMETROS */}
            {step === "input" && (
              <motion.form
                key="step-input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCalculate}
                className="grid gap-6 md:grid-cols-2"
              >
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-white">Parâmetros Corporais</h3>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <label className="grid gap-1.5">
                      <span className="text-xs uppercase tracking-wider text-white/50">Gênero</span>
                      <select
                        value={calcData.gender}
                        onChange={(e) => setCalcData({ ...calcData, gender: e.target.value as any })}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 h-11 text-base sm:text-sm text-white outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="masculino" className="bg-[oklch(0.12_0.005_20)]">Masculino</option>
                        <option value="feminino" className="bg-[oklch(0.12_0.005_20)]">Feminino</option>
                      </select>
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-xs uppercase tracking-wider text-white/50">Idade (anos)</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={12}
                        max={100}
                        value={calcData.age}
                        onChange={(e) => setCalcData({ ...calcData, age: Number(e.target.value) })}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 h-11 text-base sm:text-sm text-white outline-none focus:border-primary"
                      />
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-xs uppercase tracking-wider text-white/50">Peso (kg)</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={40}
                        max={180}
                        value={calcData.weight}
                        onChange={(e) => setCalcData({ ...calcData, weight: Number(e.target.value) })}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 h-11 text-base sm:text-sm text-white outline-none focus:border-primary"
                      />
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-xs uppercase tracking-wider text-white/50">Altura (cm)</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={120}
                        max={220}
                        value={calcData.height}
                        onChange={(e) => setCalcData({ ...calcData, height: Number(e.target.value) })}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 h-11 text-base sm:text-sm text-white outline-none focus:border-primary"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-4">Nível de Atividade & Objetivo</h3>
                             <label className="grid gap-1.5 mb-4 w-full">
                      <span className="text-xs uppercase tracking-wider text-white/50">Nível de Atividade</span>
                      <select
                        value={calcData.activity}
                        onChange={(e) => setCalcData({ ...calcData, activity: Number(e.target.value) })}
                        className="w-full max-w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 h-11 text-base sm:text-sm text-white outline-none focus:border-primary cursor-pointer"
                      >
                        <option value={1.2} className="bg-[oklch(0.12_0.005_20)]">Sedentário (sem exercícios)</option>
                        <option value={1.375} className="bg-[oklch(0.12_0.005_20)]">Leve (exercício 1-3 dias/sem)</option>
                        <option value={1.55} className="bg-[oklch(0.12_0.005_20)]">Moderado (exercício 3-5 dias/sem)</option>
                        <option value={1.725} className="bg-[oklch(0.12_0.005_20)]">Intenso (treino pesado diário)</option>
                        <option value={1.9} className="bg-[oklch(0.12_0.005_20)]">Atleta (treino pesado diário + trabalho)</option>
                      </select>
                    </label>

                    <span className="text-xs uppercase tracking-wider text-white/50">Qual o seu objetivo?</span>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {[
                        { key: "emagrecimento", label: "Emagrecimento" },
                        { key: "hipertrofia", label: "Hipertrofia / Massa" },
                        { key: "performance", label: "Performance" },
                        { key: "condicionamento", label: "Definição" },
                      ].map((o) => (
                        <button
                          key={o.key}
                          type="button"
                          onClick={() => setCalcData({ ...calcData, goal: o.key as any })}
                          className={`rounded-lg border px-3 h-11 text-xs font-semibold transition-all focus:outline-none ${
                            calcData.goal === o.key
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 text-white/70 hover:border-white/20"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-6 flex w-full min-h-[44px] h-12 items-center justify-center gap-2 rounded-full gradient-ember py-3 text-sm font-semibold text-white hover:scale-[1.01] transition-transform focus:outline-none cursor-pointer"
                  >
                    Calcular Meu Plano
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.form>
            )}
            {/* ETAPA 2: CADASTRO DO LEAD (GATE) */}
            {step === "gate" && (
              <motion.div
                key="step-gate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto max-w-md text-center py-4"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary mx-auto mb-4">
                  <Flame className="h-6 w-6 animate-pulse" />
                </div>
                <h3 className="font-display text-2xl tracking-tight text-white">Excelente! Seus resultados estão prontos.</h3>
                <p className="mt-2 text-sm text-white/60">
                  Preencha o contato abaixo para desbloquear seu IMC, taxa metabólica, sugestões de macros e receber seu plano experimental.
                </p>

                <form 
                  onSubmit={handleSubmit(
                    onSubmitLead, 
                    (errors) => console.warn("[FitnessCalculator] Form validation failed:", errors)
                  )} 
                  className="mt-6 grid gap-4 text-left"
                >

                  <label className="grid gap-1">
                    <span className="text-xs uppercase tracking-wider text-white/50">Nome Completo</span>
                    <input
                      {...register("name")}
                      type="text"
                      required
                      placeholder="Seu nome"
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 h-11 text-base sm:text-sm text-white outline-none focus:border-primary"
                    />
                    {errors.name && <span className="text-xs text-red-400 mt-1">{errors.name.message}</span>}
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs uppercase tracking-wider text-white/50">WhatsApp</span>
                    <input
                      {...register("phone")}
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="(84) 99999-9999"
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 h-11 text-base sm:text-sm text-white outline-none focus:border-primary"
                    />
                    {errors.phone && <span className="text-xs text-red-400 mt-1">{errors.phone.message}</span>}
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs uppercase tracking-wider text-white/50">E-mail</span>
                    <input
                      {...register("email")}
                      type="email"
                      inputMode="email"
                      required
                      placeholder="exemplo@email.com"
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 h-11 text-base sm:text-sm text-white outline-none focus:border-primary"
                    />
                    {errors.email && <span className="text-xs text-red-400 mt-1">{errors.email.message}</span>}
                  </label>

                  {serverError && <p className="text-xs text-red-400 text-center">{serverError}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 flex w-full min-h-[44px] h-12 items-center justify-center gap-2 rounded-full gradient-ember py-3 text-sm font-semibold text-white disabled:opacity-55 hover:scale-[1.01] transition-transform focus:outline-none cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processando…
                      </>
                    ) : (
                      <>
                        Ver Meus Resultados <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("input")}
                    className="flex min-h-[44px] items-center justify-center text-xs text-white/40 hover:text-white/70 text-center mt-2 focus:outline-none cursor-pointer"
                  >
                    ← Voltar e ajustar parâmetros
                  </button>
                </form>
              </motion.div>
            )}

            {/* ETAPA 3: EXIBIÇÃO DE RESULTADOS COM GRÁFICO RECHARTS */}
            {step === "results" && results && (
              <motion.div
                key="step-results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid gap-8 md:grid-cols-[1.2fr_1fr]"
              >
                <div>
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Trophy className="h-4 w-4" />
                    Plano Personalizado Forjado
                  </div>
                  <h3 className="font-display text-3xl tracking-tight text-white mt-2">Suas Métricas Calculadas</h3>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:p-4 text-center">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/45">Seu IMC</p>
                      <p className="text-2xl sm:text-3xl font-display text-white mt-1.5 sm:mt-2">{results.bmi}</p>
                      <span className="inline-block mt-1 text-[10px] sm:text-[11px] rounded-full bg-primary/10 text-primary px-2 py-0.5">
                        {results.bmiCategory}
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:p-4 text-center">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/45">Calorias Sugeridas</p>
                      <p className="text-2xl sm:text-3xl font-display text-primary mt-1.5 sm:mt-2">{results.targetCalories}</p>
                      <span className="text-[9px] sm:text-[10px] text-white/40 block mt-1">kcal/dia</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-white/60">Gasto Calórico Diário (TDEE):</span>
                      <strong className="text-white">{results.tdee} kcal</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-white/60">Metabolismo Basal (TMB):</span>
                      <strong className="text-white">{Math.round(results.targetCalories * 0.75)} kcal</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-white/60">Foco do Plano de Treino:</span>
                      <strong className="text-primary">{goalLabels[calcData.goal as keyof typeof goalLabels]}</strong>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <a
                      href="#cadastro"
                      className="flex-1 flex items-center justify-center min-h-[44px] h-11 text-center rounded-full gradient-ember py-2 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Agendar Aula e Validar
                    </a>
                    <button
                      onClick={handleReset}
                      className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 sm:px-5 min-h-[44px] h-11 text-xs text-white/80 hover:bg-white/5 focus:outline-none cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Refazer
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.01] p-4 sm:p-6 text-center">
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Divisão de Macronutrientes</p>
                  
                  <div className="h-44 sm:h-56 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={results.macros}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {results.macros.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: "rgba(10, 6, 6, 0.9)", borderColor: "rgba(255, 255, 255, 0.1)" }}
                          itemStyle={{ color: "#fff" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-display text-white">{results.targetCalories}</span>
                      <span className="text-[10px] uppercase text-white/40">kcal/dia</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 text-center w-full">
                    {results.macros.map((m) => (
                      <div key={m.name} className="space-y-1">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                          <span className="text-[10px] text-white/50 uppercase">{m.name.slice(0, 4)}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{m.value}g</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
