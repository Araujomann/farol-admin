import { NextRequest, NextResponse } from "next/server";
import { proxyAdminRequest } from "@/lib/backend";
import type { Permission } from "@/lib/permissions";

type RouteContext = { params: Promise<{ path: string[] }> };
type AdminMethod = "GET" | "POST" | "PATCH";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

interface BffRoute {
    method: AdminMethod;
    /** Caminho depois de `/api/admin/`. */
    pattern: RegExp;
    /** Caminho correspondente na Crash Map API. */
    backend: (route: string) => string;
    /**
     * Permissão exigida pela API. Fica aqui como documentação; quem checa é a
     * API (o BFF não consulta a sessão a cada chamada).
     */
    permission: Permission | "authenticated";
}

// Lista fechada: qualquer rota fora dela responde 404 sem tocar na API.
const ROUTES: BffRoute[] = [
    {
        method: "GET",
        pattern: /^moderation\/summary$/,
        backend: (route) => `/accidents/${route}`,
        permission: "stats:read",
    },
    {
        method: "GET",
        pattern: /^moderation$/,
        backend: (route) => `/accidents/${route}`,
        permission: "reports:read",
    },
    {
        method: "GET",
        pattern: new RegExp(`^moderation/${UUID}$`, "i"),
        backend: (route) => `/accidents/${route}`,
        permission: "reports:read",
    },
    {
        method: "PATCH",
        pattern: new RegExp(`^moderation/${UUID}$`, "i"),
        backend: (route) => `/accidents/${route}`,
        permission: "reports:moderate",
    },
    {
        method: "PATCH",
        pattern: new RegExp(`^${UUID}/moderation$`, "i"),
        backend: (route) => `/accidents/${route}`,
        permission: "reports:moderate",
    },
    {
        method: "GET",
        pattern: /^notifications\/administrative-notices$/,
        backend: (route) => `/${route}`,
        permission: "authenticated",
    },
    {
        method: "POST",
        pattern: /^notifications\/administrative-notices$/,
        backend: (route) => `/${route}`,
        permission: "notices:publish",
    },
];

async function forward(
    request: NextRequest,
    context: RouteContext,
    method: AdminMethod,
) {
    const { path } = await context.params;
    const route = path.join("/");
    const match = ROUTES.find(
        (candidate) => candidate.method === method && candidate.pattern.test(route),
    );

    if (!match) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Rota não encontrada." } },
            { status: 404 },
        );
    }

    return proxyAdminRequest(
        `${match.backend(route)}${request.nextUrl.search}`,
        method,
        method === "GET" ? undefined : await request.text(),
    );
}

export async function GET(request: NextRequest, context: RouteContext) {
    return forward(request, context, "GET");
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    return forward(request, context, "PATCH");
}

export async function POST(request: NextRequest, context: RouteContext) {
    return forward(request, context, "POST");
}
