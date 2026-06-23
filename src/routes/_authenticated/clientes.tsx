import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getCustomers,
  getCustomerStats,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/lib/customers.functions";
import {
  customerFormSchema,
  type CustomerFormInput,
  CUSTOMER_PLANS,
  CUSTOMER_STATUSES,
  planLabels,
  statusLabels,
} from "@/lib/customers.schema";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Iron Forge" }] }),
  component: ClientesPage,
});

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

function ClientesPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const fetchCustomers = useServerFn(getCustomers);
  const fetchStats = useServerFn(getCustomerStats);
  const doCreate = useServerFn(createCustomer);
  const doUpdate = useServerFn(updateCustomer);
  const doDelete = useServerFn(deleteCustomer);

  const customersQ = useQuery({
    queryKey: ["customers", filterStatus, search],
    queryFn: () =>
      fetchCustomers({ data: { status: (filterStatus || undefined) as any, search: search || undefined } }),
  });

  const statsQ = useQuery({
    queryKey: ["customer-stats"],
    queryFn: () => fetchStats(),
  });

  const createMut = useMutation({
    mutationFn: (v: CustomerFormInput) => doCreate({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customer-stats"] });
      setShowForm(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: (v: CustomerFormInput & { id: string }) => doUpdate({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setEditingId(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => doDelete({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customer-stats"] });
    },
  });

  const stats = statsQ.data;
  const customers = customersQ.data ?? [];
  const editingCustomer = customers.find((c: any) => c.id === editingId);

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.005_20)] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-tight">Iron Forge — Clientes</h1>
            <p className="text-xs text-white/50">Cadastro e gestão de alunos</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin"
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs hover:bg-white/10"
            >
              ← Leads
            </a>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/auth";
              }}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs hover:bg-white/10"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Total de clientes" value={stats?.total ?? "—"} />
          <Kpi label="Ativos" value={stats?.ativos ?? "—"} />
          <Kpi
            label="MRR"
            value={
              stats?.mrr != null
                ? `R$ ${stats.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                : "—"
            }
          />
          <Kpi label="Novos (30 dias)" value={stats?.newThisMonth ?? "—"} />
        </div>

        {/* Barra de ações */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Filtro status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white"
            >
              <option value="">Todos os status</option>
              {CUSTOMER_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[oklch(0.12_0.005_20)]">
                  {statusLabels[s]}
                </option>
              ))}
            </select>

            {/* Busca */}
            <input
              type="search"
              placeholder="Buscar por nome, email ou telefone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="self-start rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 sm:self-auto"
          >
            + Novo cliente
          </button>
        </div>

        {/* Tabela */}
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/50">
              <tr>
                <Th>Nome</Th>
                <Th>WhatsApp</Th>
                <Th>Plano</Th>
                <Th>Status</Th>
                <Th>MRR</Th>
                <Th>Cadastro</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {customersQ.isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/40">
                    Carregando…
                  </td>
                </tr>
              )}
              {!customersQ.isLoading && customers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/40">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
              {customers.map((c: any) => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <Td>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-white/40">{c.email}</div>
                  </Td>
                  <Td>
                    <a
                      href={`https://wa.me/${c.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-300 hover:underline"
                    >
                      {c.phone}
                    </a>
                  </Td>
                  <Td>{planLabels[c.plan as keyof typeof planLabels] ?? c.plan}</Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td className="text-white/70">
                    {c.monthly_value != null
                      ? `R$ ${Number(c.monthly_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </Td>
                  <Td className="text-white/50 text-xs">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(c.id)}
                        className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir ${c.name}?`)) deleteMut.mutate(c.id);
                        }}
                        className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        Excluir
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal novo cliente */}
      {showForm && (
        <Modal title="Novo cliente" onClose={() => setShowForm(false)}>
          <CustomerForm
            onSubmit={(v) => createMut.mutateAsync(v)}
            loading={createMut.isPending}
            error={createMut.error?.message}
          />
        </Modal>
      )}

      {/* Modal editar cliente */}
      {editingId && editingCustomer && (
        <Modal title="Editar cliente" onClose={() => setEditingId(null)}>
          <CustomerForm
            defaultValues={editingCustomer as any}
            onSubmit={(v) => updateMut.mutateAsync({ ...v, id: editingId })}
            loading={updateMut.isPending}
            error={updateMut.error?.message}
          />
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formulário de cliente
// ---------------------------------------------------------------------------

function CustomerForm({
  defaultValues,
  onSubmit,
  loading,
  error,
}: {
  defaultValues?: Partial<CustomerFormInput>;
  onSubmit: (v: CustomerFormInput) => Promise<unknown>;
  loading?: boolean;
  error?: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormInput>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { status: "ativo", plan: "outro", ...defaultValues },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-4 max-h-[70vh] overflow-y-auto pr-1"
    >
      <Section title="Dados pessoais">
        <FormRow>
          <Field label="Nome completo *" error={errors.name?.message}>
            <input {...register("name")} type="text" className={inputCls(!!errors.name)} placeholder="Nome completo" />
          </Field>
          <Field label="CPF" error={errors.cpf?.message}>
            <input {...register("cpf")} type="text" className={inputCls(!!errors.cpf)} placeholder="000.000.000-00" />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Email *" error={errors.email?.message}>
            <input {...register("email")} type="email" className={inputCls(!!errors.email)} placeholder="email@exemplo.com" />
          </Field>
          <Field label="WhatsApp *" error={errors.phone?.message}>
            <input {...register("phone")} type="tel" className={inputCls(!!errors.phone)} placeholder="(11) 99999-9999" />
          </Field>
        </FormRow>
        <Field label="Data de nascimento" error={errors.birth_date?.message}>
          <input {...register("birth_date")} type="date" className={inputCls(false)} />
        </Field>
      </Section>

      <Section title="Plano / contrato">
        <FormRow>
          <Field label="Plano *" error={errors.plan?.message}>
            <select {...register("plan")} className={inputCls(!!errors.plan)}>
              {CUSTOMER_PLANS.map((p) => (
                <option key={p} value={p} className="bg-[oklch(0.12_0.005_20)]">
                  {planLabels[p]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status *" error={errors.status?.message}>
            <select {...register("status")} className={inputCls(!!errors.status)}>
              {CUSTOMER_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[oklch(0.12_0.005_20)]">
                  {statusLabels[s]}
                </option>
              ))}
            </select>
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Início do plano" error={errors.plan_start?.message}>
            <input {...register("plan_start")} type="date" className={inputCls(false)} />
          </Field>
          <Field label="Vencimento" error={errors.plan_end?.message}>
            <input {...register("plan_end")} type="date" className={inputCls(false)} />
          </Field>
        </FormRow>
        <Field label="Mensalidade (R$)" error={errors.monthly_value?.message}>
          <input {...register("monthly_value")} type="number" step="0.01" min="0" className={inputCls(!!errors.monthly_value)} placeholder="249.00" />
        </Field>
      </Section>

      <Section title="Endereço (opcional)">
        <Field label="Rua / Av." error={errors.address_street?.message}>
          <input {...register("address_street")} type="text" className={inputCls(false)} placeholder="Rua Exemplo, 123" />
        </Field>
        <FormRow>
          <Field label="Cidade" error={errors.address_city?.message}>
            <input {...register("address_city")} type="text" className={inputCls(false)} placeholder="São Paulo" />
          </Field>
          <Field label="Estado" error={errors.address_state?.message}>
            <input {...register("address_state")} type="text" maxLength={2} className={inputCls(false)} placeholder="SP" />
          </Field>
          <Field label="CEP" error={errors.address_zip?.message}>
            <input {...register("address_zip")} type="text" className={inputCls(false)} placeholder="00000-000" />
          </Field>
        </FormRow>
      </Section>

      <Section title="Saúde / treino (opcional)">
        <Field label="Personal trainer responsável" error={errors.personal_trainer?.message}>
          <input {...register("personal_trainer")} type="text" className={inputCls(false)} placeholder="Nome do personal" />
        </Field>
        <Field label="Restrições / observações de saúde" error={errors.health_notes?.message}>
          <textarea {...register("health_notes")} rows={2} className={inputCls(false)} placeholder="Lesões, restrições médicas, etc." />
        </Field>
      </Section>

      <Section title="Contato de emergência (opcional)">
        <FormRow>
          <Field label="Nome" error={errors.emergency_name?.message}>
            <input {...register("emergency_name")} type="text" className={inputCls(false)} placeholder="Nome do contato" />
          </Field>
          <Field label="Telefone" error={errors.emergency_phone?.message}>
            <input {...register("emergency_phone")} type="tel" className={inputCls(false)} placeholder="(11) 99999-9999" />
          </Field>
        </FormRow>
      </Section>

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Salvando…" : "Salvar cliente"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[oklch(0.12_0.005_20)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-3 rounded-lg border border-white/10 p-4">
      <legend className="px-1 text-xs uppercase tracking-wider text-white/40">{title}</legend>
      {children}
    </fieldset>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-left">
      <span className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</span>
      {children}
      {error && <span className="text-xs text-red-300">{error}</span>}
    </label>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-lg border bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30",
    "outline-none transition-colors focus:border-primary focus:bg-white/[0.05]",
    hasError ? "border-red-500/50" : "border-white/10",
  ].join(" ");
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ativo: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    inativo: "bg-white/5 text-white/40 border-white/10",
    suspenso: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    cancelado: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${colors[status] ?? ""}`}>
      {statusLabels[status as keyof typeof statusLabels] ?? status}
    </span>
  );
}

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
