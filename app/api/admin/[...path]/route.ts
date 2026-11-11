import { NextRequest, NextResponse } from "next/server";
import { proxyAdminRequest } from "@/lib/backend";

type RouteContext = { params: Promise<{ path: string[] }> };
type AdminMethod = "GET" | "POST" | "PATCH";

function isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
    );
}

async function getBackendPath(
    request: NextRequest,
    context: RouteContext,
    method: AdminMethod,
) {
    const { path } = await context.params;
    const route = path.join("/");
    const isNoticeRoute = route === "notifications/administrative-notices";
    const isAllowedNoticeRoute =
        isNoticeRoute && (method === "GET" || method === "POST");
    const isAllowedAccidentRoute =
        (method === "GET" &&
            (route === "moderation" ||
                route === "moderation/summary" ||
                (route.startsWith("moderation/") &&
                    isUuid(route.slice("moderation/".length))))) ||
        (method === "PATCH" &&
            route.startsWith("moderation/") &&
            isUuid(route.slice("moderation/".length))) ||
        (method === "PATCH" &&
            route.endsWith("/moderation") &&
            isUuid(route.slice(0, -"/moderation".length)));

    if (!isAllowedNoticeRoute && !isAllowedAccidentRoute) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Rota não encontrada." } },
            { status: 404 },
        );
    }

    const query = request.nextUrl.search;
    const backendPath = isNoticeRoute
        ? `/notifications/${route.slice("notifications/".length)}`
        : `/accidents/${route}`;
    return proxyAdminRequest(
        `${backendPath}${query}`,
        method,
        method === "GET" ? undefined : await request.text(),
    );
}

export async function GET(request: NextRequest, context: RouteContext) {
    return getBackendPath(request, context, "GET");
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    return getBackendPath(request, context, "PATCH");
}

export async function POST(request: NextRequest, context: RouteContext) {
    return getBackendPath(request, context, "POST");
}
