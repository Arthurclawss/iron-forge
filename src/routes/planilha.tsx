import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Download,
  Link,
  Copy,
  Lock,
  LogOut,
  Search,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
  Layers,
  Sparkles,
  Info
} from "lucide-react";
import { goalLabels } from "@/lib/leads.schema";

export const Route = createFileRoute("/planilha")({
  head: () => ({ meta: [{ title: "Planilha de Leads — Iron Forge" }] }),
  component: PlanilhaPage,
});

interface LeadRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  goal: string;
  status: string;
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  best_contact_time?: string;
  notes?: string;
  booking_time?: string;
  booking_status?: string;
}

function PlanilhaPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [goalFilter, setGoalFilter] = useState("");
  const [showSheetsInfo, setShowSheetsInfo] = useState(false);

  // Verificação inicial
  useEffect(() => {
    // 1. Checa query param 'token'
    const params = new URLSearchParams(window.location.search);
    const queryToken = params.get("token");
    // 2. Checa localStorage
    const savedToken = localStorage.getItem("ironforge_leads_token");
    const tokenToTry = queryToken || savedToken;

    if (tokenToTry) {
      validateAndFetch(tokenToTry);
    } else {
      setLoading(false);
    }
  }, []);

  const validateAndFetch = async (token: string) => {
    setValidating(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/public/download-leads?token=${encodeURIComponent(token)}&format=json`);
      if (!res.ok) {
        throw new Error(res.status === 403 ? "Chave de acesso inválida." : "Erro de conexão com o servidor.");
      }
      const data = (await res.json()) as LeadRow[];
      
      // Salva token e dados
      setLeads(data);
      setActiveToken(token);
      localStorage.setItem("ironforge_leads_token", token);
      
      // Limpa token da URL para manter a URL limpa
      const url = new URL(window.location.href);
      if (url.searchParams.has("token")) {
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha de autenticação");
      localStorage.removeItem("ironforge_leads_token");
      setActiveToken(null);
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    validateAndFetch(tokenInput.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem("ironforge_leads_token");
    setActiveToken(null);
    setLeads([]);
    setTokenInput("");
  };

  const handleCopyLink = () => {
    if (!activeToken) return;
    const downloadUrl = `${window.location.origin}/api/public/download-leads?token=${activeToken}`;
    navigator.clipboard.writeText(downloadUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyScript = () => {
    const scriptText = `function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const d = JSON.parse(e.postData.contents);
  
  if (d.event === "booking") {
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const emailToFind = d.email || "";
    const phoneToFind = d.phone || "";
    
    let foundRowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if ((emailToFind && row[2] == emailToFind) || (phoneToFind && row[3] == phoneToFind)) {
        foundRowIndex = i + 1;
        break;
      }
    }
    
    if (foundRowIndex !== -1) {
      if (values[0].length < 10 || values[0][9] !== "Agendamento") {
        sheet.getRange(1, 10).setValue("Agendamento");
      }
      sheet.getRange(foundRowIndex, 10).setValue(d.booking_time);
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, updated: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      sheet.appendRow([
        new Date(d.created_at || Date.now()),
        d.name || "Agendamento Avulso",
        d.email || "",
        d.phone || "",
        "", "", "", d.notes || "", "", d.booking_time || ""
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, appended: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    const dataRange = sheet.getDataRange();
    if (dataRange.getLastColumn() < 10) {
      sheet.getRange(1, 10).setValue("Agendamento");
    }
    sheet.appendRow([
      new Date(d.created_at || Date.now()),
      d.name || "",
      d.email || "",
      d.phone || "",
      d.goal || "",
      d.source || "",
      d.utm_source || "",
      d.notes || "",
      d.best_contact_time || "",
      d.booking_time || ""
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Filtragem local
  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery);
    const matchGoal = !goalFilter || l.goal === goalFilter;
    return matchSearch && matchGoal;
  });

  // KPIs calculados
  const totalLeads = leads.length;
  const todayLeads = leads.filter((l) => {
    const d = new Date(l.created_at);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  }).length;

  const calculatorLeads = leads.filter((l) => l.source === "calculator").length;

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[oklch(0.08_0.005_20)] text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-white/50">Carregando dados da planilha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.005_20)] text-white font-sans selection:bg-primary selection:text-white">
      <AnimatePresence mode="wait">
        {!activeToken ? (
          // LOCK SCREEN
          <motion.div
            key="lock-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid min-h-screen place-items-center px-4"
          >
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-xl">
              {/* Decorative Glow */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent -z-10" />

              <div className="flex flex-col items-center text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 border border-primary/25 text-primary mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl tracking-tight">Planilha de Leads</h1>
                <p className="mt-2 text-sm text-white/50 max-w-xs">
                  Insira a chave de acesso da Iron Forge para baixar a planilha e monitorar os alunos cadastrados.
                </p>
              </div>

              <form onSubmit={handleAccess} className="mt-8 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-white/40 block">Chave de acesso</label>
                  <input
                    type="password"
                    required
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Digite a chave da planilha..."
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-primary focus:bg-white/[0.05]"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={validating}
                  className="w-full flex items-center justify-center gap-2 rounded-full gradient-ember py-3.5 text-sm font-semibold text-white ember-glow disabled:opacity-60 transition-all hover:scale-[1.01]"
                >
                  {validating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Validando chave...
                    </>
                  ) : (
                    <>
                      Acessar Planilha <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-[10px] text-white/30 uppercase tracking-widest">
                  Iron Forge Premium Strength Club
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          // DASHBOARD
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen"
          >
            {/* Header */}
            <header className="border-b border-white/10 px-6 py-4 md:px-10 bg-white/[0.01] backdrop-blur-md sticky top-0 z-30">
              <div className="mx-auto flex max-w-7xl items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg gradient-ember">
                    <Flame className="h-4 w-4 text-white" />
                  </span>
                  <div>
                    <h1 className="font-display text-lg md:text-xl tracking-tight">Leads & Planilha</h1>
                    <p className="text-[10px] text-white/40 hidden sm:block">Monitoramento em tempo real dos cadastros</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/"
                    className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-xs text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    Voltar para o site
                  </a>
                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-1.5"
                  >
                    <LogOut className="h-3 w-3" /> Sair
                  </button>
                </div>
              </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-7xl px-6 py-8 md:px-10 flex-1 w-full space-y-8">
              
              {/* KPI cards */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 relative overflow-hidden group">
                  <div className="absolute top-4 right-4 text-primary opacity-30 group-hover:opacity-75 transition-opacity">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div className="text-xs uppercase tracking-[0.15em] text-white/40">Total de Cadastros</div>
                  <div className="mt-2 font-display text-3xl tracking-tight tabular-nums text-white group-hover:text-primary transition-colors">
                    {totalLeads}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 relative overflow-hidden group">
                  <div className="absolute top-4 right-4 text-emerald-400 opacity-30 group-hover:opacity-75 transition-opacity">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="text-xs uppercase tracking-[0.15em] text-white/40">Cadastros Hoje</div>
                  <div className="mt-2 font-display text-3xl tracking-tight tabular-nums text-emerald-400">
                    {todayLeads}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 relative overflow-hidden group">
                  <div className="absolute top-4 right-4 text-blue-400 opacity-30 group-hover:opacity-75 transition-opacity">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="text-xs uppercase tracking-[0.15em] text-white/40">Via Calculadora</div>
                  <div className="mt-2 font-display text-3xl tracking-tight tabular-nums text-blue-400">
                    {calculatorLeads}
                  </div>
                </div>
              </div>

              {/* Actions & Buttons */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.02] to-transparent p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">Planilha em Tempo Real</h3>
                  <p className="text-xs text-white/50 max-w-xl">
                    Cada formulário enviado no site (incluindo a calculadora fitness) grava o lead instantaneamente no banco de dados e alimenta esta planilha.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`/api/public/download-leads?token=${encodeURIComponent(activeToken)}`}
                    className="inline-flex items-center gap-2 rounded-full gradient-ember px-5 py-3 text-xs font-semibold text-white ember-glow hover:scale-[1.02] transition-transform"
                    title="Baixar planilha compatível com Microsoft Excel"
                  >
                    <Download className="h-4 w-4" /> Baixar Planilha (Excel / CSV)
                  </a>

                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-semibold hover:bg-white/10 transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-primary animate-scale-up" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4" /> Copiar Link da Planilha
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowSheetsInfo(!showSheetsInfo)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-white/70 hover:text-white"
                  >
                    <Info className="h-4 w-4" /> Sincronizar Google Sheets
                  </button>
                </div>
              </div>

              {/* Google Sheets Sync Guide */}
              <AnimatePresence>
                {showSheetsInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <h4 className="font-semibold text-sm text-primary flex items-center gap-1.5">
                          <span>🚀 Redundância no Google Sheets (Automatizado)</span>
                        </h4>
                        <button
                          onClick={handleCopyScript}
                          className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 flex items-center gap-1"
                        >
                          {copiedScript ? "Copiado!" : "Copiar Script"}
                        </button>
                      </div>

                      <p className="text-white/60">
                        Se você preferir visualizar seus leads diretamente no Google Sheets em tempo real, você pode configurar o Apps Script na sua própria planilha:
                      </p>

                      <ol className="list-decimal list-inside space-y-2 text-white/50 pl-2">
                        <li>Crie uma nova planilha vazia no Google Sheets.</li>
                        <li>Clique em <strong>Extensões</strong> &gt; <strong>Apps Script</strong>.</li>
                        <li>Apague todo o código existente, cole o script acima e salve.</li>
                        <li>Clique em <strong>Implantar</strong> &gt; <strong>Nova implantação</strong>.</li>
                        <li>Escolha <strong>App da Web</strong>, configure Executar como "Eu" e Quem pode acessar "Qualquer pessoa".</li>
                        <li>Implante, conceda permissões de acesso e copie a <strong>URL do App da Web</strong> gerada.</li>
                        <li>Configure no seu painel de ambiente com o nome de variável <code className="text-primary font-mono text-[11px] bg-white/5 px-1 rounded">GOOGLE_SHEETS_WEBHOOK_URL</code>.</li>
                      </ol>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Table section */}
              <div className="space-y-4">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, email ou WhatsApp..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">Filtrar objetivo:</span>
                    <select
                      value={goalFilter}
                      onChange={(e) => setGoalFilter(e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-primary"
                    >
                      <option value="" className="bg-[oklch(0.12_0.005_20)]">Todos</option>
                      {Object.entries(goalLabels).map(([key, label]) => (
                        <option key={key} value={key} className="bg-[oklch(0.12_0.005_20)]">
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main Table Card */}
                <div className="rounded-xl border border-white/10 bg-white/[0.01] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-white/[0.04] text-[10px] uppercase tracking-wider text-white/40 border-b border-white/10">
                          <th className="px-5 py-4 font-semibold">Nome</th>
                          <th className="px-5 py-4 font-semibold">WhatsApp</th>
                          <th className="px-5 py-4 font-semibold">Objetivo</th>
                          <th className="px-5 py-4 font-semibold text-primary">Agendamento</th>
                          <th className="px-5 py-4 font-semibold">Origem</th>
                          <th className="px-5 py-4 font-semibold">Melhor Horário</th>
                          <th className="px-5 py-4 font-semibold">Data Cadastro</th>
                          <th className="px-5 py-4 font-semibold">Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-5 py-12 text-center text-white/30">
                              Nenhum cadastro encontrado para os filtros selecionados.
                            </td>
                          </tr>
                        ) : (
                          filteredLeads.map((l) => (
                            <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="px-5 py-4 font-medium">
                                <div className="font-semibold text-white">{l.name}</div>
                                <div className="text-[10px] text-white/40 mt-0.5">{l.email}</div>
                              </td>
                              <td className="px-5 py-4">
                                <a
                                  href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                                >
                                  {l.phone} <ExternalLink className="h-3 w-3" />
                                </a>
                              </td>
                              <td className="px-5 py-4">
                                <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] text-primary font-medium">
                                  {goalLabels[l.goal as keyof typeof goalLabels] ?? l.goal}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-medium text-primary">
                                {l.booking_time ? (
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                    {new Date(l.booking_time).toLocaleString("pt-BR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </span>
                                ) : (
                                  <span className="text-white/20">—</span>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
                                  {l.source === "calculator" ? "Calculadora Fitness" : "Site Principal"}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-white/70">
                                {l.best_contact_time || "Qualquer horário"}
                              </td>
                              <td className="px-5 py-4 text-white/50">
                                {new Date(l.created_at).toLocaleString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </td>
                              <td className="px-5 py-4 text-white/60 max-w-xs truncate" title={l.notes}>
                                {l.notes || "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Row count */}
                <div className="flex items-center justify-between text-xs text-white/40 px-2">
                  <span>
                    Mostrando <strong>{filteredLeads.length}</strong> de {totalLeads} cadastros
                  </span>
                  <span>Chave de acesso: <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-[10px] text-primary">{activeToken}</code></span>
                </div>
              </div>

            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-6 text-center text-xs text-white/30">
              Iron Forge Premium Strength Club · Leads Spreadsheet Area
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
