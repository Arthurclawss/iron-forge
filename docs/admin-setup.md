# Acessar o Dashboard Admin

1. Acesse `/auth` e crie sua conta com email + senha.
2. Peça ao administrador do projeto para promover seu usuário rodando, no banco:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'seu@email.com';
```

3. Faça login e acesse `/admin`.

## Personalizar para outra academia

Edite apenas `config/site.ts`. Todos os dados (nome, WhatsApp, endereço, horário, redes sociais, planos, IDs de analytics) ficam centralizados ali.

## Analytics

Em `config/site.ts`, preencha:

```ts
analytics: {
  ga4: "G-XXXXXXX",            // Google Analytics 4
  metaPixel: "1234567890123",  // Meta Pixel ID
}
```

Deixar vazio desativa o script.