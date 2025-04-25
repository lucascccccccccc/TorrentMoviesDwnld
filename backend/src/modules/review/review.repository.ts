import { prisma } from '../../database/db'

export const ReviewRepository = {
    create: (data: { comment: string; rating: number; userId: string; movieId: string }) =>
        prisma.review.create({
            data,
            include: {
                user: {
                    select: { id: true, username: true }
                }
            }
        }),

    findByMovie: (movieId: string) =>
        prisma.review.findMany({
            where: { movieId },
            include: {
                user: {
                    select: { id: true, username: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),

    delete: (id: string, userId: string) =>
        prisma.review.deleteMany({ where: { id, userId } }),
};