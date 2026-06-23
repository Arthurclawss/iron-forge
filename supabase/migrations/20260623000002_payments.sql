-- ============================================================
-- Tabela de pagamentos (PayPal + PIX)
-- ============================================================

CREATE TABLE public.payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Vínculo com o lead (opcional — pode vir antes do cadastro)
  lead_id       UUID REFERENCES public.leads(id) ON DELETE SET NULL,

  -- Plano contratado
  plan          TEXT NOT NULL,           -- 'spark' | 'forge' | 'iron'
  amount        NUMERIC(10, 2) NOT NULL, -- valor em BRL
  currency      TEXT NOT NULL DEFAULT 'BRL',

  -- Método de pagamento
  method        TEXT NOT NULL,           -- 'paypal' | 'pix'

  -- Status do pagamento
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'declined', 'refunded', 'pix_pending')),

  -- ID do provedor (OrderId do PayPal, TxId do PIX, etc.)
  provider_id   TEXT,

  -- Dados extras (JSON livre)
  metadata      JSONB,

  -- Dados do pagante
  payer_email   TEXT,
  payer_name    TEXT
);

CREATE INDEX payments_lead_id_idx  ON public.payments (lead_id);
CREATE INDEX payments_status_idx   ON public.payments (status);
CREATE INDEX payments_created_idx  ON public.payments (created_at DESC);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.payments TO anon;
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

-- Anon pode apenas inserir (criar transação)
CREATE POLICY "anyone can create payment" ON public.payments
  FOR INSERT TO anon WITH CHECK (true);

-- Admins leem e gerenciam todos os pagamentos
CREATE POLICY "admins manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
