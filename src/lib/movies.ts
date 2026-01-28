export interface Movie {
  id: number;
  title: string;
  image: string;
  rating: number;
  category: string;
  duration: number;
  year: number;
  synopsis: string;
  director: string;
  actors: string[];
  trailer: string;
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Interstellar",
    image: "https://images.unsplash.com/photo-1536431311894-8c1ead017266?w=400&h=600&fit=crop",
    rating: 8.6,
    category: "Science-fiction",
    duration: 169,
    year: 2014,
    synopsis: "Un groupe d'explorateurs utilise un trou de ver récemment découvert pour dépasser les limites actuelles des voyages spatiaux et conquérir les distances énormes.",
    director: "Christopher Nolan",
    actors: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    trailer: "https://www.youtube.com/embed/zSID6lw4 Ferdinand"
  },
  {
    id: 2,
    title: "Oppenheimer",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=600&fit=crop",
    rating: 8.5,
    category: "Drame",
    duration: 180,
    year: 2023,
    synopsis: "La vie du physicien J. Robert Oppenheimer et son rôle en tant que directeur du Projet Manhattan pendant la Seconde Guerre mondiale.",
    director: "Christopher Nolan",
    actors: ["Cillian Murphy", "Robert Downey Jr.", "Emily Blunt"],
    trailer: "https://www.youtube.com/embed/uYPbbksJxIg"
  },
  {
    id: 3,
    title: "Dune",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    rating: 8.0,
    category: "Science-fiction",
    duration: 156,
    year: 2021,
    synopsis: "Paul Atreides, un jeune homme brillant, doit voyager vers la planète la plus dangereuse de l'univers pour assurer l'avenir de sa famille et de ses peuples.",
    director: "Denis Villeneuve",
    actors: ["Timothée Chalamet", "Zendaya", "Oscar Isaac"],
    trailer: "https://www.youtube.com/embed/n9xhJsAgZmw"
  },
  {
    id: 4,
    title: "Avatar",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    rating: 7.8,
    category: "Science-fiction",
    duration: 162,
    year: 2009,
    synopsis: "Un paraplégique des Marines se rend sur la lune extraterrestre de Pandora et devient l'un des indigènes, luttant contre la conquête commerciale de sa nouvelle maison.",
    director: "James Cameron",
    actors: ["Sam Worthington", "Zoe Saldana", "Stephen Lang"],
    trailer: "https://www.youtube.com/embed/5PSNL1qE6VQ"
  },
  {
    id: 5,
    title: "Inception",
    image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=400&h=600&fit=crop",
    rating: 8.8,
    category: "Science-fiction",
    duration: 148,
    year: 2010,
    synopsis: "Un voleur spécialisé en vol de secrets d'entreprise à travers la technologie de partage de rêve se voit offrir une chance de reprendre sa vie normale.",
    director: "Christopher Nolan",
    actors: ["Leonardo DiCaprio", "Marion Cotillard", "Ellen Page"],
    trailer: "https://www.youtube.com/embed/YoHD_XwIlNY"
  },
  {
    id: 6,
    title: "Matrix",
    image: "https://images.unsplash.com/photo-1478720568477-152d9e3fb3f3?w=400&h=600&fit=crop",
    rating: 8.7,
    category: "Science-fiction",
    duration: 136,
    year: 1999,
    synopsis: "Un hacker en ligne apprend de rebelles en ligne le vrai secret sur sa réalité et le vrai danger qui le menace.",
    director: "Lana Wachowski, Lilly Wachowski",
    actors: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
    trailer: "https://www.youtube.com/embed/vKQi3bBA1y8"
  },
  {
    id: 7,
    title: "Avengers: Endgame",
    image: "https://images.unsplash.com/photo-1533613220915-609f22a34ffd?w=400&h=600&fit=crop",
    rating: 8.4,
    category: "Action",
    duration: 181,
    year: 2019,
    synopsis: "Après les événements dévastateurs du Snapture, les Avengers se rassemblent une dernière fois pour inverser les actions de Thanos et restaurer l'équilibre de l'univers.",
    director: "Anthony Russo, Joe Russo",
    actors: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo"],
    trailer: "https://www.youtube.com/embed/TcMBFSGVi1c"
  },
  {
    id: 8,
    title: "Gladiateur",
    image: "https://images.unsplash.com/photo-1449513032081-7bc8ab266aae?w=400&h=600&fit=crop",
    rating: 8.5,
    category: "Drame",
    duration: 155,
    year: 2000,
    synopsis: "Un ancien général romain est réduit en esclavage et devient gladiateur, cherchant sa vengeance contre l'empereur qui a assassiné sa famille.",
    director: "Ridley Scott",
    actors: ["Russell Crowe", "Joaquin Phoenix", "Lucilla"],
    trailer: "https://www.youtube.com/embed/owK1qxDselE"
  },
];

export const categories = [
  "Science-fiction",
  "Action",
  "Drame",
  "Comédie",
  "Thriller",
];

export function getMovieById(id: number): Movie | undefined {
  return movies.find(movie => movie.id === id);
}

export function getMoviesByCategory(category: string): Movie[] {
  return movies.filter(movie => movie.category === category);
}
