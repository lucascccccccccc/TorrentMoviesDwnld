import { Elysia } from 'elysia';
import { t } from 'elysia';
import { createReviewHandler, deleteReviewHandler, getReviewsByMovieHandler } from './review.controller';
import { checkToken } from '../../middleware/auth.middleware';

export const reviewRoutes = new Elysia({ prefix: '/reviews' })
    .post('/', createReviewHandler, {
        body: t.Object({
            movieId: t.String(),
            rating: t.Number({ minimum: 0, maximum: 5 }),
            comment: t.String()
        })
    }
    )
    .get('/movie/:movieId', getReviewsByMovieHandler)
    .onBeforeHandle(checkToken)
    .delete('/:id', deleteReviewHandler);