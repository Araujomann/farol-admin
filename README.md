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
- O login recusa contas sem a permissão `panel:access`, com e-mail não verificado ou suspensas.
- A autorização efetiva é aplicada pela Crash Map API em todas as rotas; o painel só esconde o que a conta não pode fazer. A arquitetura completa está em [docs/arquitetura-permissoes.md](docs/arquitetura-permissoes.md).
- `CRASHMAP_API_URL` é uma variável de servidor e não deve usar o prefixo `NEXT_PUBLIC_`.

## Papéis e equipe

| Papel | Pode |
|---|---|
| Moderador | Painel, aprovar/rejeitar relatos, histórico de moderação, estatísticas, avisos à comunidade |
| Administrador | Tudo do moderador, mais: convidar e remover moderadores, gerenciar convites, gerenciar contas, auditoria e configurações |

- **Moderadores** entram por convite: em **Equipe e convites**, o administrador informa o e-mail; o convidado recebe um link (válido pelo tempo definido em **Configurações**, padrão 72 h) e o aceita entrando com a própria conta do Farol, já verificada. Na API, defina `ADMIN_PANEL_URL` com o endereço deste painel para que o link aponte para cá.
- **O primeiro administrador** é criado no servidor da API, depois que a conta foi registrada e verificada pelo aplicativo:

```bash
pnpm admin:grant-role admin@exemplo.com admin
```

O script exige e-mail verificado, não remove o último administrador ativo e registra a alteração na auditoria. Não altere papéis direto no banco.

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
