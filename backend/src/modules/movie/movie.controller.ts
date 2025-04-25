import { movieSchema } from './movie.schema';
import jwt from 'jsonwebtoken';
import { MovieService } from './movie.service';

const JWT_SECRET = process.env.JWT_SECRET || 'cm9j37yle0000u22ojpeyl2fg';

export const getMoviesHandler = async () => {
    return MovieService.getAllMovies()
}

export const getMoviesByUserIdHandler = async ({ request }: any) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Token não fornecido', { status: 401 });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const { id } = decoded as { [key: string]: any };

        if (!id) {
            return new Response('Unauthorized', { status: 401 });
        }

        const movies = await MovieService.getMoviesByUserId(id);

        return { movies };
    } catch (error) {
        return new Response('Token inválido', { status: 401 });
    }
}

export const createMovieHandler = async ({ request, body }: any) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Token não fornecido', { status: 401 });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const result = movieSchema.safeParse(body);
        if (!result.success) {
            return new Response(JSON.stringify({ error: 'Dados inválidos', details: result.error.errors }), {
                status: 400
            });
        }

        const movieData = { ...result.data, userId: decoded.id }; // força o userId correto

        return await MovieService.createMovie(movieData);
    } catch (error) {
        return new Response('Token inválido', { status: 401 });
    }
};

export const getMovieByIdHandler = async ({ params }: any) => {
    const movie = await MovieService.getMovieById(params.id)
    if (!movie) {
        return { error: 'Movie not found' }
    }

    return movie
}
export const deleteMovieHandler = async ({ params }: any) => {
    const movie = await MovieService.getMovieById(params.movieId);
    if (!movie) {
        return { error: 'Movie not found' };
    }

    return await MovieService.deleteMovie(params.movieId);
}