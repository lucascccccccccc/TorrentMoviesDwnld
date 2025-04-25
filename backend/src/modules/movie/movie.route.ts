import { Elysia } from "elysia";
import {
  getMoviesHandler,
  createMovieHandler,
  getMoviesByUserIdHandler,
  deleteMovieHandler,
  getMovieByIdHandler,
} from "./movie.controller";

export const movieRoutes = new Elysia({ prefix: "/movies" })
  // .onBeforeHandle(checkToken) // Uncomment this line if you want to protect the routes with authentication
  .get("/", getMoviesHandler)
  .get("/:id", getMovieByIdHandler)
  .delete("/:movieId", deleteMovieHandler)
  .post("/", createMovieHandler)
  .get("/me", getMoviesByUserIdHandler)
