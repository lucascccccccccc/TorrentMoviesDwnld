import { z } from 'zod';

export const reviewSchema = z.object({
    movieId: z.string(),
    rating: z.number().min(0).max(5),
    comment: z.string().min(1)
});

export type ReviewInput = z.infer<typeof reviewSchema>;