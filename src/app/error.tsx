'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/20 rounded-full mb-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-8xl font-bold text-white/10">500</h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Une erreur est survenue</h2>
        <p className="text-gray-400 mb-8">
          Nous sommes désolés, une erreur technique s&apos;est produite.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition"
          >
            <Home className="w-5 h-5" />
            Accueil
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-gray-600">Référence: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
