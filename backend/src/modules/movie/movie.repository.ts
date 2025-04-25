import { prisma } from "../../database/db";
import { MovieInput } from "./movie.types";

export const MovieRepository = {
  getAllMovies: () => prisma.movie.findMany(),
  getMovieById: (movieId: string) => prisma.movie.findUnique({ where: { movieId } }),
  getMoviesByUserId: (userId: string) =>
    prisma.movie.findMany({
      where: { userId },
    }),

  deleteMovie: (movieId: string) =>
    prisma.movie.delete({
      where: { movieId },
    }),

  createMovie: (data: MovieInput) => prisma.movie.create({ data }),
}