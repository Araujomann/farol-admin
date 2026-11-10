import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Farol Admin",
    description: "Painel de moderação de relatos do ecossistema Farol.",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-BR">
            <body>{children}</body>
        </html>
    );
}
