'use client';

import { useUser, UserProfile } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Film } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin text-4xl">🎬</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-gradient-to-b from-red-950/30 to-transparent py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-black">Mon Profil</h1>
          <p className="text-gray-400 mt-1">Gérez vos informations personnelles et préférences</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-white/5 rounded-2xl p-6 md:p-8">
          <UserProfile 
            appearance={{
              baseTheme: undefined,
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                navbar: "hidden",
                pageScrollBox: "p-0",
                profileSection: "border-white/10",
                formFieldInput: "bg-white/10 border-white/20 text-white",
                formButtonPrimary: "bg-red-600 hover:bg-red-700",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-400"
              }
            }}
          />
        </div>

        {/* Préférences CineRoom */}
        <div className="mt-8 bg-white/5 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Film className="w-5 h-5 text-red-400" />
            Préférences CineRoom
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Formule préférée
              </label>
              <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-red-500 focus:outline-none">
                <option value="">Aucune préférence</option>
                <option value="cine-duo">Ciné&apos;Duo (2 places)</option>
                <option value="cine-team">Ciné&apos;Team (4 places)</option>
                <option value="cine-groupe">Ciné&apos;Groupe (8 places)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Genres favoris
              </label>
              <div className="flex flex-wrap gap-2">
                {['Action', 'Comédie', 'Drame', 'Science-Fiction', 'Thriller', 'Animation'].map(genre => (
                  <button
                    key={genre}
                    className="px-4 py-2 bg-white/10 hover:bg-red-500/30 border border-transparent hover:border-red-500/50 rounded-full text-sm transition-colors"
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <h3 className="font-medium">Notifications email</h3>
                <p className="text-sm text-gray-400">Recevoir les confirmations et rappels</p>
              </div>
              <button className="relative w-12 h-6 bg-red-500 rounded-full transition-colors">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <h3 className="font-medium">Rappel 24h avant</h3>
                <p className="text-sm text-gray-400">Notification de rappel avant chaque séance</p>
              </div>
              <button className="relative w-12 h-6 bg-red-500 rounded-full transition-colors">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
              </button>
            </div>
          </div>

          <button className="w-full mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors">
            Enregistrer les préférences
          </button>
        </div>

        {/* Zone danger */}
        <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-2 text-red-400">Zone de danger</h2>
          <p className="text-gray-400 mb-6">
            La suppression de votre compte est irréversible. Toutes vos données seront perdues.
          </p>
          <button className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-medium transition-colors">
            Supprimer mon compte
          </button>
        </div>
      </main>
    </div>
  );
}
