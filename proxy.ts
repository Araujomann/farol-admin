import { NextResponse, type NextRequest } from "next/server";
import {
    ACCESS_COOKIE,
    ACCESS_COOKIE_MAX_AGE,
    REFRESH_COOKIE,
    REFRESH_COOKIE_MAX_AGE,
    cookieOptions,
    exchangeRefreshToken,
    isAccessTokenFresh,
} from "@/lib/session-tokens";

// Checagem otimista das páginas do painel: só olha os cookies e, quando o
// access token venceu, renova a sessão antes da renderização (Server Components
// não podem gravar cookies). A autorização de verdade é da Crash Map API.

function redirectToLogin(request: NextRequest) {
    const url = new URL("/login", request.url);
    const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    if (next !== "/") url.searchParams.set("next", next);

    const response = NextResponse.redirect(url);
    response.cookies.set(ACCESS_COOKIE, "", cookieOptions(0));
    response.cookies.set(REFRESH_COOKIE, "", cookieOptions(0));
    return response;
}

export async function proxy(request: NextRequest) {
    const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
    if (isAccessTokenFresh(accessToken)) return NextResponse.next();

    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) return redirectToLogin(request);

    let tokens;
    try {
        tokens = await exchangeRefreshToken(refreshToken);
    } catch {
        // API fora do ar ou não configurada: deixa a página renderizar e
        // mostrar o erro em vez de derrubar a sessão.
        return NextResponse.next();
    }
    if (!tokens) return redirectToLogin(request);

    // Atualiza o cookie da requisição atual (para a renderização) e o do
    // navegador (para as próximas).
    request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
    request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
    const response = NextResponse.next({
        request: { headers: request.headers },
    });
    response.cookies.set(
        ACCESS_COOKIE,
        tokens.accessToken,
        cookieOptions(ACCESS_COOKIE_MAX_AGE),
    );
    response.cookies.set(
        REFRESH_COOKIE,
        tokens.refreshToken,
        cookieOptions(REFRESH_COOKIE_MAX_AGE),
    );
    return response;
}

export const config = {
    // Páginas do painel. Ficam de fora: rotas de API (o BFF já renova a
    // sessão), login, página de sem permissão, assets e arquivos estáticos.
    matcher: [
        "/((?!api|login|sem-permissao|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)",
    ],
};
