-- ============================================================
-- Funções RPC seguras para contornar RLS na planilha interna
-- Usam SECURITY DEFINER para rodar com permissões de service_role
-- mas validam o token antes de retornar dados
-- ============================================================

-- get_leads_secure: retorna todos os leads validando o token
-- NOTA: Usamos RETURNS TABLE com colunas explícitas e cast de ENUMs para TEXT
-- pois RETURNS SETOF public.leads falha quando goal/status são tipos ENUM

CREATE OR REPLACE FUNCTION public.get_leads_secure(token_input TEXT)
RETURNS TABLE (
  id            UUID,
  created_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ,
  name          TEXT,
  email         TEXT,
  phone         TEXT,
  goal          TEXT,
  notes         TEXT,
  best_contact_time TEXT,
  source        TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  status        TEXT,
  ip_hash       TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF token_input IS NULL OR token_input = '' OR token_input != 'ironforge_crm_secret_2026' THEN
    RAISE EXCEPTION 'Token inválido ou ausente' USING ERRCODE = 'permission_denied';
  END IF;

  RETURN QUERY
    SELECT
      l.id,
      l.created_at,
      l.updated_at,
      l.name,
      l.email,
      l.phone,
      l.goal::TEXT,
      l.notes,
      l.best_contact_time,
      l.source,
      l.utm_source,
      l.utm_medium,
      l.utm_campaign,
      l.status::TEXT,
      l.ip_hash
    FROM public.leads l
    ORDER BY l.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_leads_secure(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_leads_secure(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leads_secure(TEXT) TO service_role;


-- ============================================================
-- Função para retornar agendamentos de forma segura
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_bookings_secure(token_input TEXT)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  lead_id UUID,
  booking_time TIMESTAMPTZ,
  status TEXT,
  notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF token_input IS NULL OR token_input = '' OR token_input != 'ironforge_crm_secret_2026' THEN
    RAISE EXCEPTION 'Token inválido ou ausente' USING ERRCODE = 'permission_denied';
  END IF;

  BEGIN
    RETURN QUERY
      SELECT b.id, b.created_at, b.lead_id, b.booking_time, b.status, b.notes
      FROM public.bookings b
      ORDER BY b.booking_time DESC;
  EXCEPTION
    WHEN undefined_table THEN
      RETURN;
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_bookings_secure(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_bookings_secure(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_bookings_secure(TEXT) TO service_role;
