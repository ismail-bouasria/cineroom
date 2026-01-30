'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Star, Filter, Grid, List, Film, X } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { TMDBMovie, TMDB_GENRES } from '@/types';
import { getImageUrl, MOCK_MOVIES } from '@/lib/tmdb';
import { MovieImage } from '@/components/common/MovieImage';

// ============================================
// COMPOSANTS
// ============================================

const MovieCard = ({ movie, viewMode }: { movie: TMDBMovie; viewMode: 'grid' | 'list' }) => {
  const genres = movie.genre_ids?.slice(0, 2).map(id => TMDB_GENRES[id]).filter(Boolean) || [];
  const year = new Date(movie.release_date).getFullYear();

  if (viewMode === 'list') {
    return (
      <Link
        href={`/movie/${movie.id}`}
        className="flex gap-4 bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors"
      >
        <div className="w-24 flex-shrink-0">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
            <MovieImage
              src={getImageUrl(movie.poster_path, 'w200')}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-1 truncate">{movie.title}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              {movie.vote_average.toFixed(1)}
            </span>
            <span>{year}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {genres.map(genre => (
              <span key={genre} className="px-2 py-0.5 bg-white/10 rounded text-xs">
                {genre}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-400 line-clamp-2">{movie.overview}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3">
        <MovieImage
          src={getImageUrl(movie.poster_path)}
          alt={movie.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Badge note */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 rounded-full text-xs">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span>{movie.vote_average.toFixed(1)}</span>
        </div>

        {/* Info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
          <div className="flex flex-wrap gap-1">
            {genres.map(genre => (
              <span key={genre} className="px-2 py-0.5 bg-white/20 rounded text-xs">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
      <h3 className="font-semibold line-clamp-2 group-hover:text-red-400 transition-colors">
        {movie.title}
      </h3>
      <p className="text-sm text-gray-400 mt-1">{year}</p>
    </Link>
  );
};

// ============================================
// GENRES DISPONIBLES
// ============================================

const AVAILABLE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Aventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comédie' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drame' },
  { id: 14, name: 'Fantastique' },
  { id: 27, name: 'Horreur' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science-Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerre' }
];

// ============================================
// PAGE CATALOGUE
// ============================================

export default function CataloguePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date'>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredMovies = useMemo(() => {
    let movies = [...MOCK_MOVIES];

    // Filtrer par recherche
    if (searchQuery) {
      movies = movies.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrer par genre
    if (selectedGenre) {
      movies = movies.filter(m => m.genre_ids?.includes(selectedGenre));
    }

    // Trier
    switch (sortBy) {
      case 'rating':
        movies.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case 'date':
        movies.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
        break;
      default:
        movies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    return movies;
  }, [searchQuery, selectedGenre, sortBy]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Film size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight hidden sm:inline">
              Cine<span className="text-red-500">Room</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="hover:text-red-400 transition-colors font-medium">
              Accueil
            </Link>
            <Link href="/catalogue" className="text-red-400 font-medium">
              Catalogue
            </Link>
            <SignedIn>
              <Link href="/dashboard" className="hover:text-red-400 transition-colors font-medium">
                Mes Réservations
              </Link>
            </SignedIn>
          </nav>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-semibold text-sm transition-colors">
                  Connexion
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/book"
                className="hidden sm:flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-semibold text-sm transition-colors"
              >
                Réserver
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4 md:px-8 bg-gradient-to-b from-red-950/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Catalogue des films
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Explorez notre sélection de films et réservez votre salle privée pour une expérience cinéma unique.
          </p>
        </div>
      </section>

      {/* Barre de recherche et filtres */}
      <section className="py-6 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un film..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Contrôles */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                  showFilters || selectedGenre ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filtres</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-red-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="popularity">Popularité</option>
                <option value="rating">Note</option>
                <option value="date">Date de sortie</option>
              </select>

              <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-red-500' : 'hover:bg-white/10'
                  }`}
                  aria-label="Vue grille"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-red-500' : 'hover:bg-white/10'
                  }`}
                  aria-label="Vue liste"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Filtres par genre */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGenre(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedGenre === null
                    ? 'bg-red-600 text-white'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Tous
              </button>
              {AVAILABLE_GENRES.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGenre === genre.id
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Résultats */}
      <section className="py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Compteur */}
          <p className="text-gray-400 mb-6">
            {filteredMovies.length} film{filteredMovies.length > 1 ? 's' : ''} trouvé{filteredMovies.length > 1 ? 's' : ''}
          </p>

          {filteredMovies.length === 0 ? (
            <div className="text-center py-20">
              <Film size={64} className="mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-bold mb-2">Aucun film trouvé</h2>
              <p className="text-gray-400 mb-6">
                Essayez de modifier vos critères de recherche
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre(null);
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} viewMode="list" />
              ))}
            </div>
          )}
        </div>
      </section>

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
