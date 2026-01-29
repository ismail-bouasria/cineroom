import Link from "next/link";
import { Button } from "@/components/ui";
import { Lock, Home, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-900/30 rounded-full mb-4">
            <Lock className="w-12 h-12 text-amber-500" />
          </div>
          <h1 className="text-8xl font-bold text-slate-700">401</h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Authentification requise</h2>
        <p className="text-slate-400 mb-8">
          Vous devez être connecté pour accéder à cette page.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button leftIcon={<LogIn className="w-5 h-5" />}>Se connecter</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" leftIcon={<Home className="w-5 h-5" />}>
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
