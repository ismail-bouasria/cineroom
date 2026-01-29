'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Star, Calendar, Ticket, 
  Heart, Share2, Film
} from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { TMDBMovie, FORMULAS, TMDB_GENRES } from '@/types';
import { getImageUrl, getBackdropUrl, MOCK_MOVIES } from '@/lib/tmdb';

// ============================================
// COMPOSANTS INTERNES
// ============================================

const MovieCard = ({ movie }: { movie: TMDBMovie }) => (
  <Link 
    href={`/movie/${movie.id}`}
    className="group flex-shrink-0 w-[160px] md:w-[180px]"
  >
    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2">
      <Image
        src={getImageUrl(movie.poster_path)}
        alt={movie.title}
        fill
        className="object-cover transition-transform group-hover:scale-105"
        sizes="180px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-full text-xs">
        <Star size={10} className="text-yellow-400 fill-yellow-400" />
        <span>{movie.vote_average.toFixed(1)}</span>
      </div>
    </div>
    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
      {movie.title}
    </h3>
  </Link>
);

const FormulaQuickSelect = ({ movieId }: { movieId: number }) => (
  <div className="grid grid-cols-3 gap-3 mt-6">
    {FORMULAS.map(formula => (
      <Link
        key={formula.id}
        href={`/book?movie=${movieId}&formula=${formula.id}`}
        className={`
          p-4 rounded-xl text-center transition-all hover:scale-105
          bg-gradient-to-br ${formula.color}
        `}
      >
        <div className="text-2xl mb-1">{formula.icon}</div>
        <div className="font-bold text-sm">{formula.name}</div>
        <div className="text-xs text-white/70">{formula.seats} places</div>
        <div className="font-bold mt-2">{formula.basePrice}€</div>
      </Link>
    ))}
  </div>
);

// ============================================
// PAGE DÉTAIL FILM
// ============================================

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<TMDBMovie[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const movieId = parseInt(resolvedParams.id);
    const foundMovie = MOCK_MOVIES.find(m => m.id === movieId);
    setMovie(foundMovie || null);

    // Films similaires (même genre)
    if (foundMovie && foundMovie.genre_ids) {
      const similar = MOCK_MOVIES.filter(
        m => m.id !== movieId && m.genre_ids?.some(g => foundMovie.genre_ids?.includes(g))
      ).slice(0, 6);
      setSimilarMovies(similar);
    }
  }, [resolvedParams.id]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Film size={48} className="mx-auto mb-4 text-gray-600" />
          <h1 className="text-2xl font-bold mb-2">Film non trouvé</h1>
          <Link href="/" className="text-red-400 hover:underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const genres = movie.genre_ids?.map(id => TMDB_GENRES[id]).filter(Boolean) || [];
  const year = new Date(movie.release_date).getFullYear();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Retour</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Film size={16} />
            </div>
            <span className="text-xl font-black hidden sm:inline">
              Cine<span className="text-red-500">Room</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-sm font-medium">
                  Connexion
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero avec backdrop */}
      <section className="relative h-[70vh] min-h-[500px]">
        <div className="absolute inset-0">
          <Image
            src={getBackdropUrl(movie.backdrop_path)}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Poster */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 pt-20 md:pt-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 rounded-full text-sm">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-gray-400">({movie.vote_count} votes)</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
                  <Calendar size={14} />
                  {year}
                </span>
              </div>

              {/* Titre */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
                {movie.title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {genres.map(genre => (
                  <span 
                    key={genre} 
                    className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mb-8">
                {movie.overview}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <SignedIn>
                  <Link
                    href={`/book?movie=${movie.id}`}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-red-500/30"
                  >
                    <Ticket size={24} />
                    Réserver une salle
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-red-500/30">
                      <Ticket size={24} />
                      Réserver une salle
                    </button>
                  </SignInButton>
                </SignedOut>

                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`
                    p-4 rounded-full transition-all
                    ${isLiked 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/10 hover:bg-white/20'
                    }
                  `}
                  aria-label={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart size={24} className={isLiked ? 'fill-current' : ''} />
                </button>

                <button
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Partager"
                >
                  <Share2 size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section réservation rapide */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="bg-white/5 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-2">Réservez votre salle</h2>
          <p className="text-gray-400 mb-6">Choisissez votre formule pour voir ce film en privé</p>
          <FormulaQuickSelect movieId={movie.id} />
        </div>
      </section>

      {/* Films similaires */}
      {similarMovies.length > 0 && (
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Films similaires</h2>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
            {similarMovies.map(m => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Film size={16} />
            </div>
            <span className="text-xl font-black">
              Cine<span className="text-red-500">Room</span>
            </span>
          </Link>
          <p className="text-sm text-gray-500">
            © 2026 CineRoom. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
