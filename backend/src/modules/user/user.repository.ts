import { prisma } from '../../database/db'
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cm9j37yle0000u22ojpeyl2fg';

export const UserRepository = {
    getAllUsers: () => prisma.user.findMany(),

    getUserById: (id: string) => {
        return prisma.user.findUnique({ where: { id } });
    },

    getUserByEmail: (email: string) => {
        return prisma.user.findUnique({
            where: { email }
        })
    },

    deleteUser: (id: string) => {
        return prisma.user.delete({ where: { id } });
    },

    createUser: async (data: {
        username: string;
        email: string;
        password: string;
    }) => {
        const hashedPassword = await Bun.password.hash(data.password, {
            algorithm: 'bcrypt',
            cost: 10,
        })
        return prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
            },
        });
    },

    loginUser: async (email: string, password: string) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('Usuário não encontrado');
        const valid = await Bun.password.verify(password, user.password);
        if (!valid) throw new Error('Credenciais inválidas');
        const token = jwt.sign({ id: user.id, email: user.email, username: user.username, role: user.role }, JWT_SECRET, {
            expiresIn: '7d',
        });
        return { token, user };
    }
}
