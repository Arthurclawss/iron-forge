-- ============================================================
-- Agendamentos (Bookings)
-- ============================================================

CREATE TABLE public.bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  lead_id      UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  booking_time TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'cancelado', 'concluido')),
  notes        TEXT
);

CREATE INDEX bookings_lead_id_idx ON public.bookings (lead_id);
CREATE INDEX bookings_booking_time_idx ON public.bookings (booking_time);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT INSERT ON public.bookings TO anon;
GRANT ALL ON public.bookings TO service_role;

-- Policies
CREATE POLICY "anyone can insert bookings" ON public.bookings
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "admins manage bookings" ON public.bookings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
