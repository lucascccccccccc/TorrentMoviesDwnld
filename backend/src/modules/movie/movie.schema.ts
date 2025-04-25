import { z } from "zod";

export const movieSchema = z.object({
    movieId: z.string(),
    title: z.string(),
    poster_path: z.string(),
    genres: z.string(),
    tagline: z.string(),
    director: z.string(),
    original_title: z.string(),
    rating: z.number().min(0).max(10),
    runtime: z.number().min(1),
    torrent_link: z.string(),
    overview: z.string(),
    year: z.number().min(1900).max(new Date().getFullYear()),
    userId: z.string(),
});

export type MovieInput = z.infer<typeof movieSchema>;