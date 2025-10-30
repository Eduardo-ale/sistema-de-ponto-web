import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Instância do axios com configurações padrão
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401 && error.config?.url?.includes('/api/')) {
            localStorage.removeItem('token');
            localStorage.removeItem('sessionData');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Serviço de Dashboard - Dados Reais
export const dashboardService = {
    // Buscar estatísticas do dashboard
    getDashboardStats: async () => {
        try {
            const response = await api.get('/dashboard/stats');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas do dashboard:', error);
            return {
                success: false,
                error: 'Erro ao carregar estatísticas do dashboard'
            };
        }
    },

    // Buscar atividades recentes
    getRecentActivities: async (limit = 10) => {
        try {
            const response = await api.get(`/dashboard/activities?limit=${limit}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao buscar atividades recentes:', error);
            return {
                success: false,
                error: 'Erro ao carregar atividades recentes'
            };
        }
    },

    // Buscar usuários recentes
    getRecentUsers: async (limit = 5) => {
        try {
            const response = await api.get(`/dashboard/users/recent?limit=${limit}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao buscar usuários recentes:', error);
            return {
                success: false,
                error: 'Erro ao carregar usuários recentes'
            };
        }
    },

    // Buscar dados para gráficos
    getChartData: async (type = 'attendance') => {
        try {
            const response = await api.get(`/dashboard/charts/${type}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao buscar dados do gráfico:', error);
            return {
                success: false,
                error: 'Erro ao carregar dados do gráfico'
            };
        }
    }
};

// Serviço de Usuários - Dados Reais
export const userService = {
    // Buscar todos os usuários
    getAllUsers: async (page = 1, limit = 10, filters = {}) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...filters
            });

            const response = await api.get(`/users?${params}`);
            return {
                success: true,
                data: response.data.users,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return {
                success: false,
                error: 'Erro ao carregar usuários'
            };
        }
    },

    // Buscar usuário por ID
    getUserById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return {
                success: false,
                error: 'Erro ao carregar usuário'
            };
        }
    },

    // Criar novo usuário
    createUser: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            return {
                success: true,
                data: response.data,
                message: 'Usuário criado com sucesso!'
            };
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao criar usuário'
            };
        }
    },

    // Atualizar usuário
    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/users/${id}`, userData);
            return {
                success: true,
                data: response.data,
                message: 'Usuário atualizado com sucesso!'
            };
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao atualizar usuário'
            };
        }
    },

    // Deletar usuário
    deleteUser: async (id) => {
        try {
            await api.delete(`/users/${id}`);
            return {
                success: true,
                message: 'Usuário deletado com sucesso!'
            };
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao deletar usuário'
            };
        }
    },

    // Ativar/Desativar usuário
    toggleUserStatus: async (id, status) => {
        try {
            const response = await api.patch(`/users/${id}/status`, { status });
            return {
                success: true,
                data: response.data,
                message: `Usuário ${status === 'Ativo' ? 'ativado' : 'desativado'} com sucesso!`
            };
        } catch (error) {
            console.error('Erro ao alterar status do usuário:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao alterar status do usuário'
            };
        }
    },

    // Buscar usuários recentes
    getRecentUsers: async (limit = 5) => {
        try {
            const response = await api.get(`/users/recent?limit=${limit}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao buscar usuários recentes:', error);
            return {
                success: false,
                error: 'Erro ao carregar usuários recentes'
            };
        }
    }
};

// Serviço de Atividades - Dados Reais
export const activityService = {
    // Buscar atividades recentes
    getRecentActivities: async (limit = 10) => {
        try {
            const response = await api.get(`/activities/recent?limit=${limit}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao buscar atividades recentes:', error);
            return {
                success: false,
                error: 'Erro ao carregar atividades recentes'
            };
        }
    },

    // Registrar nova atividade
    logActivity: async (activityData) => {
        try {
            const response = await api.post('/activities', activityData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao registrar atividade:', error);
            return {
                success: false,
                error: 'Erro ao registrar atividade'
            };
        }
    }
};

// Serviço de Estatísticas - Dados Reais
export const statsService = {
    // Buscar estatísticas gerais
    getGeneralStats: async () => {
        try {
            const response = await api.get('/stats/general');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas gerais:', error);
            return {
                success: false,
                error: 'Erro ao carregar estatísticas'
            };
        }
    },

    // Buscar estatísticas de ponto
    getAttendanceStats: async (period = 'today') => {
        try {
            const response = await api.get(`/stats/attendance?period=${period}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas de ponto:', error);
            return {
                success: false,
                error: 'Erro ao carregar estatísticas de ponto'
            };
        }
    },

    // Buscar estatísticas de produtividade
    getProductivityStats: async (period = 'month') => {
        try {
            const response = await api.get(`/stats/productivity?period=${period}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas de produtividade:', error);
            return {
                success: false,
                error: 'Erro ao carregar estatísticas de produtividade'
            };
        }
    }
};

// Serviço de Notificações - Dados Reais
export const notificationService = {
    // Buscar notificações
    getNotifications: async (limit = 10) => {
        try {
            const response = await api.get(`/notifications?limit=${limit}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            return {
                success: false,
                error: 'Erro ao carregar notificações'
            };
        }
    },

    // Marcar notificação como lida
    markAsRead: async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            return {
                success: true
            };
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
            return {
                success: false,
                error: 'Erro ao marcar notificação como lida'
            };
        }
    },

    // Marcar todas as notificações como lidas
    markAllAsRead: async () => {
        try {
            await api.patch('/notifications/read-all');
            return {
                success: true
            };
        } catch (error) {
            console.error('Erro ao marcar todas as notificações como lidas:', error);
            return {
                success: false,
                error: 'Erro ao marcar todas as notificações como lidas'
            };
        }
    }
};

export default api;






