import jwt from 'jsonwebtoken';
import { Context } from 'elysia';

const JWT_SECRET = process.env.JWT_SECRET || 'cm9j37yle0000u22ojpeyl2fg';

export const checkToken = async ({ request, set }: Context) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return { error: 'Token não fornecido' };
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string;
            email: string;
            username: string;
            iat: number;
            exp: number;
        };

        return { ...decoded }; // tem id, email, username, iat, exp
    } catch (err) {
        set.status = 401;
        return { error: 'Token inválido' };
    }
};