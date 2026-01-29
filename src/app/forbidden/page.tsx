import Link from 'next/link';
import { Ban } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ban className="w-12 h-12 text-orange-400" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4">403</h1>
        <h2 className="text-xl text-gray-400 mb-6">Accès refusé</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full font-medium text-white"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
