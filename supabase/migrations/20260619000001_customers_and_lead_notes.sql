-- ============================================================
-- Clientes (distintos de leads — são os alunos/contratos ativos)
-- ============================================================

CREATE TYPE public.customer_plan AS ENUM ('spark', 'forge', 'legacy', 'outro');
CREATE TYPE public.customer_status AS ENUM ('ativo', 'inativo', 'suspenso', 'cancelado');

CREATE TABLE public.customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Dados pessoais
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  birth_date      DATE,
  cpf             TEXT,                      -- armazenado como texto para aceitar pontuação

  -- Plano / contrato
  plan            public.customer_plan NOT NULL DEFAULT 'outro',
  plan_start      DATE,
  plan_end        DATE,
  status          public.customer_status NOT NULL DEFAULT 'ativo',
  monthly_value   NUMERIC(10, 2),

  -- Endereço (opcional)
  address_street  TEXT,
  address_city    TEXT,
  address_state   VARCHAR(2),
  address_zip     TEXT,

  -- Saúde / treino
  goal            public.lead_goal,          -- reutiliza o enum já existente
  health_notes    TEXT,                      -- restrições, lesões etc.
  personal_trainer TEXT,                     -- nome do personal responsável (se houver)

  -- Rastreio (origem)
  lead_id         UUID REFERENCES public.leads(id) ON DELETE SET NULL,

  -- Contato de emergência
  emergency_name  TEXT,
  emergency_phone TEXT
);

CREATE INDEX customers_email_idx  ON public.customers (email);
CREATE INDEX customers_phone_idx  ON public.customers (phone);
CREATE INDEX customers_status_idx ON public.customers (status);
CREATE INDEX customers_lead_id_idx ON public.customers (lead_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

CREATE POLICY "admins manage customers" ON public.customers
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- Notas por lead (histórico de contato / CRM leve)
-- ============================================================

CREATE TABLE public.lead_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_id    UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000)
);

CREATE INDEX lead_notes_lead_id_idx ON public.lead_notes (lead_id, created_at DESC);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON public.lead_notes TO authenticated;
GRANT ALL ON public.lead_notes TO service_role;

CREATE POLICY "admins manage lead_notes" ON public.lead_notes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
