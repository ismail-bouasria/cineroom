import { TMDBMovie, TMDBGenre, TMDB_GENRES } from "@/types";

// ============================================
// CONFIGURATION TMDB
// ============================================

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Clé API TMDB (à mettre dans .env.local en production)
// Cette clé est publique pour le frontend (read-only)
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "demo";

// ============================================
// HELPERS IMAGES
// ============================================

export const getImageUrl = (path: string | null, size: "w200" | "w300" | "w400" | "w500" | "w780" | "original" = "w500"): string => {
  if (!path) return "/placeholder-movie.jpg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: "w300" | "w780" | "w1280" | "original" = "w1280"): string => {
  if (!path) return "/placeholder-backdrop.jpg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

// ============================================
// HELPER GENRES
// ============================================

export const getGenreNames = (genreIds: number[]): string[] => {
  return genreIds
    .map(id => TMDB_GENRES[id])
    .filter(Boolean);
};

export const getGenreName = (genreId: number): string => {
  return TMDB_GENRES[genreId] || "Inconnu";
};

// ============================================
// API CALLS
// ============================================

interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

const fetchTMDB = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "fr-FR",
    ...params
  });

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 3600 } // Cache pendant 1 heure
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status}`);
  }

  return response.json();
};

// ============================================
// SERVICES FILMS
// ============================================

export const tmdbService = {
  /**
   * Films tendances de la semaine
   */
  getTrending: async (page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return fetchTMDB<TMDBResponse<TMDBMovie>>("/trending/movie/week", { page: String(page) });
  },

  /**
   * Films actuellement en salle
   */
  getNowPlaying: async (page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/now_playing", { page: String(page) });
  },

  /**
   * Films à venir
   */
  getUpcoming: async (page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/upcoming", { page: String(page) });
  },

  /**
   * Films populaires
   */
  getPopular: async (page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/popular", { page: String(page) });
  },

  /**
   * Films les mieux notés
   */
  getTopRated: async (page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/top_rated", { page: String(page) });
  },

  /**
   * Détails d'un film
   */
  getMovieDetails: async (movieId: number): Promise<TMDBMovie & { genres: TMDBGenre[]; runtime: number }> => {
    return fetchTMDB(`/movie/${movieId}`);
  },

  /**
   * Films similaires
   */
  getSimilar: async (movieId: number, page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return fetchTMDB<TMDBResponse<TMDBMovie>>(`/movie/${movieId}/similar`, { page: String(page) });
  },

  /**
   * Films par genre
   */
  getByGenre: async (genreId: number, page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return fetchTMDB<TMDBResponse<TMDBMovie>>("/discover/movie", {
      page: String(page),
      with_genres: String(genreId),
      sort_by: "popularity.desc"
    });
  },

  /**
   * Recherche de films
   */
  search: async (query: string, page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return fetchTMDB<TMDBResponse<TMDBMovie>>("/search/movie", {
      query,
      page: String(page)
    });
  },

  /**
   * Liste des genres
   */
  getGenres: async (): Promise<{ genres: TMDBGenre[] }> => {
    return fetchTMDB("/genre/movie/list");
  }
};

// ============================================
// DONNÉES MOCK (fallback si pas d'API key)
// ============================================

export const MOCK_MOVIES: TMDBMovie[] = [
  {
    id: 1,
    title: "Dune: Deuxième Partie",
    original_title: "Dune: Part Two",
    overview: "Paul Atréides s'unit à Chani et aux Fremen pour mener une guerre de vengeance contre les conspirateurs qui ont détruit sa famille.",
    poster_path: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    release_date: "2024-02-27",
    vote_average: 8.3,
    vote_count: 4500,
    genre_ids: [878, 12],
    popularity: 2500
  },
  {
    id: 2,
    title: "Oppenheimer",
    original_title: "Oppenheimer",
    overview: "L'histoire de J. Robert Oppenheimer et son rôle dans le développement de la bombe atomique.",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    release_date: "2023-07-19",
    vote_average: 8.1,
    vote_count: 8200,
    genre_ids: [18, 36],
    popularity: 1800
  },
  {
    id: 3,
    title: "Spider-Man: Across the Spider-Verse",
    original_title: "Spider-Man: Across the Spider-Verse",
    overview: "Miles Morales traverse le multivers et rencontre une équipe de Spider-Mans chargés de protéger son existence.",
    poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop_path: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    release_date: "2023-05-31",
    vote_average: 8.4,
    vote_count: 6100,
    genre_ids: [16, 28, 12],
    popularity: 2200
  },
  {
    id: 4,
    title: "The Batman",
    original_title: "The Batman",
    overview: "Batman enquête sur une série de meurtres à Gotham City et se retrouve impliqué dans un réseau de corruption.",
    poster_path: "/3VFI3zbuNhXzx7dIbYdmvBLekyB.jpg",
    backdrop_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    release_date: "2022-03-01",
    vote_average: 7.7,
    vote_count: 9800,
    genre_ids: [80, 9648, 53],
    popularity: 1500
  },
  {
    id: 5,
    title: "Avatar: La Voie de l'Eau",
    original_title: "Avatar: The Way of Water",
    overview: "Jake Sully et Neytiri ont formé une famille et font tout pour rester ensemble. Cependant, ils doivent quitter leur foyer et explorer les différentes régions de Pandora.",
    poster_path: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    backdrop_path: "/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    release_date: "2022-12-14",
    vote_average: 7.6,
    vote_count: 11000,
    genre_ids: [878, 12, 28],
    popularity: 3200
  },
  {
    id: 6,
    title: "Barbie",
    original_title: "Barbie",
    overview: "Barbie et Ken passent le plus beau des moments dans le monde coloré et joyeux de Barbie Land. Quand ils ont l'opportunité d'aller dans le vrai monde, ils découvrent les joies et les peines de la vie.",
    poster_path: "/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    backdrop_path: "/nHf61UzkfFno5dHMp9bv6E8P1rR.jpg",
    release_date: "2023-07-19",
    vote_average: 7.0,
    vote_count: 7500,
    genre_ids: [35, 12, 14],
    popularity: 2100
  },
  {
    id: 7,
    title: "Wonka",
    original_title: "Wonka",
    overview: "Basé sur le personnage extraordinaire au centre de Charlie et la Chocolaterie, le livre pour enfants le plus emblématique de Roald Dahl et l'un des plus vendus de tous les temps.",
    poster_path: "/qhb1qOilapbapxWQn9Pew8lJWBu.jpg",
    backdrop_path: "/yOm993lsJyPmBodlYjgpPwBjXP9.jpg",
    release_date: "2023-12-06",
    vote_average: 7.2,
    vote_count: 2500,
    genre_ids: [35, 10751, 14],
    popularity: 1600
  },
  {
    id: 8,
    title: "Killers of the Flower Moon",
    original_title: "Killers of the Flower Moon",
    overview: "Dans les années 1920, les Osage sont les personnes les plus riches des États-Unis. Mais la découverte de pétrole sur leurs terres entraîne une série de meurtres.",
    poster_path: "/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg",
    backdrop_path: "/1X7vow16X7CnCoexXh4H4F2yDJv.jpg",
    release_date: "2023-10-18",
    vote_average: 7.5,
    vote_count: 3200,
    genre_ids: [80, 18, 36],
    popularity: 1400
  },
  {
    id: 9,
    title: "Poor Things",
    original_title: "Poor Things",
    overview: "L'incroyable histoire de Bella Baxter, une jeune femme ramenée à la vie par le brillant et peu orthodoxe scientifique Dr. Godwin Baxter.",
    poster_path: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    backdrop_path: "/bQS43HSLZzMjZkcHJz4fGc7fNdz.jpg",
    release_date: "2023-12-07",
    vote_average: 7.9,
    vote_count: 2800,
    genre_ids: [878, 10749, 35],
    popularity: 1300
  },
  {
    id: 10,
    title: "Aquaman et le Royaume Perdu",
    original_title: "Aquaman and the Lost Kingdom",
    overview: "Aquaman doit forger une alliance improbable avec un allié inattendu pour protéger Atlantis et le monde d'une destruction irréversible.",
    poster_path: "/7lTnXOy0iNtBAdRP3TZvaKJ77F6.jpg",
    backdrop_path: "/cnqwv5Uz3UW5f086IWbQKr3ksJr.jpg",
    release_date: "2023-12-20",
    vote_average: 6.5,
    vote_count: 2100,
    genre_ids: [28, 12, 14],
    popularity: 1100
  },
  {
    id: 11,
    title: "The Marvels",
    original_title: "The Marvels",
    overview: "Carol Danvers, alias Captain Marvel, a récupéré son identité des Kree tyranniques et s'est vengée de l'Intelligence Suprême.",
    poster_path: "/Ag3D9qXjhwitJLT2WKWQ5WM3hFk.jpg",
    backdrop_path: "/dRYCM84oaVMFPvB1lJEuNfE7OUi.jpg",
    release_date: "2023-11-08",
    vote_average: 6.2,
    vote_count: 1900,
    genre_ids: [28, 12, 878],
    popularity: 950
  },
  {
    id: 12,
    title: "Napoléon",
    original_title: "Napoleon",
    overview: "Un examen de la montée au pouvoir de Napoléon Bonaparte et de sa relation avec sa femme Joséphine.",
    poster_path: "/jE5o7y9K6pZtWNNMEw3IdpHuncR.jpg",
    backdrop_path: "/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg",
    release_date: "2023-11-22",
    vote_average: 6.5,
    vote_count: 2400,
    genre_ids: [36, 18, 10752],
    popularity: 1050
  },
  // Films d'horreur
  {
    id: 13,
    title: "Smile",
    original_title: "Smile",
    overview: "Après avoir été témoin d'un incident bizarre et traumatisant impliquant une patiente, la Dr. Rose Cotter commence à vivre des événements effrayants qu'elle ne peut pas expliquer.",
    poster_path: "/aPqcQwu4VGEewPhagWNncDbJ9Xp.jpg",
    backdrop_path: "/olPXihyFeeNvnaD6IOBltgIV1FU.jpg",
    release_date: "2022-09-23",
    vote_average: 6.8,
    vote_count: 3500,
    genre_ids: [27, 9648, 53],
    popularity: 1800
  },
  {
    id: 14,
    title: "M3GAN",
    original_title: "M3GAN",
    overview: "Une roboticienne dans une entreprise de jouets construit une poupée grandeur nature alimentée par l'intelligence artificielle qui commence à prendre une vie propre.",
    poster_path: "/d9nBoowhjiiYc4FBNtQkPY7c11H.jpg",
    backdrop_path: "/dlrWhn0G3AtxYUx2D9P2bmzcsvF.jpg",
    release_date: "2022-12-28",
    vote_average: 7.1,
    vote_count: 4200,
    genre_ids: [27, 878, 53],
    popularity: 2000
  },
  {
    id: 15,
    title: "Talk to Me",
    original_title: "Talk to Me",
    overview: "Lorsqu'un groupe d'amis découvre comment invoquer des esprits en utilisant une main embaumée, ils deviennent accros au frisson de cette nouvelle expérience.",
    poster_path: "/kdPMUMJzyYAc4roD52qavX0nLIC.jpg",
    backdrop_path: "/oOqRUTRNeFjW9U7mEGTQGR1VJVp.jpg",
    release_date: "2023-07-26",
    vote_average: 7.2,
    vote_count: 2800,
    genre_ids: [27, 53],
    popularity: 1700
  },
  {
    id: 16,
    title: "Five Nights at Freddy's",
    original_title: "Five Nights at Freddy's",
    overview: "Un agent de sécurité en difficulté commence à travailler chez Freddy Fazbear's Pizza. Durant sa première nuit au travail, il réalise que le quart de nuit ne sera pas si facile.",
    poster_path: "/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg",
    backdrop_path: "/t5zCBSB5xMDKcDqe91qahCOUYVV.jpg",
    release_date: "2023-10-25",
    vote_average: 7.8,
    vote_count: 5600,
    genre_ids: [27, 9648],
    popularity: 2500
  },
  {
    id: 17,
    title: "The Nun II",
    original_title: "The Nun II",
    overview: "1956 - France. Un prêtre est assassiné. Un mal se répand. Sœur Irène est une fois de plus confrontée à la force démoniaque Valak.",
    poster_path: "/5gzzkR7y3ber1kGV7TZUzDsGEVb.jpg",
    backdrop_path: "/lmPmCN1lGb50GGWtrxsOiY4t9tC.jpg",
    release_date: "2023-09-06",
    vote_average: 6.5,
    vote_count: 2100,
    genre_ids: [27, 9648, 53],
    popularity: 1400
  },
  {
    id: 18,
    title: "The Exorcist: Believer",
    original_title: "The Exorcist: Believer",
    overview: "Depuis que sa femme est morte en donnant naissance à leur fille Angela, Victor Fielding l'élève seul. Quand Angela et son amie disparaissent dans la forêt, leur retour marque le début d'une terreur.",
    poster_path: "/qVKirUdmoex8SdfUk8WDLCv5gs2.jpg",
    backdrop_path: "/tGoX05G0V4Jl6WVnpPZAfKkrLNT.jpg",
    release_date: "2023-10-04",
    vote_average: 5.6,
    vote_count: 1800,
    genre_ids: [27],
    popularity: 1200
  }
];

// Fonction pour récupérer les films (avec fallback mock)
export const getMovies = async (type: "trending" | "now_playing" | "upcoming" | "popular" | "top_rated" = "trending"): Promise<TMDBMovie[]> => {
  // Si pas de clé API, utiliser les données mock
  if (TMDB_API_KEY === "demo") {
    return MOCK_MOVIES;
  }

  try {
    let response: TMDBResponse<TMDBMovie>;
    
    switch (type) {
      case "now_playing":
        response = await tmdbService.getNowPlaying();
        break;
      case "upcoming":
        response = await tmdbService.getUpcoming();
        break;
      case "popular":
        response = await tmdbService.getPopular();
        break;
      case "top_rated":
        response = await tmdbService.getTopRated();
        break;
      default:
        response = await tmdbService.getTrending();
    }
    
    return response.results;
  } catch {
    console.warn("TMDB API error, using mock data");
    return MOCK_MOVIES;
  }
};

// Fonction pour récupérer un film par ID
export const getMovieById = async (id: number): Promise<TMDBMovie | null> => {
  if (TMDB_API_KEY === "demo") {
    return MOCK_MOVIES.find(m => m.id === id) || null;
  }

  try {
    return await tmdbService.getMovieDetails(id);
  } catch {
    return MOCK_MOVIES.find(m => m.id === id) || null;
  }
};
