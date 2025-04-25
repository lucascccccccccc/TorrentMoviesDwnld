'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link';

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export interface Movie {
  title: string;
  year: string;
  poster_path: string;
  genres: string;
  tagline: string;
  director: string;
  overview: string;
  original_title: string;
  torrent_link: string;
  rating: number;
  runtime: number;
  movie_id: string;
}

interface Review {
  id: string;
  comment: string;
  rating: number;
  userId: string;
  movieId: string;
  createdAt: string;
  user: { // Adiciona o usuário
    id: string;
    username: string;
  };
}

function RatingStars({ rating, setRating }: { rating: number, setRating: (rating: number) => void }) {
  const handleStarClick = (index: number) => {
    setRating(index + 1); // Define a avaliação de 1 a 5 estrelas
  };

  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          onClick={() => handleStarClick(index)}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={index < rating ? 'yellow' : 'gray'}
          className="cursor-pointer"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const movieId = pathname?.split('/').pop();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ comment: '', rating: 5 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) return;

    async function fetchMovie() {
      try {
        const response = await fetch(`http://localhost:3001/api/movies/${movieId}`);

        if (response.status === 405) {
          setError('Você precisa estar logado para acessar esta página.');
          setTimeout(() => router.push('/dashboard'), 2000);
          return;
        }

        if (!response.ok) {
          setError('Filme não encontrado');
          return;
        }

        setMovie(await response.json());

        // Buscar as reviews
        const reviewsResponse = await fetch(`http://localhost:3001/api/reviews/movie/${movieId}`);
        if (reviewsResponse.ok) {
          setReviews(await reviewsResponse.json());
        } else {
          setError('Erro ao carregar reviews');
        }

      } catch (error) {
        setError('Erro ao buscar filme');
      }
    }

    fetchMovie();
  }, [movieId, router]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se o comentário não está vazio
    if (!newReview.comment.trim()) {
      setError('O comentário não pode ser vazio.');
      return;
    }

    // Verifica se o rating está no intervalo correto
    if (newReview.rating < 1 || newReview.rating > 10) {
      setError('A avaliação deve ser entre 1 e 10.');
      return;
    }

    // Verifica se o movieId está presente
    if (!movieId) {
      setError('O ID do filme é inválido.');
      return;
    }

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError('Você precisa estar logado para enviar uma review.');
      setTimeout(() => router.push('/dashboard'), 2000);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Adicionando o token no cabeçalho
        },


        body: JSON.stringify({
          comment: newReview.comment,
          rating: newReview.rating,
          movieId,
        }),
      });

      if (response.ok) {
        const addedReview = await response.json();
        setReviews([addedReview, ...reviews]);
        setNewReview({ comment: '', rating: 5 });
      } else {
        const errorData = await response.json();
        setError(`Erro ao enviar review: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      setError('Erro ao enviar review. Por favor, tente novamente mais tarde.');
    }
  };

  if (!movie && !error) return <div className="text-center py-20 text-lg">Carregando...</div>;

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
      </div>
    );
  }

  if (!movie) return null;

  const genresArray = movie.genres ? movie.genres.split(',').map((genre: string) => genre.trim()) : [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6 flex justify-between items-center shadow-md">
        <h1 className="text-3xl font-extrabold text-shadow">
          <Link href="/" className="hover:text-indigo-400 transition-colors duration-300">
            TorrentMovies
          </Link>
        </h1>
        <div>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300"
          >
            Voltar para a lista
          </Link>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-xl mt-10">
        <div className="flex flex-wrap justify-center gap-10">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-64 h-96 rounded-2xl shadow-2xl object-cover"
          />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 text-gray-800">{movie.title}</h1>
            <h2 className="text-2xl font-semibold mb-3 text-gray-700">{movie.original_title}</h2>
            <p className="text-gray-600 italic mb-5">{movie.tagline}</p>

            <div className="flex flex-wrap gap-4 mb-6">
              <span className="bg-gray-200 py-2 px-4 rounded-full font-semibold text-gray-700">
                Nota: {movie.rating}
              </span>
              <span className="bg-gray-200 py-2 px-4 rounded-full font-semibold text-gray-700">
                Ano: {movie.year}
              </span>
              <span className="bg-gray-200 py-2 px-4 rounded-full font-semibold text-gray-700">
                Diretor: {movie.director}
              </span>
              <span className="bg-gray-200 py-2 px-4 rounded-full font-semibold text-gray-700">
                Duração: {movie.runtime} min
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {genresArray.map((genre: string) => (
                <span
                  key={genre}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm hover:bg-indigo-200 transition-colors duration-200"
                >
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-gray-700 leading-relaxed text-lg">{movie.overview}</p>
          </div>
        </div>

        {/* Botão de download */}
        <div className="flex justify-center mt-10">
          <a
            href={movie.torrent_link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Baixar filme
          </a>
        </div>

        {/* Formulário para adicionar review */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Adicionar Review</h2>
          <form onSubmit={handleReviewSubmit} className="space-y-5">
            <div>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full p-5 border rounded-lg bg-gray-50 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Escreva sua review..."
                rows={5}
                required
              />
            </div>
            <div className="text-gray-700">
              <span>Avaliação:</span>
              <RatingStars rating={newReview.rating} setRating={(rating) => setNewReview({ ...newReview, rating })} />
            </div>
            <div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-300"
              >
                Enviar Review
              </button>
            </div>
          </form>
        </div>

        {/* Exibição das Reviews */}
        <div className="mt-16">
          <h2 className="text-4xl font-semibold text-gray-800 mb-8">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-xl text-gray-500 italic">Nenhuma review ainda.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 p-8 rounded-2xl shadow-md mb-6">
                <div className="flex justify-between items-center mb-5">
                  <p className="text-gray-500">{formatDateTime(review.createdAt)}</p>
                </div>
                <div className="mb-4">
                  <span className="text-gray-600 font-medium">Por:</span>
                  <span className="text-gray-800 font-semibold ml-2">{review.user.username}</span>
                </div>
                <p className="text-gray-900 text-xl leading-relaxed mb-5">{review.comment}</p>
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={index}
                      className={`text-3xl ${index < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-gray-500 ml-3">{`${review.rating}/5`}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
