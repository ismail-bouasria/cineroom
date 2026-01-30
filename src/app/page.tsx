'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Play, Star, Clock, ChevronLeft, ChevronRight, Ticket, Sparkles, Film, Users, Zap, Rocket, Theater, Smile, Crown, Popcorn, Calendar, Volume2, Heart } from "lucide-react";
import { TMDBMovie, FORMULAS, TMDB_GENRES } from "@/types";
import { getImageUrl, getBackdropUrl, MOCK_MOVIES } from "@/lib/tmdb";
import { MovieImage } from "@/components/common/MovieImage";

// ============================================
// COMPOSANTS UI INTERNES
// ============================================

const MovieCard = ({ movie, featured = false }: { movie: TMDBMovie; featured?: boolean }) => {
  const genres = movie.genre_ids?.slice(0, 2).map(id => TMDB_GENRES[id]).filter(Boolean) || [];
  
  return (
    <Link 
      href={`/movie/${movie.id}`}
      className={`group relative flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:z-10 ${
        featured ? "w-[300px] md:w-[340px]" : "w-[160px] md:w-[200px]"
      }`}
    >
      <div className={`relative ${featured ? "aspect-[2/3]" : "aspect-[2/3]"}`}>
        <MovieImage
          src={getImageUrl(movie.poster_path, "w500")}
          alt={movie.title}
          fill
          className="object-cover"
          sizes={featured ? "(max-width: 768px) 300px, 340px" : "(max-width: 768px) 160px, 200px"}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-white text-sm md:text-base line-clamp-2">{movie.title}</h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-300">
            <span className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              {movie.vote_average.toFixed(1)}
            </span>
            <span>•</span>
            <span>{new Date(movie.release_date).getFullYear()}</span>
          </div>
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {genres.map(genre => (
                <span key={genre} className="px-2 py-0.5 bg-white/20 rounded text-xs">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Badge note */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 rounded-full text-xs">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span className="text-white font-medium">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
};

const MovieCarousel = ({ title, movies, icon }: { title: string; movies: TMDBMovie[]; icon?: React.ReactNode }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useState<HTMLDivElement | null>(null);
  
  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById(`carousel-${title.replace(/\s/g, "-")}`);
    if (container) {
      const scrollAmount = direction === "left" ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setScrollPosition(container.scrollLeft + scrollAmount);
    }
  };

  return (
    <section className="relative py-6">
      <div className="flex items-center gap-3 mb-4 px-4 md:px-12">
        {icon}
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      </div>
      
      <div className="relative group">
        {/* Bouton gauche */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="Défiler vers la gauche"
        >
          <ChevronLeft size={32} className="text-white" />
        </button>
        
        {/* Container scroll */}
        <div
          id={`carousel-${title.replace(/\s/g, "-")}`}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        
        {/* Bouton droite */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="Défiler vers la droite"
        >
          <ChevronRight size={32} className="text-white" />
        </button>
      </div>
    </section>
  );
};

const FormulaCard = ({ formula }: { formula: typeof FORMULAS[0] }) => {
  const getIcon = (formulaId: string) => {
    switch (formulaId) {
      case 'cine-duo': return <Heart size={32} />;
      case 'cine-team': return <Users size={32} />;
      case 'cine-groupe': return <Crown size={32} />;
      default: return <Film size={32} />;
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${formula.color} p-1 transition-all hover:scale-[1.02] group`}>
      {/* Inner card */}
      <div className="relative bg-[#0a0a0a]/90 rounded-xl p-6 md:p-8 h-full">
        {formula.popular && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-500 rounded-full text-xs font-bold">
            <Sparkles size={12} />
            Populaire
          </div>
        )}
        
        {/* Icon avec cercle gradient */}
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${formula.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
          {getIcon(formula.id)}
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">{formula.name}</h3>
        <p className="text-gray-400 mb-6">{formula.description}</p>
        
        {/* Prix mis en avant */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{formula.basePrice}€</span>
            <span className="text-gray-400">/ séance</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
            <Users size={16} />
            <span>Jusqu'à {formula.seats} personnes</span>
          </div>
        </div>
        
        {/* Features */}
        <ul className="space-y-2 mb-6 text-sm text-gray-300">
          <li className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 text-xs">✓</span>
            </div>
            Salle privée garantie
          </li>
          <li className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 text-xs">✓</span>
            </div>
            Écran 4K & Son Dolby
          </li>
          <li className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 text-xs">✓</span>
            </div>
            Consommables disponibles
          </li>
        </ul>
        
        <SignedIn>
          <Link
            href={`/book?formula=${formula.id}`}
            className={`block w-full py-4 bg-gradient-to-r ${formula.color} hover:opacity-90 rounded-xl text-center font-bold transition-all`}
          >
            Choisir cette formule
          </Link>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className={`w-full py-4 bg-gradient-to-r ${formula.color} hover:opacity-90 rounded-xl font-bold transition-all`}>
              Choisir cette formule
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
};

// ============================================
// PAGE PRINCIPALE
// ============================================

export default function LandingPage() {
  const [heroMovie, setHeroMovie] = useState<TMDBMovie | null>(null);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    // Charger les films mock (ou depuis TMDB avec clé API)
    setMovies(MOCK_MOVIES);
    setHeroMovie(MOCK_MOVIES[0]);
  }, []);

  // Rotation automatique du hero
  useEffect(() => {
    if (movies.length === 0) return;
    
    const interval = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % Math.min(movies.length, 5);
        setHeroMovie(movies[next]);
        return next;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [movies]);

  const trendingMovies = movies.slice(0, 10);
  const actionMovies = movies.filter(m => m.genre_ids?.includes(28));
  const sfMovies = movies.filter(m => m.genre_ids?.includes(878));
  const dramaMovies = movies.filter(m => m.genre_ids?.includes(18));
  const comedyMovies = movies.filter(m => m.genre_ids?.includes(35));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header fixe transparent */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 via-black/50 to-transparent">
        <div className="max-w-[1800px] mx-auto px-4 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Film size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">
              Cine<span className="text-red-500">Room</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/catalogue" className="hover:text-red-400 transition-colors font-medium">
              Catalogue
            </Link>
            <SignedIn>
              <Link href="/dashboard" className="hover:text-red-400 transition-colors font-medium">
                Mes Réservations
              </Link>
            </SignedIn>
            <Link href="#formules" className="hover:text-red-400 transition-colors font-medium">
              Nos Formules
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors">
                  Connexion
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/book"
                className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors"
              >
                <Ticket size={18} />
                Réserver
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {heroMovie && (
        <section className="relative h-[85vh] min-h-[600px]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <MovieImage
              src={getBackdropUrl(heroMovie.backdrop_path)}
              alt={heroMovie.title}
              fill
              className="object-cover"
              priority
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-[1800px] mx-auto px-4 md:px-12 flex items-center">
            <div className="max-w-2xl pt-20">
              {/* Badges */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-red-500 rounded-full text-sm font-medium">
                  À l&apos;affiche
                </span>
                <span className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  {heroMovie.vote_average.toFixed(1)}
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                  {new Date(heroMovie.release_date).getFullYear()}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight">
                {heroMovie.title}
              </h1>

              {/* Synopsis */}
              <p className="text-lg text-gray-300 mb-8 line-clamp-3 md:line-clamp-4">
                {heroMovie.overview}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <SignedIn>
                  <Link
                    href={`/book?movie=${heroMovie.id}`}
                    className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-lg transition-colors"
                  >
                    <Ticket size={24} />
                    Réserver une salle
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-lg transition-colors">
                      <Ticket size={24} />
                      Réserver une salle
                    </button>
                  </SignInButton>
                </SignedOut>
                <Link
                  href={`/movie/${heroMovie.id}`}
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full font-bold text-lg transition-all"
                >
                  <Play size={24} />
                  Plus d&apos;infos
                </Link>
              </div>
            </div>
          </div>

          {/* Hero navigation dots */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
            {movies.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setHeroIndex(index);
                  setHeroMovie(movies[index]);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === heroIndex ? "w-8 bg-red-500" : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Voir le film ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Nos Formules */}
      <section id="formules" className="py-16 px-4 md:px-12 max-w-[1800px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Votre expérience <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">sur mesure</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choisissez la formule qui vous correspond. Salle privée, grand écran, son immersif.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FORMULAS.map((formula) => (
            <FormulaCard key={formula.id} formula={formula} />
          ))}
        </div>
      </section>

      {/* Carrousels de films */}
      <div className="pb-12 max-w-[1800px] mx-auto">
        <MovieCarousel
          title="Tendances"
          movies={trendingMovies}
          icon={<Sparkles className="text-red-500" size={24} />}
        />
        
        {actionMovies.length > 0 && (
          <MovieCarousel
            title="Action"
            movies={actionMovies}
            icon={<Zap className="text-yellow-500" size={24} />}
          />
        )}
        
        {sfMovies.length > 0 && (
          <MovieCarousel
            title="Science-Fiction"
            movies={sfMovies}
            icon={<Rocket className="text-blue-400" size={24} />}
          />
        )}
        
        {dramaMovies.length > 0 && (
          <MovieCarousel
            title="Drame"
            movies={dramaMovies}
            icon={<Theater className="text-purple-400" size={24} />}
          />
        )}
        
        {comedyMovies.length > 0 && (
          <MovieCarousel
            title="Comédie"
            movies={comedyMovies}
            icon={<Smile className="text-green-400" size={24} />}
          />
        )}
      </div>

      {/* Section avantages */}
      <section className="py-20 px-4 md:px-12 bg-gradient-to-b from-transparent via-red-950/10 to-transparent">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Pourquoi choisir <span className="text-red-500">CineRoom</span> ?
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 hover:bg-white/10 transition-all hover:scale-105 border border-transparent hover:border-red-500/20">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-2xl flex items-center justify-center">
                <Film className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Salle Privée</h3>
              <p className="text-gray-400">Profitez d'une salle rien que pour vous, sans distraction</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 hover:bg-white/10 transition-all hover:scale-105 border border-transparent hover:border-red-500/20">
              <div className="w-16 h-16 mx-auto mb-6 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                <Popcorn className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Consommables</h3>
              <p className="text-gray-400">Popcorn, boissons et snacks premium à votre disposition</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 hover:bg-white/10 transition-all hover:scale-105 border border-transparent hover:border-red-500/20">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Réservation Simple</h3>
              <p className="text-gray-400">Choisissez votre créneau en quelques clics seulement</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 hover:bg-white/10 transition-all hover:scale-105 border border-transparent hover:border-red-500/20">
              <div className="w-16 h-16 mx-auto mb-6 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                <Volume2 className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expérience VIP</h3>
              <p className="text-gray-400">Son Dolby Atmos, écran 4K, confort optimal garanti</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Prêt pour une expérience <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">inoubliable</span> ?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Réservez votre salle privée dès maintenant
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-10 py-5 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-xl transition-colors">
                Commencer maintenant
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/book"
              className="inline-flex items-center gap-3 px-10 py-5 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-xl transition-colors"
            >
              <Ticket size={28} />
              Réserver maintenant
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 md:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Film size={18} className="text-white" />
              </div>
              <span className="text-xl font-black">
                Cine<span className="text-red-500">Room</span>
              </span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <Link href="/mentions-legales" className="hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link href="/cgv" className="hover:text-white transition-colors">
                CGV
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            
            <p className="text-sm text-gray-500">
              © 2026 CineRoom. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
