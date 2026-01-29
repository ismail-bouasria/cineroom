"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { ShieldX, Home, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-900/30 rounded-full mb-4">
            <ShieldX className="w-12 h-12 text-rose-500" />
          </div>
          <h1 className="text-8xl font-bold text-slate-700">403</h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Accès refusé</h2>
        <p className="text-slate-400 mb-8">
          Vous n&apos;avez pas les droits nécessaires pour accéder à cette ressource.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button leftIcon={<Home className="w-5 h-5" />}>Mon Dashboard</Button>
          </Link>
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
            onClick={() => window.history.back()}
          >
            Page précédente
          </Button>
        </div>
      </div>
    </div>
  );
}
