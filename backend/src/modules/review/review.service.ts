import { ReviewRepository } from './review.repository';
import { ReviewInput } from './review.schema';

export const ReviewService = {
    createReview: async (data: ReviewInput & { userId: string }) => {
        return await ReviewRepository.create(data);
    },

    getReviewsByMovie: async (movieId: string) => {
        return await ReviewRepository.findByMovie(movieId);
    },

    deleteReview: async (id: string, userId: string) => {
        return await ReviewRepository.delete(id, userId);
    }
};