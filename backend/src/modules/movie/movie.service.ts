import { MovieRepository } from './movie.repository';
import { MovieInput } from './movie.types';

export const MovieService = {

    getAllMovies: async () => {
        return await MovieRepository.getAllMovies();
    },

    getMovieById: async (movieId: string) => {
        return await MovieRepository.getMovieById(movieId);
    },

    getMoviesByUserId: async (userId: string) => {
        return await MovieRepository.getMoviesByUserId(userId);
    },

    deleteMovie: async (movieId: string) => {
        return await MovieRepository.deleteMovie(movieId);
    },

    createMovie: async (data: MovieInput) => {
        return await MovieRepository.createMovie(data);
    }

}