import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4">401</h1>
        <h2 className="text-xl text-gray-400 mb-6">Non authentifié</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Vous devez être connecté pour accéder à cette page.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-white transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
