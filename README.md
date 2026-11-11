# Farol Admin

Painel web independente para consultar e moderar relatos do aplicativo Farol. A aplicação usa Next.js, React e TypeScript, e comunica com o Crash Map API por meio de Route Handlers do Next.

## Requisitos

- Node.js compatível com Next.js 16
- Crash Map API atualizada com a migration de moderação
- Conta com papel `moderator` ou `admin` e e-mail verificado

## Executar

```powershell
npm install
Copy-Item .env.example .env.local
```

O `.env.example` usa `http://localhost:3333`, porta padrão da API. Se ela estiver
em outra porta, ajuste `CRASHMAP_API_URL` em `.env.local` antes de iniciar:

```powershell
npm run dev
```

O painel fica disponível em `http://localhost:3000`. Se essa porta já estiver
ocupada, use `npm run dev -- --port 3001`.

## Segurança e acesso

- O navegador não recebe tokens de acesso ou refresh. O BFF do Next os guarda em cookies `HttpOnly`, `SameSite=Lax` e `Secure` em produção.
- O login recusa usuários sem papel administrativo ou com e-mail não verificado.
- A autorização efetiva é aplicada também pela Crash Map API em todas as rotas administrativas; ocultar páginas não concede permissão.
- Promova contas de equipe somente por um procedimento administrativo protegido no banco. O endpoint público de registro não concede papéis elevados.
- `CRASHMAP_API_URL` é uma variável de servidor e não deve usar o prefixo `NEXT_PUBLIC_`.

Depois que a conta tiver sido criada e verificada pelo fluxo normal da API, um administrador de banco pode conceder o papel de moderador:

```sql
UPDATE "User"
SET role = 'moderator'
WHERE email = lower('moderador@exemplo.com')
  AND is_email_verified = true;
```

Confirme que exatamente uma conta foi atualizada; não altere `is_email_verified` para contornar a verificação de e-mail.

## Contratos de moderação adicionados na API

- `GET /accidents/moderation/summary`
- `GET /accidents/moderation?status=PENDING&page=1&limit=10&sort=newest`
- `GET /accidents/moderation/:id`
- `PATCH /accidents/:id/moderation`

A ação `REJECTED` exige `publicMessage`. `internalNote` é armazenada separadamente e só é devolvida às rotas administrativas. As decisões são imutáveis pela interface e ficam registradas no histórico.

## Avisos à comunidade

Moderadores e administradores com e-mail verificado podem publicar comunicados
pela opção **Avisos à comunidade** na barra lateral. Cada mensagem aparece no
sininho do perfil no aplicativo Farol; o painel também mantém uma lista dos
avisos mais recentes.

- `GET /notifications/administrative-notices` — lista os 50 avisos mais recentes para usuários autenticados.
- `POST /notifications/administrative-notices` — publica `{ "message": "..." }`; exige papel `moderator` ou `admin`, e-mail verificado e uma mensagem de até 1.000 caracteres.

## Limitações conhecidas

- A API registra uma mensagem destinada ao usuário, mas o aplicativo Farol V3 ainda não busca nem exibe esse retorno. A exibição ao usuário exige uma evolução específica no endpoint e na interface mobile.
- O endereço legível não é persistido pelo modelo atual; o painel apresenta coordenadas e link para o mapa.
- As contas precisam ter o papel administrativo e a verificação de e-mail configurados na API antes do primeiro login.
