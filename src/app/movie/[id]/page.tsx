'use client';

import { useParams } from "next/navigation";
import { getMovieById } from "@/lib/movies";
import Link from "next/link";
import { ArrowLeft, Clock, Star, Users } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

const rooms = [
  { id: 1, name: "Salle VIP", capacity: "8", price: "45€" },
  { id: 2, name: "Salle Standard", capacity: "20", price: "15€" },
  { id: 3, name: "Salle IMAX", capacity: "150", price: "20€" },
];

export default function MoviePage() {
  const params = useParams();
  const movieId = parseInt(params.id as string);
  const movie = getMovieById(movieId);

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Film non trouvé</h1>
          <Link href="/" className="text-red-600 hover:text-red-400">
            Retourner à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-950/50 backdrop-blur-sm border-b border-slate-800 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit">
            <ArrowLeft size={20} /> Retour
          </Link>
        </div>
      </header>

      {/* Hero with background image */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and info */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold">{movie.title}</h1>
              <div className="flex flex-wrap gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-yellow-400" />
                  <span className="text-lg font-semibold">{movie.rating.toFixed(1)}/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-red-600" />
                  <span>{movie.duration} minutes</span>
                </div>
                <div>
                  <span className="text-red-600 font-semibold">{movie.year}</span>
                </div>
                <div>
                  <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm">
                    {movie.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Director and actors */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-slate-400 text-sm font-semibold mb-2">RÉALISATEUR</h3>
                <p className="text-xl font-semibold">{movie.director}</p>
              </div>
              <div>
                <h3 className="text-slate-400 text-sm font-semibold mb-2">ACTEURS</h3>
                <p className="text-xl font-semibold">{movie.actors.join(", ")}</p>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">Synopsis</h3>
              <p className="text-slate-300 leading-relaxed text-lg">
                {movie.synopsis}
              </p>
            </div>

            {/* Trailer */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">Bande annonce</h3>
              <iframe
                className="w-full aspect-video rounded-lg"
                src={movie.trailer}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-6">Réserver une salle</h3>
                
                <div className="space-y-4">
                  {rooms.map(room => (
                    <div key={room.id} className="border border-slate-600 rounded-lg p-4 hover:border-red-600 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-lg">{room.name}</p>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <Users size={16} /> {room.capacity} places
                          </p>
                        </div>
                        <span className="text-red-600 font-bold text-lg">{room.price}</span>
                      </div>
                      
                      <SignedOut>
                        <SignInButton mode="modal">
                          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors">
                            Se connecter pour réserver
                          </button>
                        </SignInButton>
                      </SignedOut>
                      
                      <SignedIn>
                        <Link href={`/booking?movie=${movie.id}&room=${room.id}`}>
                          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors">
                            Réserver
                          </button>
                        </Link>
                      </SignedIn>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <h4 className="font-bold mb-3">À propos</h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-400">Année:</span> {movie.year}</p>
                  <p><span className="text-slate-400">Durée:</span> {movie.duration} min</p>
                  <p><span className="text-slate-400">Catégorie:</span> {movie.category}</p>
                  <p><span className="text-slate-400">Note:</span> {movie.rating}/10</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
