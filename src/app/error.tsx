"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-900/30 rounded-full mb-4">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
          </div>
          <h1 className="text-8xl font-bold text-slate-700">500</h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Une erreur est survenue</h2>
        <p className="text-slate-400 mb-8">
          Nous sommes désolés, une erreur technique s&apos;est produite.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} leftIcon={<RefreshCw className="w-5 h-5" />}>
            Réessayer
          </Button>
          <Link href="/">
            <Button variant="outline" leftIcon={<Home className="w-5 h-5" />}>
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-slate-600">Référence: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
