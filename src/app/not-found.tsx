import Link from 'next/link';
import { Film, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 rounded-full mb-4">
            <Film className="w-12 h-12 text-white/30" />
          </div>
          <h1 className="text-8xl font-bold text-white/10">404</h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Page introuvable</h2>
        <p className="text-gray-400 mb-8">
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Accueil
          </Link>
          <Link
            href="/catalogue"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
