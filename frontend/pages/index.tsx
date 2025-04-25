'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Movie {
  id: string;
  movieId: string;
  title: string;
  poster_path: string;
  runtime: number;
  rating?: number;
  genres: string;
  tagline: string;
  director: string;
  original_title: string;
  torrent_link: string;
  overview: string;
  year: number;
  createdAt: string;
  userId: string;
}

interface User {
  email: string;
  username: string;
}

const MovieCard = ({ movie }: { movie: Movie }) => (
  <Link
    href={`/movies/${movie.movieId}`}
    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300 ease-in-out"
  >
    <div className="relative">
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="w-full h-64 object-cover object-center"
      />

      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-transparent text-white p-2 flex justify-between items-center rounded-t-xl">
        <span className="text-sm bg-black bg-opacity-60 px-2 py-1 rounded">{movie.runtime} min</span>
        <span className="text-sm bg-black bg-opacity-60 px-2 py-1 rounded">
          {movie.rating ? movie.rating.toFixed(1) : 'N/A'}/10
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-transparent text-white p-4 rounded-b-xl">
        <h3 className="font-bold text-lg truncate drop-shadow-md">{movie.title}</h3>
      </div>
    </div>
  </Link>
);

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User>({ email: '', username: '' });
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
      setError('Usuário não autenticado');
      router.push('/login');
      return;
    }

    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/movies')
        setMovies(response.data);
      } catch {
        setError('Erro ao carregar filmes');
      }
    };

    const fetchData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:3001/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(userResponse.data);
        fetchMovies();
      } catch {
        setError('Token inválido ou expirado');
        localStorage.removeItem('jwt_token');
        router.push('/login');
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-gray-900 text-white p-5 flex justify-between items-center max-w-7xl mx-auto rounded-b-lg shadow-md">
        <h1 className="text-3xl font-extrabold tracking-wide">
          <Link href="/" className="hover:text-indigo-400 transition-colors duration-300">
            TorrentMovies
          </Link>
        </h1>
        <div className="flex items-center gap-5">
          <span className="text-sm sm:text-base">Bem-vindo(a), <strong>{user.email}</strong>!</span>
          <button
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg shadow-md transition-colors duration-300 font-semibold"
            onClick={() => router.push('/dashboard')}
          >
            Meu perfil
          </button>
          <button
            className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-colors duration-300 font-semibold"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 animate-fadeIn"
          >
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold">Erro: {error}</p>
          </div>
        )}

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {movies.length > 0 ? (
            movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
          ) : (
            <p className="col-span-full text-center text-gray-400 text-lg font-medium mt-20">
              Nenhum filme disponível.
            </p>
          )}
        </section>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {opacity: 0;}
          to {opacity: 1;}
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
