import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
    ApiConfigurationError,
    apiBaseUrl,
    clearAdminCookies,
} from "@/lib/backend";

const REFRESH_COOKIE = "farol_admin_refresh";

export async function POST() {
    const store = await cookies();
    const refreshToken = store.get(REFRESH_COOKIE)?.value;
    let failure = false;

    if (refreshToken) {
        try {
            const response = await fetch(`${apiBaseUrl()}/auth/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
                cache: "no-store",
            });
            failure = !response.ok;
        } catch (error) {
            if (
                !(error instanceof TypeError) &&
                !(error instanceof ApiConfigurationError)
            ) {
                throw error;
            }
            failure = true;
        }
    }

    const response = NextResponse.json(
        failure
            ? {
                  error: {
                      code: "LOGOUT_REVOCATION_FAILED",
                      message:
                          "A sessão local foi encerrada, mas não foi possível revogar o token na API.",
                  },
              }
            : { data: { loggedOut: true } },
        { status: failure ? 502 : 200 },
    );
    return clearAdminCookies(response);
}
