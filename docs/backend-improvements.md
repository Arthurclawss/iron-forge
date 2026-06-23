# Iron Forge — Melhorias de Back-end

## O que foi adicionado

### 1. Tabela `customers` (Clientes)

Arquivo: `supabase/migrations/20260619000001_customers_and_lead_notes.sql`

Campos completos para cadastro de alunos/clientes:
- Dados pessoais: nome, email, telefone, CPF, data de nascimento
- Plano / contrato: plano (Spark/Forge/Legacy/Outro), datas de início e vencimento, mensalidade, status (ativo/inativo/suspenso/cancelado)
- Endereço: rua, cidade, estado, CEP
- Saúde / treino: objetivo, observações de saúde, personal responsável
- Contato de emergência: nome e telefone
- Rastreio: `lead_id` opcional para vincular a um lead de origem

Segurança: RLS ativa, apenas admins podem acessar.

### 2. Tabela `lead_notes` (Notas por lead)

CRM leve: histórico de anotações por lead. Campos:
- `lead_id`, `author_id`, `body`, `created_at`

### 3. `src/lib/customers.schema.ts`

Schema Zod para validação do formulário de cliente, com:
- Validação de CPF (formato)
- Validação de telefone (regex brasileiro)
- Tipos `CustomerPlan`, `CustomerStatus` e labels em PT-BR

### 4. `src/lib/customers.functions.ts`

Server functions (TanStack Start) para:

| Função | Descrição |
|---|---|
| `getCustomers` | Listar com filtro por status e busca textual |
| `getCustomer` | Buscar cliente pelo ID |
| `createCustomer` | Criar novo cliente |
| `updateCustomer` | Atualizar dados do cliente |
| `deleteCustomer` | Excluir cliente |
| `getCustomerStats` | KPIs: total, ativos, MRR, novos no mês |
| `getLeadNotes` | Listar notas de um lead |
| `addLeadNote` | Adicionar nota a um lead |
| `deleteLeadNote` | Excluir nota |
| `exportLeadsCsv` | Exportar todos os leads como CSV |
| `searchLeads` | Busca textual em leads (nome/email/telefone) |

### 5. `src/routes/_authenticated/clientes.tsx`

Página de gestão de clientes (`/clientes`) com:
- KPIs: total, ativos, MRR, novos no mês
- Tabela com filtro por status e busca por nome/email/telefone
- Formulário completo de criação e edição (modal)
- Exclusão com confirmação
- Badge de status colorido

### 6. Admin melhorado (`src/routes/_authenticated/admin.tsx`)

Melhorias na página de leads:
- **Busca textual** por nome, email ou telefone
- **Filtro de status** (além dos filtros de período)
- **Exportação CSV** — baixa arquivo com todos os leads
- **Painel de notas** lateral (slide-in) para cada lead com histórico de anotações e campo para adicionar nova nota
- Link de navegação rápida para `/clientes`

## Como aplicar

### 1. Aplicar a migration no Supabase

```bash
supabase db push
# ou via Dashboard > SQL Editor, rodando o arquivo:
# supabase/migrations/20260619000001_customers_and_lead_notes.sql
```

### 2. Regenerar os tipos TypeScript (recomendado)

```bash
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

Isso substitui os tipos manuais adicionados ao fim do arquivo `types.ts` por tipos totalmente gerados.

### 3. Registrar a rota `/clientes` no router

Adicione ao `src/router.tsx` (ou `src/routeTree.gen.ts` se for gerado automaticamente):

```ts
// O TanStack Start gera a routeTree automaticamente a partir dos arquivos em src/routes/
// Basta rodar o dev server e o arquivo é regenerado:
bun dev
```

## Navegação

| URL | O que é |
|---|---|
| `/admin` | Gerenciamento de leads (melhorado) |
| `/clientes` | Cadastro de clientes (novo) |
| `/auth` | Login (existente) |
