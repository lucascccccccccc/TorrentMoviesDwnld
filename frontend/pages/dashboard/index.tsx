import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState({ email: "", username: "", role: "" });
  const [movies, setMovies] = useState<any[]>([]);
  const [searchedMovies, setSearchedMovies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [movieTitle, setMovieTitle] = useState('');
  const apiKey = "ab1f2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"; // Substitua pela sua chave da API do TMDB
  const [torrentLinks, setTorrentLinks] = useState<{ [key: number]: string }>({});
  const [decodedToken, setDecodedToken] = useState<any>(null);

  interface MyJwtPayload {
    id: string;
    email: string;
    username: string,
    role: string;
    exp: number;
    iat: number;
  }

  // Buscar dados do usuário ao montar o componente
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError("Usuário não autenticado");
      router.push("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode<MyJwtPayload>(token);
      setDecodedToken(decodedToken);
      // Busca os dados completos do usuário
      axios.get('http://localhost:3001/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(() => {
          setUser({
            email: decodedToken.email,
            username: decodedToken.username,
            role: decodedToken.role || "user"
          });
        })
        .catch(() => {
          setError("Erro ao buscar dados do usuário");
          router.push('/login');
        });

    } catch (err) {
      setError("Token inválido ou expirado");
      router.push("/login");
    }

    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/movies/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setMovies(response.data.movies);
      } catch (error) {
        setError("Erro ao buscar filmes adicionados");
      }
    };

    fetchMovies();
  }, [router]);


  const handleLogout = async () => {
    try {
      localStorage.removeItem("jwt_token");
      router.push('/login');
    } catch (error) {
      setError("Erro ao fazer logout");
    }
  };

  const handleAddMovie = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${movieTitle}&language=pt-br`);
      const movieData = response.data.results;
      if (movieData) {
        setSearchedMovies(movieData);
      } else {
        setError("Filme não encontrado");
      }
    } catch (error) {
      setError("Erro ao buscar filme");
    }
  };

  const handleAddToList = async (movie: any) => {
    const token = localStorage.getItem('jwt_token');
    if (!torrentLinks[movie.id] || torrentLinks[movie.id].trim() === "") {
      setError("Adicione um link de torrent antes de adicionar o filme");
      return;
    }

    try {
      // Buscar detalhes do filme
      const response = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=pt-br`);
      const movieDetails = response.data;

      // Buscar créditos do filme
      const creditsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${apiKey}&language=pt-br`);
      const credits = creditsResponse.data;
      const director = credits.crew.find((crewMember: any) => crewMember.job === 'Director');
      const directorName = director ? director.name : "Não especificado";

      // Preparar dados para enviar
      const movieData = {
        movieId: movie.id.toString(),
        title: movie.title,
        year: movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : null,
        poster_path: movie.poster_path,
        genres: movieDetails.genres ? movieDetails.genres.map((genre: any) => genre.name).join(", ") : "Não especificado",
        tagline: movieDetails.tagline,
        director: directorName,
        original_title: movieDetails.original_title || movie.title,
        rating: movieDetails.vote_average || 0,
        runtime: movieDetails.runtime || 0,
        overview: movieDetails.overview || "Descrição não disponível",
        torrent_link: torrentLinks[movie.id],
        userId: decodedToken?.id
      };

      // Verificação adicional
      if (!movieData.year) {
        setError("Ano de lançamento do filme não disponível");
        return;
      }

      // Enviar para o backend
      const responseFromServer = await axios.post('http://localhost:3001/api/movies', movieData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // console.log("Dados que serão enviados:", JSON.stringify(movieData, null, 2));


      // Atualizar estado após sucesso
      setMovies([...movies, movieData]);
      setSearchedMovies(searchedMovies.filter((m) => m.id !== movie.id));

      // console.log("Filme adicionado com sucesso:", responseFromServer.data);

    } catch (error: any) {
      if (error.response) {
        setError(`Erro ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError("O servidor não respondeu. Verifique sua conexão.");
      } else {
        setError(`Erro: ${error.message}`);
      }
    }
  };

  const handleRemoveMovie = async (movieId: string) => {
    try {
      setMovies(movies.filter(movie => movie.movieId !== movieId)); // Certifique-se de comparar o ID correto
      await axios.delete(`http://localhost:3001/api/movies/${movieId}`);
    } catch (error) {
      setError("Erro ao remover filme: " + error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800">
      {/* Cabeçalho Premium */}
      <header className="bg-white/90 backdrop-blur-lg shadow-lg p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            <a href="/">TorrentMovies</a>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="font-medium text-gray-700">{user.username || user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-red-500/20 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto p-4 md:p-6 max-w-7xl">
        {/* Seção do Perfil */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Seu Perfil
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-500">Nome de Usuário</p>
              </div>
              <p className="text-lg font-bold text-gray-800">{user.username || '-'}</p>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-500">E-mail</p>
              </div>
              <p className="text-lg font-bold text-gray-800">{user.email}</p>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-500">Tipo de Conta</p>
              </div>
              <p className="text-lg font-bold">
                {user.role === "ADMIN" ? (
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Administrador</span>
                ) : (
                  <span className="text-blue-600">Usuário</span>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Busca de Filmes (Apenas para ADMIN) */}
        {user.role === "ADMIN" && (
          <section className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Adicionar Novo Filme
              </h2>
            </div>

            <div className="p-6">
              <form onSubmit={handleAddMovie} className="mb-8">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      placeholder="Pesquise por filmes..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-green-500/30 flex items-center gap-2 whitespace-nowrap"
                  >
                    Buscar Filme
                  </button>
                </div>
              </form>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>{error}</div>
                </div>
              )}

              {/* Resultados da Busca */}
              {searchedMovies.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">Resultados da Busca</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {searchedMovies.map((movie, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 h-48 md:h-auto">
                            <img
                              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.jpg'}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="md:w-2/3 p-5">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-xl font-bold text-gray-800">{movie.title}</h3>
                              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                {movie.vote_average?.toFixed(1) || 'N/A'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-4 line-clamp-3">{movie.overview}</p>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link do Torrent</label>
                                <input
                                  type="text"
                                  placeholder="Cole o link aqui..."
                                  value={torrentLinks[movie.id] || ''}
                                  onChange={(e) => setTorrentLinks(prevLinks => ({ ...prevLinks, [movie.id]: e.target.value }))}
                                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                                />
                              </div>
                              <button
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                                onClick={() => handleAddToList(movie)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Adicionar à Coleção
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Coleção de Filmes */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                Sua Coleção
              </h2>
              <span className="text-xl font-bold bg-white/20 px-4 py-1 rounded-full">
                {movies.length} {movies.length === 1 ? 'filme' : 'filmes'}
              </span>
            </div>
          </div>

          <div className="p-6">
            {movies.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">Sua coleção está vazia</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {user.role === "ADMIN"
                    ? "Busque por filmes acima para começar sua coleção"
                    : "O administrador ainda não adicionou filmes à plataforma"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {movies.map((movie, index) => (
                  <div key={index} className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200">
                    <div className="aspect-[2/3] relative">
                      <img
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.jpg'}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                        <div className="flex justify-end">
                          <button
                            className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                            onClick={() => handleRemoveMovie(movie.movieId)}
                            title="Remover filme"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm line-clamp-2">{movie.title}</h3>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-200">{movie.year || 'N/A'}</span>
                            <span className="bg-yellow-400/90 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              {movie.rating?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}