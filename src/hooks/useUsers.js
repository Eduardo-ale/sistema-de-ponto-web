import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/api';
import toast from 'react-hot-toast';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Buscar todos os usuários
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await userService.getAllUsers();

            if (result.success) {
                setUsers(result.data);
            } else {
                setError(result.error);
                toast.error(result.error);
            }
        } catch (err) {
            const errorMessage = 'Erro ao buscar usuários';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Buscar usuários recentes
    const fetchRecentUsers = useCallback(async () => {
        try {
            const result = await userService.getRecentUsers();

            if (result.success) {
                setRecentUsers(result.data);
            }
        } catch (err) {
            console.error('Erro ao buscar usuários recentes:', err);
        }
    }, []);

    // Criar novo usuário
    const createUser = useCallback(async (userData) => {
        setLoading(true);
        setError(null);

        try {
            const result = await userService.createUser(userData);

            if (result.success) {
                // Atualizar lista local
                setUsers(prev => [result.data, ...prev]);
                setRecentUsers(prev => [result.data, ...prev]);

                toast.success(result.message);
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = 'Erro interno do servidor';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Atualizar usuário
    const updateUser = useCallback(async (userId, userData) => {
        setLoading(true);
        setError(null);

        try {
            const result = await userService.updateUser(userId, userData);

            if (result.success) {
                // Atualizar lista local
                setUsers(prev => prev.map(user =>
                    user.id === userId ? { ...user, ...result.data } : user
                ));
                setRecentUsers(prev => prev.map(user =>
                    user.id === userId ? { ...user, ...result.data } : user
                ));

                toast.success(result.message);
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = 'Erro interno do servidor';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Deletar usuário
    const deleteUser = useCallback(async (userId) => {
        setLoading(true);
        setError(null);

        try {
            const result = await userService.deleteUser(userId);

            if (result.success) {
                // Remover da lista local
                setUsers(prev => prev.filter(user => user.id !== userId));
                setRecentUsers(prev => prev.filter(user => user.id !== userId));

                toast.success(result.message);
                return { success: true };
            } else {
                setError(result.error);
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = 'Erro interno do servidor';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar dados iniciais
    useEffect(() => {
        fetchUsers();
        fetchRecentUsers();
    }, [fetchUsers, fetchRecentUsers]);

    return {
        users,
        recentUsers,
        loading,
        error,
        fetchUsers,
        fetchRecentUsers,
        createUser,
        updateUser,
        deleteUser
    };
};

export default useUsers;






