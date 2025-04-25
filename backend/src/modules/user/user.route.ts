import { Elysia } from 'elysia';
import { t } from 'elysia';
import { createUserHandler, deleteUserHandler, handleLogin, getMeHandler } from './user.controller';
import { checkToken } from '../../middleware/auth.middleware';

export const userRoutes = new Elysia({ prefix: '/users' })
    // .post('/', createUserHandler)
    .post('/register', createUserHandler)
    .post('/login', handleLogin, {
        body: t.Object({
            email: t.String(),
            password: t.String()
        })
    })

    // http://localhost:3000/api/users/register
    // http://localhost:3000/api/users/login
    // http://localhost:3000/api/users/me

    .onBeforeHandle(checkToken)
    .get('/me', getMeHandler)
    .delete('/:id', deleteUserHandler)
