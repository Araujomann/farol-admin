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
- A autorização efetiva é aplicada pela Crash Map API em todas as rotas; o painel só esconde o que a conta não pode fazer. A arquitetura completa está em [docs/architecture.md](docs/architecture.md).
- `CRASHMAP_API_URL` é uma variável de servidor e não deve usar o prefixo `NEXT_PUBLIC_`.
- O painel repassa à API o IP do navegador (`X-Forwarded-For`). A API só aceita esse cabeçalho de proxies listados em `TRUST_PROXY` (hoje, a cadeia interna do Render e a Cloudflare; ver `crashmap-api/docs/DEPLOY.md`). Como o servidor do painel na Vercel não está nessa lista, a auditoria e os limites de tentativas das ações feitas pelo painel registram o IP do servidor da Vercel, não o do moderador. Repassar o IP real exige um cabeçalho assinado entre painel e API (planejado).
- Login e aceite de convite têm limite de tentativas; ao estourar, a tela mostra quanto tempo esperar.

## Checklist de produção

1. Na API: `prisma migrate deploy` e as variáveis `ADMIN_PANEL_URL` (endereço HTTPS do painel), `TRUST_PROXY` e, se houver app web, `CORS_ORIGINS` — exemplos em `crashmap-api/.env.example`.
2. Envie os e-mails de um domínio próprio (SPF/DKIM) ou de um serviço transacional; um Gmail comum funciona, mas os filtros desconfiam mais.
3. No painel: `CRASHMAP_API_URL` apontando para a API.
4. Crie o primeiro administrador com `pnpm admin:grant-role`.

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
painel deslizante aberto pelo sininho da tela de perfil do aplicativo Farol; o painel também mantém uma lista dos
avisos mais recentes.

- `GET /notifications/administrative-notices` — lista os 50 avisos mais recentes para usuários autenticados.
- `POST /notifications/administrative-notices` — publica `{ "message": "..." }`; exige papel `moderator` ou `admin`, e-mail verificado e uma mensagem de até 1.000 caracteres.

## Limitações conhecidas

- A mensagem pública da decisão só aparece ao autor quando o relato é rejeitado (como motivo da rejeição, em **Meus relatos** no aplicativo Farol V3). Em relatos aprovados ela fica registrada, mas o aplicativo não a exibe.
- A edição de relatos pela interface só é oferecida enquanto estão `PENDING`. A API também permite à staff corrigir título e descrição de relatos já moderados (com auditoria), mas o painel não expõe essa ação.
- O push de aprovação não é personalizado: a API envia a todos os dispositivos registrados um aviso genérico de novo acidente em Imperatriz.
- A descrição do relato tem até 1.000 caracteres na API, no painel e no aplicativo. O título aceita de 3 a 180 caracteres na API e no painel; o aplicativo limita o tipo personalizado a 60.
- O endereço legível não é persistido pelo modelo atual; o painel apresenta coordenadas e link para o mapa.
- As contas precisam ter o papel administrativo e a verificação de e-mail configurados na API antes do primeiro login.
