import jwt from 'jsonwebtoken';
import { reviewSchema } from './review.schema';
import { ReviewService } from './review.service';

const JWT_SECRET = process.env.JWT_SECRET || 'cm9j37yle0000u22ojpeyl2fg';

export const createReviewHandler = async ({ request, body }: any) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Token não fornecido', { status: 401 });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const result = reviewSchema.safeParse(body);
        if (!result.success) {
            return new Response(
                JSON.stringify({ error: 'Dados inválidos', details: result.error.errors }),
                { status: 400 }
            );
        }

        const reviewData = { ...result.data, userId: decoded.id };
        return await ReviewService.createReview(reviewData);
    } catch (error) {
        return new Response('Token inválido', { status: 401 });
    }
};


export const getReviewsByMovieHandler = async ({ params }: any) => {
    try {

        const reviews = await ReviewService.getReviewsByMovie(params.movieId);
        return reviews.length > 0 ? reviews : [];
    } catch (error) {
        return new Response('Erro ao buscar reviews', { status: 500 });
    }
};

export const deleteReviewHandler = async ({ request, params }: any) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Token não fornecido', { status: 401 });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const deletedReview = await ReviewService.deleteReview(params.id, decoded.id);
        if (!deletedReview) {
            return new Response('Review não encontrada ou você não tem permissão', { status: 403 });
        }

        return new Response('Review deletada com sucesso', { status: 200 });
    } catch (error) {
        return new Response('Token inválido ou erro no processamento', { status: 401 });
    }
};
