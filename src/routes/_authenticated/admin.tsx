import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getLeads, getLeadStats, updateLeadStatus, getBookings, updateBookingStatus } from "@/lib/leads.functions";
import { searchLeads, addLeadNote, getLeadNotes, deleteLeadNote, exportLeadsCsv } from "@/lib/customers.functions";
import { LEAD_STATUSES, statusLabels, goalLabels, type LeadStatus } from "@/lib/leads.schema";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import {
  Kanban as KanbanIcon,
  Table as TableIcon,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Download,
  Calendar,
  LogOut,
  Users
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Iron Forge" }] }),
  component: AdminDashboard,
});

const FILTERS: { label: string; days: number | undefined }[] = [
  { label: "Hoje", days: 1 },
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
  { label: "Tudo", days: undefined },
];

function AdminDashboard() {
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "charts" | "bookings">("kanban");
  const [filterIdx, setFilterIdx] = useState(2);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const filter = FILTERS[filterIdx];
  const qc = useQueryClient();

  const fetchLeads = useServerFn(getLeads);
  const fetchStats = useServerFn(getLeadStats);
  const doSearch = useServerFn(searchLeads);
  const updateStatus = useServerFn(updateLeadStatus);
  const doExport = useServerFn(exportLeadsCsv);
  const fetchBookings = useServerFn(getBookings);
  const doUpdateBooking = useServerFn(updateBookingStatus);

  const isSearching = !!search || !!statusFilter;

  const leadsQ = useQuery({
    queryKey: isSearching ? ["leads-search", search, statusFilter] : ["leads", filter.days],
    queryFn: () =>
      isSearching
        ? doSearch({ data: { q: search || undefined, status: (statusFilter || undefined) as any } })
        : fetchLeads({ data: { days: filter.days } }),
  });

  const statsQ = useQuery({
    queryKey: ["lead-stats"],
    queryFn: () => fetchStats(),
  });

  const updateMut = useMutation({
    mutationFn: (v: { id: string; status: LeadStatus }) => updateStatus({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["leads-search"] });
      qc.invalidateQueries({ queryKey: ["lead-stats"] });
    },
  });

  const bookingsQ = useQuery({
    queryKey: ["bookings-list"],
    queryFn: () => fetchBookings(),
    enabled: viewMode === "bookings",
  });

  const updateBookingMut = useMutation({
    mutationFn: (v: { id: string; status: "agendado" | "confirmado" | "cancelado" | "concluido" }) =>
      doUpdateBooking({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings-list"] });
    },
  });

  const shiftStatus = (leadId: string, currentStatus: LeadStatus, direction: "left" | "right") => {
    const idx = LEAD_STATUSES.indexOf(currentStatus);
    const nextIdx = direction === "left" ? idx - 1 : idx + 1;
    if (nextIdx >= 0 && nextIdx < LEAD_STATUSES.length) {
      updateMut.mutate({ id: leadId, status: LEAD_STATUSES[nextIdx] });
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const result = await doExport();
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-iron-forge-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Falha ao exportar.");
    } finally {
      setExportLoading(false);
    }
  };

  const isAccessDenied =
    leadsQ.error?.message?.includes("Acesso negado") ||
    statsQ.error?.message?.includes("Acesso negado");

  if (isAccessDenied) {
    return (
      <div className="grid min-h-screen place-items-center bg-[oklch(0.08_0.005_20)] px-4 text-center text-white">
        <div className="max-w-md">
          <h1 className="font-display text-3xl text-primary">Acesso negado</h1>
          <p className="mt-3 text-sm text-white/60">
            Sua conta não possui permissão de administrador. Peça a um administrador para conceder a role
            <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5">admin</code> ao seu usuário.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/auth";
            }}
            className="mt-6 rounded-full border border-white/15 px-5 py-2 text-sm hover:bg-white/10"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  const leads = leadsQ.data ?? [];

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.005_20)] text-white">
      <header className="border-b border-white/10 px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-tight">Iron Forge — CRM</h1>
            <p className="text-xs text-white/50">Pipeline e métricas de leads</p>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href="/clientes"
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs hover:bg-white/10 flex items-center gap-1"
            >
              <Users className="h-3 w-3 text-primary" /> Clientes →
            </a>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/auth";
              }}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs hover:bg-white/10 flex items-center gap-1"
            >
              <LogOut className="h-3 w-3" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Total de leads" value={statsQ.data?.total ?? "—"} />
          <Kpi label="Últimos 30 dias" value={statsQ.data?.month ?? "—"} />
          <Kpi
            label="Conversão"
            value={statsQ.data ? `${statsQ.data.conversion.toFixed(1)}%` : "—"}
          />
          <Kpi label="Origem principal" value={statsQ.data?.topSource ?? "—"} />
        </div>

        {/* View Mode Tabs */}
        <div className="mt-8 flex gap-2 border-b border-white/5 pb-4">
          {[
            { id: "kanban", label: "Pipeline Kanban", icon: KanbanIcon },
            { id: "table", label: "Visualização Tabela", icon: TableIcon },
            { id: "charts", label: "Gráficos & Insights", icon: BarChart3 },
            { id: "bookings", label: "Agendamentos", icon: Calendar },
          ].map((mode) => {
            const Icon = mode.icon;
            const active = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                  active
                    ? "gradient-ember text-white shadow-lg shadow-primary/10"
                    : "border border-white/10 text-white/60 hover:border-white/20"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Filtros: Visíveis em Kanban e Tabela */}
        {viewMode !== "charts" && viewMode !== "bookings" && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {!isSearching && FILTERS.map((f, i) => (
                <button
                  key={f.label}
                  onClick={() => setFilterIdx(i)}
                  className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                    i === filterIdx
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-white/15 text-white/60 hover:border-white/30"
                  }`}
                >
                  {f.label}
                </button>
              ))}

              {/* Filtro de status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "")}
                className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="">Todos os status</option>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-[oklch(0.12_0.005_20)]">
                    {statusLabels[s]}
                  </option>
                ))}
              </select>

              {/* Busca textual */}
              <input
                type="search"
                placeholder="Buscar por nome, email ou telefone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="self-start rounded-full border border-white/20 px-4 py-1.5 text-xs hover:bg-white/10 disabled:opacity-50 sm:self-auto flex items-center gap-1.5"
            >
              <Download className="h-3 w-3" />
              {exportLoading ? "Exportando…" : "Exportar CSV"}
            </button>
          </div>
        )}

        {/* LOADING / EMPTY STATES */}
        {leadsQ.isLoading && viewMode !== "charts" && (
          <div className="py-20 text-center text-white/40">Carregando dados...</div>
        )}

        {/* VIEW 1: KANBAN BOARD */}
        {viewMode === "kanban" && !leadsQ.isLoading && (
          <div className="mt-6 grid grid-cols-1 gap-4 overflow-x-auto pb-4 md:grid-cols-5 min-w-[1000px]">
            {LEAD_STATUSES.map((status) => {
              const list = leads.filter((l) => l.status === status);
              const columnColors: Record<LeadStatus, string> = {
                novo: "border-blue-500/20 bg-blue-500/[0.02]",
                contatado: "border-yellow-500/20 bg-yellow-500/[0.02]",
                interessado: "border-purple-500/20 bg-purple-500/[0.02]",
                matriculado: "border-emerald-500/20 bg-emerald-500/[0.02]",
                perdido: "border-red-500/20 bg-red-500/[0.02]",
              };
              const headerColors: Record<LeadStatus, string> = {
                novo: "text-blue-400 bg-blue-500/10",
                contatado: "text-yellow-400 bg-yellow-500/10",
                interessado: "text-purple-400 bg-purple-500/10",
                matriculado: "text-emerald-400 bg-emerald-500/10",
                perdido: "text-red-400 bg-red-500/10",
              };

              return (
                <div
                  key={status}
                  className={`rounded-2xl border p-4 flex flex-col min-h-[500px] ${columnColors[status]}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${headerColors[status]}`}>
                      {statusLabels[status]}
                    </span>
                    <span className="text-xs text-white/40 font-bold">{list.length}</span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[60vh] pr-1">
                    {list.map((l: any) => (
                      <div
                        key={l.id}
                        className="rounded-xl border border-white/5 bg-white/[0.03] p-3 space-y-3 hover:border-white/15 transition-all"
                      >
                        <div>
                          <p className="text-xs font-semibold text-white line-clamp-1">{l.name}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{l.email}</p>
                        </div>

                        <div className="flex flex-wrap gap-1 text-[9px] uppercase tracking-wider">
                          <span className="rounded bg-white/5 px-1.5 py-0.5 text-white/70">
                            {goalLabels[l.goal as keyof typeof goalLabels] ?? l.goal}
                          </span>
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">
                            {l.source === "calculator" ? "Calculadora" : l.source}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <button
                            onClick={() => setSelectedLead(l)}
                            className="text-[10px] text-white/50 hover:text-white flex items-center gap-1"
                          >
                            <MessageSquare className="h-3 w-3" /> Notas
                          </button>

                          <div className="flex gap-1">
                            <button
                              disabled={status === "novo"}
                              onClick={() => shiftStatus(l.id, status, "left")}
                              className="rounded border border-white/10 p-1 text-white/45 hover:text-white disabled:opacity-30"
                              title="Mover para esquerda"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <button
                              disabled={status === "perdido"}
                              onClick={() => shiftStatus(l.id, status, "right")}
                              className="rounded border border-white/10 p-1 text-white/45 hover:text-white disabled:opacity-30"
                              title="Mover para direita"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {list.length === 0 && (
                      <div className="h-28 flex items-center justify-center border border-dashed border-white/5 rounded-xl text-xs text-white/20">
                        Sem leads
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: ORIGINAL DETAILS TABLE */}
        {viewMode === "table" && !leadsQ.isLoading && (
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <Th>Nome</Th>
                  <Th>WhatsApp</Th>
                  <Th>Objetivo</Th>
                  <Th>Origem</Th>
                  <Th>Data</Th>
                  <Th>Status</Th>
                  <Th>Notas</Th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-white/40">
                      Nenhum lead encontrado.
                    </td>
                  </tr>
                )}
                {leads.map((l: any) => (
                  <tr key={l.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <Td>
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-white/40">{l.email}</div>
                    </Td>
                    <Td>
                      <a
                        href={`https://wa.me/${l.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-300 hover:underline"
                      >
                        {l.phone}
                      </a>
                    </Td>
                    <Td>{goalLabels[l.goal as keyof typeof goalLabels] ?? l.goal}</Td>
                    <Td className="text-white/60">{l.source}</Td>
                    <Td className="text-white/60">
                      {new Date(l.created_at).toLocaleString("pt-BR")}
                    </Td>
                    <Td>
                      <select
                        value={l.status}
                        onChange={(e) =>
                          updateMut.mutate({ id: l.id, status: e.target.value as LeadStatus })
                        }
                        className="rounded-md border border-white/15 bg-white/[0.05] px-2 py-1 text-xs outline-none"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-[oklch(0.12_0.005_20)]">
                            {statusLabels[s]}
                          </option>
                        ))}
                      </select>
                    </Td>
                    <Td>
                      <button
                        onClick={() => setSelectedLead(l)}
                        className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
                      >
                        Ver notas
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 3: RECHARTS DASHBOARD CHARTS */}
        {viewMode === "charts" && !leadsQ.isLoading && (
          <LeadCharts leads={leads} />
        )}

        {/* VIEW 4: BOOKINGS TABLE */}
        {viewMode === "bookings" && !bookingsQ.isLoading && (
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <Th>Lead (Aluno)</Th>
                  <Th>WhatsApp</Th>
                  <Th>Data / Horário</Th>
                  <Th>Status</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {(bookingsQ.data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-white/40">
                      Nenhum agendamento encontrado.
                    </td>
                  </tr>
                )}
                {(bookingsQ.data ?? []).map((b: any) => (
                  <tr key={b.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <Td>
                      <div className="font-medium">{b.leads?.name || "Sem nome"}</div>
                      <div className="text-xs text-white/40">{b.leads?.email}</div>
                    </Td>
                    <Td>
                      {b.leads?.phone ? (
                        <a
                          href={`https://wa.me/${b.leads.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-300 hover:underline"
                        >
                          {b.leads.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td className="text-white/80 font-medium">
                      {new Date(b.booking_time).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Td>
                    <Td>
                      <select
                        value={b.status}
                        onChange={(e) =>
                          updateBookingMut.mutate({ id: b.id, status: e.target.value as any })
                        }
                        className="rounded-md border border-white/15 bg-white/[0.05] px-2 py-1 text-xs outline-none"
                      >
                        <option value="agendado" className="bg-[oklch(0.12_0.005_20)]">Agendado</option>
                        <option value="confirmado" className="bg-[oklch(0.12_0.005_20)]">Confirmado</option>
                        <option value="cancelado" className="bg-[oklch(0.12_0.005_20)]">Cancelado</option>
                        <option value="concluido" className="bg-[oklch(0.12_0.005_20)]">Concluído</option>
                      </select>
                    </Td>
                    <Td>
                      <button
                        onClick={() => setSelectedLead(b.leads)}
                        disabled={!b.leads}
                        className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-40"
                      >
                        Ver Ficha
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Painel de notas */}
      {selectedLead && (
        <LeadNotesPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recharts Analytics Panel Component
// ---------------------------------------------------------------------------
function LeadCharts({ leads }: { leads: any[] }) {
  // 1. Leads por data
  const formatTimelineData = () => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      const date = new Date(l.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      counts[date] = (counts[date] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([date, value]) => ({ date, cadastros: value }))
      .reverse()
      .slice(-15);
  };

  // 2. Funil por status
  const formatFunnelData = () => {
    return LEAD_STATUSES.map((status) => ({
      name: statusLabels[status],
      leads: leads.filter((l) => l.status === status).length,
    }));
  };

  // 3. Origem
  const formatSourceData = () => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      const s = l.source || "direct";
      counts[s] = (counts[s] ?? 0) + 1;
    });
    const colors = ["#ff4d2e", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];
    return Object.entries(counts).map(([name, value], i) => ({
      name: name === "direct" ? "Direto" : name === "calculator" ? "Calculadora" : name,
      value,
      color: colors[i % colors.length],
    }));
  };

  const timelineData = formatTimelineData();
  const funnelData = formatFunnelData();
  const sourceData = formatSourceData();

  return (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      {/* Grafico de Linha / Area */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Volume de Cadastros (Últimos dias)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4d2e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ff4d2e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(10, 6, 6, 0.9)", borderColor: "rgba(255,255,255,0.1)" }}
                itemStyle={{ color: "#fff" }}
              />
              <Area type="monotone" dataKey="cadastros" stroke="#ff4d2e" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funil de Conversão */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">
          Funil por Status do CRM
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData}>
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(10, 6, 6, 0.9)", borderColor: "rgba(255,255,255,0.1)" }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="leads" fill="#ff4d2e" radius={[4, 4, 0, 0]}>
                {funnelData.map((entry, index) => {
                  const colors = ["#3b82f6", "#eab308", "#a855f7", "#10b981", "#ef4444"];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Origem dos Leads (Pie) */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:col-span-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">
          Canais de Origem (UTM Source / Ref)
        </h3>
        <div className="grid md:grid-cols-[1.5fr_1fr] items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(10, 6, 6, 0.9)", borderColor: "rgba(255,255,255,0.1)" }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {sourceData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs border-b border-white/5 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-white/80">{d.name}</span>
                </div>
                <strong className="text-white">{d.value} leads</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Painel lateral de notas de lead
// ---------------------------------------------------------------------------
function LeadNotesPanel({ lead, onClose }: { lead: any; onClose: () => void }) {
  const [body, setBody] = useState("");
  const qc = useQueryClient();

  const fetchNotes = useServerFn(getLeadNotes);
  const doAdd = useServerFn(addLeadNote);
  const doDelete = useServerFn(deleteLeadNote);

  const notesQ = useQuery({
    queryKey: ["lead-notes", lead.id],
    queryFn: () => fetchNotes({ data: { leadId: lead.id } }),
  });

  const addMut = useMutation({
    mutationFn: () => doAdd({ data: { leadId: lead.id, body } }),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["lead-notes", lead.id] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (noteId: string) => doDelete({ data: { noteId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lead-notes", lead.id] }),
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[oklch(0.10_0.005_20)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-semibold">{lead.name}</p>
            <p className="text-xs text-white/40">{lead.email}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        {/* Info rápida */}
        <div className="border-b border-white/10 px-5 py-3 text-xs text-white/50 grid grid-cols-2 gap-1">
          <span>WhatsApp: <span className="text-white/70">{lead.phone}</span></span>
          <span>Objetivo: <span className="text-white/70">{goalLabels[lead.goal] ?? lead.goal}</span></span>
          <span>Origem: <span className="text-white/70">{lead.source}</span></span>
          <span>Horário: <span className="text-white/70">{lead.best_contact_time || "—"}</span></span>
          {lead.notes && <span className="col-span-2">Obs: <span className="text-white/70">{lead.notes}</span></span>}
        </div>

        {/* Notas */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <p className="text-xs uppercase tracking-wider text-white/30">Histórico de anotações</p>
          {notesQ.isLoading && <p className="text-xs text-white/30">Carregando…</p>}
          {notesQ.data?.length === 0 && (
            <p className="text-xs text-white/30">Nenhuma anotação ainda.</p>
          )}
          {notesQ.data?.map((n: any) => (
            <div key={n.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-sm text-white/80">{n.body}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-white/30">
                  {new Date(n.created_at).toLocaleString("pt-BR")}
                </span>
                <button
                  onClick={() => deleteMut.mutate(n.id)}
                  className="text-xs text-red-400/60 hover:text-red-300"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Adicionar nota */}
        <div className="border-t border-white/10 px-5 py-4 space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Adicionar anotação…"
            className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary resize-none"
          />
          <button
            onClick={() => body.trim() && addMut.mutate()}
            disabled={!body.trim() || addMut.isPending}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
          >
            {addMut.isPending ? "Salvando…" : "Salvar anotação"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------
function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-2 font-display text-3xl tracking-tight">{value}</div>
    </div>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 font-medium">{children}</th>
);
const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 align-top ${className ?? ""}`}>{children}</td>
);
