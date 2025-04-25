import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role] = useState('user');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const usernameRegex = /^[a-zA-Z0-9]+$/; // Permite letras e números, sem espaços
  const onlyNumbersRegex = /^\d+$/; // Verifica se é apenas números

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) { // logado 
      router.push('/dashboard');
      return;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!usernameRegex.test(username) || onlyNumbersRegex.test(username)) {
      setError('Nome de usuário inválido.');
      return;
    }

    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/users/register', {
        username,
        email,
        password,
      })

      if (response.status === 200 || response.status === 201) {
        router.push('/login');
      } else if (response.status === 400) {
        setError(response.data.message)
      } else {
        setError('Erro ao criar usuário')
      }

    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message || 'Erro ao criar usuário');
      } else {
        setError('Erro desconhecido');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Cadastre-se
        </h2>
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Nome de Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome de usuário"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder:text-gray-500"
            />
            {username && !usernameRegex.test(username) && (
              <div className="text-red-500 text-sm mt-1">
                Nome de usuário inválido.
              </div>
            )}
            {username && usernameRegex.test(username) && onlyNumbersRegex.test(username) && (
              <div className="text-red-500 text-sm mt-1">
                Nome de usuário inválido. Não pode ser apenas números.
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder:text-gray-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder:text-gray-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          >
            Cadastrar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
