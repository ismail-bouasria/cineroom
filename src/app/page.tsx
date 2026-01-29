'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Play, Calendar, Users, MapPin, Filter } from "lucide-react";
import { movies, categories } from "@/lib/movies";

const rooms = [
  { id: 1, name: "Salle VIP", capacity: "8 places", price: "€€€", available: true },
  { id: 2, name: "Salle Standard", capacity: "20 places", price: "€€", available: true },
  { id: 3, name: "Salle IMAX", capacity: "150 places", price: "€€€", available: false },
];

export default function LandingPage() {
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [filteredMovies, setFilteredMovies] = useState(movies);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category === "Tous") {
      setFilteredMovies(movies);
    } else {
      setFilteredMovies(movies.filter(m => m.category === category));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-slate-950 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tighter">
            <span className="text-red-600">◆</span> CineRoom
          </div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors font-medium">
                Se connecter
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hover:text-red-400 transition-colors">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6 text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
              Réservez votre<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                expérience cinéma
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Les meilleurs films dans les plus beaux cinémas. Réservez votre salle et vivez une expérience inoubliable.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full transition-all hover:scale-105 font-medium text-lg">
                    <Play size={20} /> Commencer
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full transition-all hover:scale-105 font-medium text-lg">
                  <Play size={20} /> Réserver maintenant
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <SignedIn>
        <section className="py-12 px-4 bg-slate-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Film</label>
                <select 
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-red-600 outline-none transition-colors text-white"
                >
                  <option value="">Choisir un film</option>
                  {filteredMovies.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Date</label>
                <input 
                  type="date"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-red-600 outline-none transition-colors text-white"
                />
              </div>
              <div className="flex items-end">
                <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium">
                  Chercher
                </button>
              </div>
            </div>
          </div>
        </section>
      </SignedIn>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            <button
              onClick={() => handleCategoryFilter("Tous")}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === "Tous"
                  ? "bg-red-600"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              Tous
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-red-600"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Movies Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-2">
              {selectedCategory === "Tous" ? "Films à l'affiche" : `Films ${selectedCategory}`}
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-red-600 to-orange-500"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredMovies.map(movie => (
              <Link key={movie.id} href={`/movie/${movie.id}`}>
                <div className="group cursor-pointer h-full">
                  <div className="relative overflow-hidden rounded-lg bg-slate-800 aspect-[2/3] group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-red-600">
                    <img 
                      src={movie.image}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                      <div className="text-center">
                        <p className="font-bold text-sm mb-2">{movie.title}</p>
                        <p className="text-yellow-400 text-xs mb-3">⭐ {movie.rating.toFixed(1)}</p>
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-xs font-medium transition-colors">
                          Détails
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-2">Nos salles premium</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-red-600 to-orange-500"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {rooms.map(room => (
              <div 
                key={room.id}
                className={`rounded-lg border-2 p-6 transition-all ${
                  room.available 
                    ? 'border-slate-600 hover:border-red-600 bg-slate-800/50' 
                    : 'border-slate-700 bg-slate-800/20 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{room.name}</h3>
                    {!room.available && <p className="text-red-400 text-sm">Non disponible</p>}
                  </div>
                  <span className="text-red-600 font-bold">{room.price}</span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users size={18} /> {room.capacity}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin size={18} /> Localisation premium
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar size={18} /> Disponible
                  </div>
                </div>
                <SignedIn>
                  <button 
                    disabled={!room.available}
                    className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      room.available 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-slate-700 cursor-not-allowed'
                    }`}
                  >
                    Réserver <ChevronRight size={18} />
                  </button>
                </SignedIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="text-4xl">🎬</div>
              <h3 className="text-xl font-bold">Films variés</h3>
              <p className="text-slate-400">Tous les derniers blockbusters et films indépendants</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl">✨</div>
              <h3 className="text-xl font-bold">Expérience premium</h3>
              <p className="text-slate-400">Salles de luxe et équipements de dernière génération</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl">⚡</div>
              <h3 className="text-xl font-bold">Réservation facile</h3>
              <p className="text-slate-400">Réservez en quelques clics, directement en ligne</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>&copy; 2025 CineRoom. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}