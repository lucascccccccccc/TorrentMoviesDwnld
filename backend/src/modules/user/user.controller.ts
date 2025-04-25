import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserInputSchema } from './user.schema';
import { UserService } from './user.service';

export const getMeHandler = async ({ auth }: any) => {
    if (!auth?.user) {
        return { error: 'User not authenticated' };
    }

    const user = await UserService.getUserById(auth.user.id);
    if (!user) {
        return { error: 'User not found' };
    }

    const { password: _, ...safeUser } = user;
    return { user: safeUser };
}

export const createUserHandler = async ({ body, set }: any) => {
    const parsed = UserInputSchema.safeParse(body);

    if (!parsed.success) {
        set.status = 400;
        return {
            error: 'Invalid input data',
            issues: parsed.error.format(),
        };
    }

    try {
        return await UserService.createUser(parsed.data);
    } catch (error: any) {

        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            set.status = 400;
            return { error: 'User already exists' };
        }

        set.status = 500;
        return {
            error: 'Failed to create user',
        };
    }
}

export const handleLogin = async ({ body, set }: any) => {
    const { email, password } = body;

    if (!email || !password) {
        set.status = 400;
        return { error: 'Email e senha são obrigatórios' };
    }

    try {
        const { user, token } = await UserService.loginUser(email, password);

        const { password: _, ...safeUser } = user;
        return { user: safeUser, token };
    } catch (error: any) {
        set.status = 401;
        return { error: error.message || 'Falha ao autenticar' };
    }
};


export const getUserByIdHandler = async ({ params, set }: any) => {
    if (!params?.id) {
        set.status = 400;
        return { error: 'missing user ID' };
    }

    const user = await UserService.getUserById(params.id);
    if (!user) {
        set.status = 404;
        return { error: 'user not found' };
    }

    const { password: _, ...safeUser } = user;
    return { user: safeUser };
};

export const deleteUserHandler = async ({ params, set }: any) => {
    if (!params?.id) {
        set.status = 400;
        return { error: 'Missing user ID' };
    }

    const user = await UserService.getUserById(params.id);
    if (!user) {
        set.status = 404;
        return { error: 'User not found' };
    }
    try {
        await UserService.deleteUser(params.id);
        set.status = 200;
        return { message: "user '" + params.id + "' deleted successfully" };
    } catch {
        set.status = 500;
        return { error: 'failed to delete user' };
    }
}
