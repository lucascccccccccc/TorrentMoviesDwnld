import { UserRepository } from './user.repository';
import { UserInput } from './user.types';


export const UserService = {
    getAllUsers: async () => {
        return await UserRepository.getAllUsers();
    },

    createUser: async (data: UserInput) => {
        const user = await UserRepository.getUserByEmail(data.email);
        if (user) throw new Error('User already exists');
        return await UserRepository.createUser(data);
    },

    getUserById: async (id: string) => {
        return await UserRepository.getUserById(id);
    },

    deleteUser: async (id: string) => {
        return await UserRepository.deleteUser(id);
    },

    loginUser: async (email: string, password: string) => {
        return await UserRepository.loginUser(email, password);
    }
}