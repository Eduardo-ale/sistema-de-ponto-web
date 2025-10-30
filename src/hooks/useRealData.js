import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import validationUtils from '../utils/validationUtils';

// Sistema híbrido que funciona com localStorage quando não há backend
class LocalStorageService {
    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Erro ao ler ${key} do localStorage:`, error);
            return defaultValue;
        }
    }

    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Erro ao salvar ${key} no localStorage:`, error);
            return false;
        }
    }

    static removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Erro ao remover ${key} do localStorage:`, error);
            return false;
        }
    }
}

// Serviço híbrido que funciona com localStorage
const hybridService = {
    // Simular chamada de API com fallback para localStorage
    async apiCall(endpoint, method = 'GET', data = null) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 300));

        // Se não há backend, usar localStorage
        if (method === 'GET') {
            return this.getFromLocalStorage(endpoint);
        } else if (method === 'POST') {
            return this.saveToLocalStorage(endpoint, data);
        } else if (method === 'PUT') {
            return this.updateInLocalStorage(endpoint, data);
        } else if (method === 'DELETE') {
            return this.deleteFromLocalStorage(endpoint, data);
        }
    },

    getFromLocalStorage(endpoint) {
        const key = endpoint.replace('/api/', '');
        const data = LocalStorageService.getItem(key, []);

        return {
            success: true,
            data: data,
            message: 'Dados carregados com sucesso'
        };
    },

    saveToLocalStorage(endpoint, data) {
        const key = endpoint.replace('/api/', '');
        const existingData = LocalStorageService.getItem(key, []);

        // Validações de duplicação
        if (data.cpf) {
            const cpfCheck = validationUtils.checkDuplicateData('cpf', data.cpf);
            if (cpfCheck.exists) {
                return {
                    success: false,
                    error: 'CPF já cadastrado. Por favor, verifique os dados informados.',
                    field: 'cpf'
                };
            }
        }

        if (data.email) {
            const emailCheck = validationUtils.checkDuplicateData('email', data.email);
            if (emailCheck.exists) {
                return {
                    success: false,
                    error: 'E-mail já cadastrado. Por favor, verifique os dados informados.',
                    field: 'email'
                };
            }
        }

        // Gerar ID único usando timestamp + número aleatório
        const uniqueId = Date.now() + Math.floor(Math.random() * 1000);

        // Gerar login automaticamente se não fornecido
        const generateLogin = (name) => {
            if (!name) return '';

            // Remove acentos e caracteres especiais
            const normalizedName = name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z\s]/g, '');

            // Divide o nome em partes
            const nameParts = normalizedName.trim().split(/\s+/);

            if (nameParts.length === 1) {
                // Se só tem um nome, usa ele
                return nameParts[0];
            } else if (nameParts.length === 2) {
                // Se tem dois nomes, usa primeiro.último
                return `${nameParts[0]}.${nameParts[1]}`;
            } else {
                // Se tem mais de dois nomes, usa primeiro.último
                return `${nameParts[0]}.${nameParts[nameParts.length - 1]}`;
            }
        };

        const newItem = {
            id: uniqueId,
            ...data,
            login: data.login || generateLogin(data.name),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        existingData.unshift(newItem);
        LocalStorageService.setItem(key, existingData);

        return {
            success: true,
            data: newItem,
            message: 'Item criado com sucesso'
        };
    },

    updateInLocalStorage(endpoint, data) {
        const key = endpoint.replace('/api/', '');
        const existingData = LocalStorageService.getItem(key, []);

        const index = existingData.findIndex(item => item.id === data.id);
        if (index !== -1) {
            // Validações de duplicação para atualização
            if (data.cpf) {
                const cpfCheck = validationUtils.checkDuplicateData('cpf', data.cpf, data.id);
                if (cpfCheck.exists) {
                    return {
                        success: false,
                        error: 'CPF já cadastrado. Por favor, verifique os dados informados.',
                        field: 'cpf'
                    };
                }
            }

            if (data.email) {
                const emailCheck = validationUtils.checkDuplicateData('email', data.email, data.id);
                if (emailCheck.exists) {
                    return {
                        success: false,
                        error: 'E-mail já cadastrado. Por favor, verifique os dados informados.',
                        field: 'email'
                    };
                }
            }

            // Normalizar campo status para boolean se presente
            const normalizedData = { ...data };
            if ('status' in normalizedData) {
                normalizedData.status =
                    normalizedData.status === true ||
                    normalizedData.status === 'ativo' ||
                    normalizedData.status === 'Ativo' ||
                    normalizedData.status === 'active';
            }

            existingData[index] = {
                ...existingData[index],
                ...normalizedData,
                updatedAt: new Date().toISOString()
            };
            LocalStorageService.setItem(key, existingData);

            return {
                success: true,
                data: existingData[index],
                message: 'Item atualizado com sucesso'
            };
        }

        return {
            success: false,
            error: 'Item não encontrado'
        };
    },

    deleteFromLocalStorage(endpoint, data) {
        const key = endpoint.replace('/api/', '');
        const existingData = LocalStorageService.getItem(key, []);

        const filteredData = existingData.filter(item => item.id !== data.id);
        LocalStorageService.setItem(key, filteredData);

        return {
            success: true,
            message: 'Item deletado com sucesso'
        };
    }
};

// Hook para gerenciar dados do dashboard
export const useDashboardData = () => {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState({
        stats: false,
        activities: false,
        recentUsers: false,
        chartData: false
    });
    const [errors, setErrors] = useState({
        stats: null,
        activities: null,
        recentUsers: null,
        chartData: null
    });

    // Função para buscar estatísticas
    const fetchStats = useCallback(async () => {
        setLoading(prev => ({ ...prev, stats: true }));
        try {
            // Buscar usuários para calcular estatísticas
            const usersResult = await hybridService.apiCall('/api/users');
            const users = usersResult.data || [];

            // Calcular estatísticas baseadas nos dados reais
            const stats = [
                {
                    id: 1,
                    title: 'Total de Usuários',
                    value: users.length.toString(),
                    change: '+12%',
                    changeType: 'positive',
                    icon: 'Users',
                    color: 'blue'
                },
                {
                    id: 2,
                    title: 'Usuários Ativos',
                    value: users.filter(u => u.status === 'Ativo' || u.status === 'active').length.toString(),
                    change: '+5%',
                    changeType: 'positive',
                    icon: 'Clock',
                    color: 'green'
                },
                {
                    id: 3,
                    title: 'Administradores',
                    value: users.filter(u => u.profile === 'admin' || u.role === 'admin').length.toString(),
                    change: '+2',
                    changeType: 'positive',
                    icon: 'AlertTriangle',
                    color: 'red'
                },
                {
                    id: 4,
                    title: 'Colaboradores',
                    value: users.filter(u => u.profile === 'colaborador' || u.role === 'colaborador').length.toString(),
                    change: '+8%',
                    changeType: 'positive',
                    icon: 'TrendingUp',
                    color: 'purple'
                }
            ];

            setStats(stats);
            setErrors(prev => ({ ...prev, stats: null }));
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            setErrors(prev => ({ ...prev, stats: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, stats: false }));
        }
    }, []);

    // Função para buscar atividades recentes
    const fetchActivities = useCallback(async () => {
        setLoading(prev => ({ ...prev, activities: true }));
        try {
            const result = await hybridService.apiCall('/api/activities');
            if (result.success) {
                setActivities(result.data || []);
                setErrors(prev => ({ ...prev, activities: null }));
            } else {
                setErrors(prev => ({ ...prev, activities: result.error }));
            }
        } catch (error) {
            console.error('Erro ao carregar atividades:', error);
            setErrors(prev => ({ ...prev, activities: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, activities: false }));
        }
    }, []);

    // Função para buscar usuários recentes
    const fetchRecentUsers = useCallback(async () => {
        setLoading(prev => ({ ...prev, recentUsers: true }));
        try {
            const result = await hybridService.apiCall('/api/users');
            if (result.success) {
                // Pegar os 5 usuários mais recentes
                const recentUsers = result.data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
                setRecentUsers(recentUsers);
                setErrors(prev => ({ ...prev, recentUsers: null }));
            } else {
                setErrors(prev => ({ ...prev, recentUsers: result.error }));
            }
        } catch (error) {
            console.error('Erro ao carregar usuários recentes:', error);
            setErrors(prev => ({ ...prev, recentUsers: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, recentUsers: false }));
        }
    }, []);

    // Função para buscar dados do gráfico
    const fetchChartData = useCallback(async () => {
        setLoading(prev => ({ ...prev, chartData: true }));
        try {
            const chartData = {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
                datasets: [
                    {
                        label: 'Usuários Ativos',
                        data: [45, 52, 48, 61, 55],
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2
                    }
                ]
            };

            setChartData(chartData);
            setErrors(prev => ({ ...prev, chartData: null }));
        } catch (error) {
            console.error('Erro ao carregar dados do gráfico:', error);
            setErrors(prev => ({ ...prev, chartData: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, chartData: false }));
        }
    }, []);

    // Função para atualizar todos os dados
    const refreshAllData = useCallback(() => {
        fetchStats();
        fetchActivities();
        fetchRecentUsers();
        fetchChartData();
    }, [fetchStats, fetchActivities, fetchRecentUsers, fetchChartData]);

    // Carregar dados iniciais
    useEffect(() => {
        refreshAllData();
    }, [refreshAllData]);

    return {
        stats,
        activities,
        recentUsers,
        chartData,
        loading,
        errors,
        refreshAllData
    };
};

// Hook para gerenciar usuários
export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState({
        users: false,
        creating: false,
        updating: false,
        deleting: false,
        toggling: false
    });
    const [errors, setErrors] = useState({
        users: null,
        creating: null,
        updating: null,
        deleting: null,
        toggling: null
    });

    // Função para buscar usuários
    const fetchUsers = useCallback(async () => {
        setLoading(prev => ({ ...prev, users: true }));
        try {
            const result = await hybridService.apiCall('/api/users');
            if (result.success) {
                setUsers(result.data || []);
                setPagination({
                    page: 1,
                    totalPages: 1,
                    totalItems: result.data?.length || 0,
                    itemsPerPage: 100
                });
                setErrors(prev => ({ ...prev, users: null }));
            } else {
                setErrors(prev => ({ ...prev, users: result.error }));
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            setErrors(prev => ({ ...prev, users: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, users: false }));
        }
    }, []);

    // Função para criar usuário
    const createUser = useCallback(async (userData) => {
        setLoading(prev => ({ ...prev, creating: true }));
        try {
            const result = await hybridService.apiCall('/api/users', 'POST', userData);
            if (result.success) {
                toast.success(result.message || 'Usuário criado com sucesso!');
                setErrors(prev => ({ ...prev, creating: null }));
                // Recarregar lista de usuários
                fetchUsers();
                return result;
            } else {
                toast.error(result.error || 'Erro ao criar usuário');
                setErrors(prev => ({ ...prev, creating: result.error }));
                return result;
            }
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            toast.error('Erro interno do servidor');
            setErrors(prev => ({ ...prev, creating: error.message }));
            return { success: false, error: error.message };
        } finally {
            setLoading(prev => ({ ...prev, creating: false }));
        }
    }, [fetchUsers]);

    // Função para atualizar usuário
    const updateUser = useCallback(async ({ id, userData }) => {
        setLoading(prev => ({ ...prev, updating: true }));
        try {
            const result = await hybridService.apiCall('/api/users', 'PUT', { id, ...userData });
            if (result.success) {
                toast.success(result.message || 'Usuário atualizado com sucesso!');
                setErrors(prev => ({ ...prev, updating: null }));
                // Recarregar lista de usuários
                fetchUsers();
                return result;
            } else {
                toast.error(result.error || 'Erro ao atualizar usuário');
                setErrors(prev => ({ ...prev, updating: result.error }));
                return result;
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            toast.error('Erro interno do servidor');
            setErrors(prev => ({ ...prev, updating: error.message }));
            return { success: false, error: error.message };
        } finally {
            setLoading(prev => ({ ...prev, updating: false }));
        }
    }, [fetchUsers]);

    // Função para deletar usuário
    const deleteUser = useCallback(async (id) => {
        setLoading(prev => ({ ...prev, deleting: true }));
        try {
            const result = await hybridService.apiCall('/api/users', 'DELETE', { id });
            if (result.success) {
                toast.success(result.message || 'Usuário deletado com sucesso!');
                setErrors(prev => ({ ...prev, deleting: null }));
                // Recarregar lista de usuários
                fetchUsers();
                return result;
            } else {
                toast.error(result.error || 'Erro ao deletar usuário');
                setErrors(prev => ({ ...prev, deleting: result.error }));
                return result;
            }
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            toast.error('Erro interno do servidor');
            setErrors(prev => ({ ...prev, deleting: error.message }));
            return { success: false, error: error.message };
        } finally {
            setLoading(prev => ({ ...prev, deleting: false }));
        }
    }, [fetchUsers]);

    // Função para alterar status do usuário
    const toggleUserStatus = useCallback(async ({ id, status }) => {
        setLoading(prev => ({ ...prev, toggling: true }));
        try {
            const result = await hybridService.apiCall('/api/users', 'PUT', { id, status });
            if (result.success) {
                toast.success(result.message || 'Status alterado com sucesso!');
                setErrors(prev => ({ ...prev, toggling: null }));
                // Recarregar lista de usuários
                fetchUsers();
                return result;
            } else {
                toast.error(result.error || 'Erro ao alterar status');
                setErrors(prev => ({ ...prev, toggling: result.error }));
                return result;
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            toast.error('Erro interno do servidor');
            setErrors(prev => ({ ...prev, toggling: error.message }));
            return { success: false, error: error.message };
        } finally {
            setLoading(prev => ({ ...prev, toggling: false }));
        }
    }, [fetchUsers]);

    // Carregar usuários iniciais
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        pagination,
        loading,
        errors,
        actions: {
            createUser,
            updateUser,
            deleteUser,
            toggleUserStatus,
            refetchUsers: fetchUsers
        }
    };
};

// Hook para gerenciar notificações
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState({
        notifications: false,
        marking: false,
        markingAll: false
    });
    const [errors, setErrors] = useState({
        notifications: null,
        marking: null,
        markingAll: null
    });

    // Função para buscar notificações
    const fetchNotifications = useCallback(async () => {
        setLoading(prev => ({ ...prev, notifications: true }));
        try {
            const result = await hybridService.apiCall('/api/notifications');
            if (result.success) {
                setNotifications(result.data || []);
                setErrors(prev => ({ ...prev, notifications: null }));
            } else {
                setErrors(prev => ({ ...prev, notifications: result.error }));
            }
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
            setErrors(prev => ({ ...prev, notifications: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, notifications: false }));
        }
    }, []);

    // Função para marcar notificação como lida
    const markAsRead = useCallback(async (id) => {
        setLoading(prev => ({ ...prev, marking: true }));
        try {
            const result = await hybridService.apiCall('/api/notifications', 'PUT', { id, read: true });
            if (result.success) {
                setErrors(prev => ({ ...prev, marking: null }));
                // Recarregar notificações
                fetchNotifications();
            } else {
                setErrors(prev => ({ ...prev, marking: result.error }));
            }
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
            setErrors(prev => ({ ...prev, marking: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, marking: false }));
        }
    }, [fetchNotifications]);

    // Função para marcar todas as notificações como lidas
    const markAllAsRead = useCallback(async () => {
        setLoading(prev => ({ ...prev, markingAll: true }));
        try {
            const result = await hybridService.apiCall('/api/notifications', 'PUT', { markAll: true });
            if (result.success) {
                toast.success('Todas as notificações foram marcadas como lidas');
                setErrors(prev => ({ ...prev, markingAll: null }));
                // Recarregar notificações
                fetchNotifications();
            } else {
                toast.error(result.error || 'Erro ao marcar notificações como lidas');
                setErrors(prev => ({ ...prev, markingAll: result.error }));
            }
        } catch (error) {
            console.error('Erro ao marcar todas as notificações como lidas:', error);
            toast.error('Erro interno do servidor');
            setErrors(prev => ({ ...prev, markingAll: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, markingAll: false }));
        }
    }, [fetchNotifications]);

    // Função para adicionar uma nova notificação
    const addNotification = useCallback((notification) => {
        setNotifications(prev => {
            const newNotification = {
                ...notification,
                id: notification.id || Date.now(),
                time: notification.time || 'Agora',
                read: notification.read || false
            };
            return [newNotification, ...prev];
        });
    }, []);

    // Carregar notificações iniciais
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        loading,
        errors,
        actions: {
            markAsRead,
            markAllAsRead,
            addNotification,
            refetchNotifications: fetchNotifications
        }
    };
};

// Hook para gerenciar estatísticas
export const useStats = () => {
    const [generalStats, setGeneralStats] = useState(null);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [productivityStats, setProductivityStats] = useState(null);
    const [loading, setLoading] = useState({
        general: false,
        attendance: false,
        productivity: false
    });
    const [errors, setErrors] = useState({
        general: null,
        attendance: null,
        productivity: null
    });

    // Função para buscar estatísticas gerais
    const fetchGeneralStats = useCallback(async () => {
        setLoading(prev => ({ ...prev, general: true }));
        try {
            const result = await hybridService.apiCall('/api/users');
            const users = result.data || [];

            const generalStats = {
                totalUsers: users.length,
                activeUsers: users.filter(u => u.status === 'Ativo' || u.status === 'active').length,
                totalPoints: 2847,
                averageProductivity: 94
            };

            setGeneralStats(generalStats);
            setErrors(prev => ({ ...prev, general: null }));
        } catch (error) {
            console.error('Erro ao carregar estatísticas gerais:', error);
            setErrors(prev => ({ ...prev, general: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, general: false }));
        }
    }, []);

    // Função para buscar estatísticas de ponto
    const fetchAttendanceStats = useCallback(async () => {
        setLoading(prev => ({ ...prev, attendance: true }));
        try {
            const attendanceStats = {
                todayPoints: 89,
                onTime: 76,
                late: 13,
                absent: 2
            };

            setAttendanceStats(attendanceStats);
            setErrors(prev => ({ ...prev, attendance: null }));
        } catch (error) {
            console.error('Erro ao carregar estatísticas de ponto:', error);
            setErrors(prev => ({ ...prev, attendance: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, attendance: false }));
        }
    }, []);

    // Função para buscar estatísticas de produtividade
    const fetchProductivityStats = useCallback(async () => {
        setLoading(prev => ({ ...prev, productivity: true }));
        try {
            const productivityStats = {
                averageHours: 8.2,
                completedTasks: 156,
                pendingTasks: 23,
                efficiency: 94
            };

            setProductivityStats(productivityStats);
            setErrors(prev => ({ ...prev, productivity: null }));
        } catch (error) {
            console.error('Erro ao carregar estatísticas de produtividade:', error);
            setErrors(prev => ({ ...prev, productivity: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, productivity: false }));
        }
    }, []);

    // Carregar estatísticas iniciais
    useEffect(() => {
        fetchGeneralStats();
        fetchAttendanceStats();
        fetchProductivityStats();
    }, [fetchGeneralStats, fetchAttendanceStats, fetchProductivityStats]);

    return {
        generalStats,
        attendanceStats,
        productivityStats,
        loading,
        errors,
        actions: {
            refetchGeneralStats: fetchGeneralStats,
            refetchAttendanceStats: fetchAttendanceStats,
            refetchProductivityStats: fetchProductivityStats
        }
    };
};