"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
    const router = useRouter();
    const [pending, setPending] = useState(false);

    async function signOut() {
        setPending(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            router.replace("/login");
        }
    }

    return (
        <button
            className="button button-outline"
            disabled={pending}
            onClick={() => void signOut()}
            type="button"
        >
            {pending ? "Saindo..." : "Entrar com outra conta"}
        </button>
    );
}
