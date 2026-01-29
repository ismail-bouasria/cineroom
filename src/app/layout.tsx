import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineRoom - Réservation de salles de cinéma",
  description: "Réservez votre salle de cinéma privée pour une expérience unique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr">
        <body className="antialiased bg-slate-950 text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
