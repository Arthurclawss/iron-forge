
# Iron Forge — Sistema completo de captação de leads

Vou transformar a landing em uma máquina de geração de alunos com captura, armazenamento, dashboard e tracking. Antes de começar preciso confirmar alguns pontos chave.

## Decisões que preciso confirmar

1. **Lovable Cloud (Supabase)** — vou ativar agora. Ele provisiona banco + auth + funções server sem você precisar criar conta. OK?
2. **Admin `/admin`** — quem pode entrar? Proposta: criar tabela `user_roles` + role `admin`, e o primeiro usuário cadastrado em `/auth` precisa ser promovido manualmente via SQL (te mostro o comando). Alternativa: senha única simples (menos seguro). Vou seguir com roles.
3. **Google Sheets Webhook** — precisa de uma URL de Google Apps Script que VOCÊ cria (te dou o script pronto + instruções). Vou armazenar a URL como secret `GOOGLE_SHEETS_WEBHOOK_URL`. Se não fornecer agora, o sistema funciona sem Sheets (só Supabase) e ativa quando você colar.
4. **GA4 / Meta Pixel** — preciso dos IDs (`G-XXXX` e Pixel ID). Vou deixar como variáveis em `config/site.ts` — se vazias, os scripts não carregam.
5. **WhatsApp / endereço / planos atuais** — vou centralizar em `config/site.ts` com placeholders sensatos (`+55 11 99999-9999`, endereço genérico). Você edita um único arquivo.

## Escopo de implementação

### Fase 1 — `config/site.ts`
Centraliza: nome da academia, whatsapp, endereço, horário, redes sociais, planos, GA4 ID, Pixel ID, mensagem WhatsApp pós-cadastro. Toda a landing passa a ler daqui.

### Fase 2 — Backend (Lovable Cloud)
Migração SQL:
- `app_role` enum (`admin`, `user`)
- `user_roles` (id, user_id, role) + RLS + `has_role()` security definer
- `lead_status` enum: `novo | contatado | interessado | matriculado | perdido`
- `lead_goal` enum: `emagrecimento | hipertrofia | performance | condicionamento | outro`
- `leads` (id, created_at, name, email, phone, goal, notes, best_contact_time, source, utm_source, utm_campaign, utm_medium, status, ip_hash)
- GRANTs: `INSERT` para `anon` (formulário público), `SELECT/UPDATE` só para admin
- RLS: anon pode inserir; admin pode ler/atualizar tudo
- Trigger `updated_at`

### Fase 3 — Server functions / rotas
- `POST /api/public/leads` (server route) — público, com:
  - validação Zod (nome, email, whatsapp BR regex, goal enum)
  - honeypot field (`website` deve estar vazio)
  - rate limit em memória por IP-hash (5 req / 10 min)
  - sanitização (trim, lowercase email, strip tags)
  - insert no Supabase via publishable key
  - fire-and-forget POST para `GOOGLE_SHEETS_WEBHOOK_URL` (se setado)
  - retorna `{ ok, leadId, whatsappUrl }`
- `getLeads` / `updateLeadStatus` / `getLeadStats` (server fns com `requireSupabaseAuth` + check `has_role admin`)

### Fase 4 — Formulário (componente)
- React Hook Form + Zod resolver
- Campos: nome, whatsapp (máscara), email, goal (select), best_contact_time (opcional), notes (opcional), honeypot
- Captura UTMs do `window.location.search` em hidden fields
- Debounce no submit (impede duplo click)
- Mensagens de erro elegantes inline
- Estado de loading com spinner
- Pós-sucesso: tela com animação de check, confete (canvas-confetti), mensagem "especialista em até 15 min", botão "Continuar no WhatsApp" com mensagem pré-preenchida

### Fase 5 — Dashboard `/admin`
- Rota protegida sob `_authenticated/admin`
- Gate adicional: se não tem role `admin`, mostra "Acesso negado"
- Cards: Total / Mês / Conversão (matriculados÷total) / Top origem
- Filtros: hoje / 7d / 30d / 90d (query params)
- Tabela com Nome, WhatsApp (link wa.me), Goal, Data, Status (select inline para atualizar)
- Link WhatsApp em cada linha

### Fase 6 — Auth
- Rota `/auth` (signup + login email/senha, sem confirmação de email para acelerar testes)
- Após login, redireciona para `/admin`

### Fase 7 — Analytics
- Em `__root.tsx`, se GA4 ID setado → injeta gtag
- Se Pixel ID setado → injeta fbq
- Helper `trackEvent(name, params)` chamado em:
  - `hero_cta_click`, `plan_click`, `whatsapp_click`, `lead_submit`

### Fase 8 — Google Sheets
Arquivo `docs/google-sheets-setup.md` com o Apps Script pronto:
```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const d = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), d.name, d.email, d.phone, d.goal, d.source, d.utm_source, d.notes]);
  return ContentService.createTextOutput(JSON.stringify({ok:true}));
}
```
+ instruções de deploy → cole URL no secret.

## Arquivos principais

```text
config/site.ts                                    (NOVO — config central)
src/lib/leads.schema.ts                           (NOVO — Zod)
src/lib/leads.functions.ts                       (NOVO — server fns admin)
src/routes/api/public/leads.ts                    (NOVO — endpoint público)
src/components/iron-forge/LeadForm.tsx            (NOVO)
src/components/iron-forge/LeadSuccess.tsx         (NOVO — confete)
src/components/iron-forge/IronForgeLanding.tsx    (EDIT — usa config + form + tracking)
src/routes/__root.tsx                             (EDIT — GA/Pixel scripts)
src/routes/auth.tsx                               (NOVO)
src/routes/_authenticated/admin.tsx               (NOVO — dashboard)
src/routes/_authenticated/route.tsx               (já existe — gate)
docs/google-sheets-setup.md                       (NOVO)
docs/admin-setup.md                               (NOVO — como promover 1º admin)
supabase migration                                (NOVO — schema + RLS + roles)
```

Dependências novas: `react-hook-form`, `@hookform/resolvers`, `zod` (já tem), `canvas-confetti`, `react-input-mask` (ou máscara manual).

## Perguntas rápidas antes de codar

1. Posso seguir com **Lovable Cloud + roles para admin** (signup em `/auth`, promoção via SQL)?
2. Você tem **GA4 ID** e **Meta Pixel ID** agora, ou deixo vazio em `config/site.ts` para você preencher depois?
3. **Google Sheets webhook URL** — te mando o setup e você cola depois? (sistema funciona sem)
4. **Dados reais da academia** (nome real, whatsapp, endereço) ou uso placeholders "Iron Forge" que você troca em `config/site.ts`?

Responda e eu executo tudo de uma vez.
