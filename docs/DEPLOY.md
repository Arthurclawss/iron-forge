# 🚀 Como fazer o deploy do Iron Forge no Cloudflare Workers (Grátis)

## O que foi adicionado ao projeto

- ✅ `wrangler.jsonc` — configuração do Cloudflare Workers
- ✅ `npm run deploy` — script que builda e faz deploy automaticamente
- ✅ `wrangler` adicionado como devDependency

---

## Passo 1 — Criar conta no Cloudflare (gratuito)

Acesse: **https://cloudflare.com** → clique em "Sign up" → é 100% gratuito.

---

## Passo 2 — Fazer login pelo terminal

Abra o terminal na pasta do projeto e rode:

```bash
npx wrangler login
```

Isso vai abrir o browser para você autorizar o Wrangler com sua conta Cloudflare.

---

## Passo 3 — Adicionar variáveis de ambiente

Pelo painel do Cloudflare (**https://dash.cloudflare.com**):

1. Vá em **Workers & Pages** → selecione `iron-forge` (após o primeiro deploy)
2. Clique em **Settings** → **Variables and Secrets**
3. Adicione cada variável:

| Variável | Onde encontrar |
|---|---|
| `VITE_SUPABASE_URL` | Painel do Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` (= VITE_SUPABASE_PUBLISHABLE_KEY) | Painel do Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Painel do Supabase → Project Settings → API |
| `VITE_PAYPAL_CLIENT_ID` | developer.paypal.com |
| `PAYPAL_CLIENT_ID` | developer.paypal.com |
| `PAYPAL_CLIENT_SECRET` | developer.paypal.com |
| `PAYPAL_MODE` | `production` (ou `sandbox` para testes) |
| `LEADS_TOKEN` | Valor secreto da sua escolha |

---

## Passo 4 — Fazer o deploy

```bash
npm run deploy
```

Isso vai:
1. Rodar `npm run build` (compilar o projeto)
2. Rodar `wrangler deploy` (subir para o Cloudflare Workers)

O site ficará disponível em: **https://iron-forge.{seu-usuario}.workers.dev**

---

## Passo 5 — Deploy automático (opcional mas recomendado)

Você pode configurar deploy automático a cada push no GitHub:

1. No painel Cloudflare → **Workers & Pages** → **Connect to Git**
2. Conecte o repositório `Arthurclawss/iron-forge`
3. Configure:
   - **Build command**: `npm run build`
   - **Deploy command**: `wrangler deploy`
   - **Node version**: `20`

---

## Domínio Personalizado (opcional)

Se você tiver um domínio próprio (ex: `ironforge.com.br`):
1. Adicione-o no Cloudflare (geralmente gratuito para gerenciar DNS)
2. Em **Workers & Pages** → **Custom Domains** → adicione seu domínio

---

## URLs após o deploy

| Ambiente | URL |
|---|---|
| Workers Dev | `https://iron-forge.SEU-USUARIO.workers.dev` |
| Com domínio | `https://seudominio.com.br` |
