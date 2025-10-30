import axios from 'axios';
import toast from 'react-hot-toast';
import { mockEmployees, mockDepartments, mockSchedules, mockEvents } from '../data/mockEmployeeData';

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
        // Só fazer logout se for realmente um erro de autenticação do backend
        if (error.response?.status === 401 && error.config?.url?.includes('/api/')) {
            // Token expirado ou inválido
            localStorage.removeItem('token');
            localStorage.removeItem('sessionData');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Mock de usuários para resolver erros 404
const mockUsers = [
    { id: 1, name: 'Maria Silva', email: 'maria.silva@empresa.com', role: 'Colaborador', status: 'Ativo', lastActivity: 'Há 2 min' },
    { id: 2, name: 'João Santos', email: 'joao.santos@empresa.com', role: 'Gestor', status: 'Ativo', lastActivity: 'Há 5 min' },
    { id: 3, name: 'Ana Costa', email: 'ana.costa@empresa.com', role: 'RH', status: 'Ativo', lastActivity: 'Há 10 min' },
    { id: 4, name: 'Pedro Oliveira', email: 'pedro.oliveira@empresa.com', role: 'Colaborador', status: 'Inativo', lastActivity: 'Há 2 dias' },
    { id: 5, name: 'Carla Mendes', email: 'carla.mendes@empresa.com', role: 'Administrador', status: 'Ativo', lastActivity: 'Há 1 hora' }
];

// Serviço de usuários
export const userService = {
    // Criar novo usuário
    createUser: async (userData) => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 500));

            const newUser = {
                id: mockUsers.length + 1,
                ...userData,
                status: 'Ativo',
                lastActivity: 'Agora'
            };

            mockUsers.push(newUser);
            return {
                success: true,
                data: newUser,
                message: 'Usuário criado com sucesso!'
            };
        } catch (error) {
            return {
                success: false,
                error: 'Erro ao criar usuário'
            };
        }
    },

    // Buscar usuários recentes
    getRecentUsers: async () => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 300));

            return {
                success: true,
                data: mockUsers.slice(0, 5)
            };
        } catch (error) {
            return {
                success: false,
                error: 'Erro ao buscar usuários recentes'
            };
        }
    },

    // Buscar todos os usuários
    getAllUsers: async () => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 300));

            return {
                success: true,
                data: mockUsers
            };
        } catch (error) {
            return {
                success: false,
                error: 'Erro ao buscar usuários'
            };
        }
    },

    // Atualizar usuário
    updateUser: async (userId, userData) => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 500));

            const userIndex = mockUsers.findIndex(user => user.id === userId);
            if (userIndex !== -1) {
                mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
                return {
                    success: true,
                    data: mockUsers[userIndex],
                    message: 'Usuário atualizado com sucesso!'
                };
            }
            return {
                success: false,
                error: 'Usuário não encontrado'
            };
        } catch (error) {
            return {
                success: false,
                error: 'Erro ao atualizar usuário'
            };
        }
    },

    // Deletar usuário
    deleteUser: async (userId) => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 500));

            const userIndex = mockUsers.findIndex(user => user.id === userId);
            if (userIndex !== -1) {
                mockUsers.splice(userIndex, 1);
                return {
                    success: true,
                    message: 'Usuário deletado com sucesso!'
                };
            }
            return {
                success: false,
                error: 'Usuário não encontrado'
            };
        } catch (error) {
            return {
                success: false,
                error: 'Erro ao deletar usuário'
            };
        }
    },

    // Verificar se email já existe
    checkEmailExists: async (email) => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 200));

            const exists = mockUsers.some(user => user.email === email);
            return {
                success: true,
                exists
            };
        } catch (error) {
            return {
                success: false,
                exists: false
            };
        }
    }
};

// Serviço de departamentos
export const departmentService = {
    // Buscar departamentos
    getDepartments: async () => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 300));

            // Retornar departamentos padrão
            const departments = [
                { id: 1, name: 'Administração' },
                { id: 2, name: 'Recursos Humanos' },
                { id: 3, name: 'TI' },
                { id: 4, name: 'Financeiro' },
                { id: 5, name: 'Vendas' },
                { id: 6, name: 'Marketing' },
                { id: 7, name: 'Operações' },
                { id: 8, name: 'Fisioterapia' },
                { id: 9, name: 'Enfermagem' },
                { id: 10, name: 'Medicina' }
            ];

            return {
                success: true,
                data: departments
            };
        } catch (error) {
            return {
                success: false,
                error: 'Erro ao buscar departamentos'
            };
        }
    }
};

// Serviço de colaboradores
export const employeeService = {
    // Criar novo colaborador
    createEmployee: async (employeeData) => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 800));

            // Simular criação de colaborador com dados mockados
            const newEmployee = {
                id: Date.now(), // ID único baseado em timestamp
                ...employeeData,
                status: employeeData.status === 'Ativo',
                createdAt: new Date().toISOString(),
                lastActivity: 'Agora'
            };

            return {
                success: true,
                data: newEmployee,
                message: 'Colaborador criado com sucesso!'
            };
        } catch (error) {
            return {
                success: false,
                error: 'Erro ao criar colaborador'
            };
        }
    },

    // Buscar todos os colaboradores
    getAllEmployees: async () => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 500));

            // Usar dados mockados por enquanto
            return {
                success: true,
                data: mockEmployees
            };

            // Código real da API (comentado para desenvolvimento)
            // const response = await api.get('/employees');
            // return {
            //   success: true,
            //   data: response.data
            // };
        } catch (error) {
            const message = error.response?.data?.message || 'Erro ao buscar colaboradores';
            return {
                success: false,
                error: message
            };
        }
    },

    // Atualizar colaborador
    updateEmployee: async (employeeId, employeeData) => {
        try {
            const response = await api.put(`/employees/${employeeId}`, employeeData);
            return {
                success: true,
                data: response.data,
                message: 'Colaborador atualizado com sucesso!'
            };
        } catch (error) {
            const message = error.response?.data?.message || 'Erro ao atualizar colaborador';
            return {
                success: false,
                error: message
            };
        }
    },

    // Deletar colaborador
    deleteEmployee: async (employeeId) => {
        try {
            await api.delete(`/employees/${employeeId}`);
            return {
                success: true,
                message: 'Colaborador excluído com sucesso!'
            };
        } catch (error) {
            const message = error.response?.data?.message || 'Erro ao excluir colaborador';
            return {
                success: false,
                error: message
            };
        }
    },

    // Alternar status do colaborador
    toggleEmployeeStatus: async (employeeId, status) => {
        try {
            const response = await api.patch(`/employees/${employeeId}/status`, { status });
            return {
                success: true,
                data: response.data,
                message: `Colaborador ${status ? 'ativado' : 'desativado'} com sucesso!`
            };
        } catch (error) {
            const message = error.response?.data?.message || 'Erro ao alterar status do colaborador';
            return {
                success: false,
                error: message
            };
        }
    },

    // Buscar departamentos
    getDepartments: async () => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 300));

            // Usar dados mockados por enquanto
            return {
                success: true,
                data: mockDepartments
            };

            // Código real da API (comentado para desenvolvimento)
            // const response = await api.get('/departments');
            // return {
            //   success: true,
            //   data: response.data
            // };
        } catch (error) {
            const message = error.response?.data?.message || 'Erro ao buscar departamentos';
            return {
                success: false,
                error: message
            };
        }
    },

    // Buscar horários do colaborador
    getEmployeeSchedules: async (employeeId) => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 300));

            // Usar dados mockados por enquanto
            const employeeSchedules = mockSchedules.filter(schedule => schedule.employeeId === employeeId);
            return {
                success: true,
                data: employeeSchedules
            };

            // Código real da API (comentado para desenvolvimento)
            // const response = await api.get(`/employees/${employeeId}/schedules`);
            // return {
            //   success: true,
            //   data: response.data
            // };
        } catch (error) {
            const message = error.response?.data?.message || 'Erro ao buscar horários';
            return {
                success: false,
                error: message
            };
        }
    },

    // Atualizar horários do colaborador
    updateEmployeeSchedules: async (employeeId, schedules) => {
        try {
            const response = await api.put(`/employees/${employeeId}/schedules`, { schedules });
            return {
                success: true,
                data: response.data,
                message: 'Horários atualizados com sucesso!'
            };
        } catch (error) {
            const message = error.response?.data?.message || 'Erro ao atualizar horários';
            return {
                success: false,
                error: message
            };
        }
    },

    // Buscar eventos do colaborador
    getEmployeeEvents: async (employeeId) => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 300));

            // Usar dados mockados por enquanto
            const employeeEvents = mockEvents.filter(event => event.employeeId === employeeId);
            return {
                success: true,
                data: employeeEvents
            };

            // Código real da API (comentado para desenvolvimento)
            // const response = await api.get(`/employees/${employeeId}/events`);
            // return {
            //   success: true,
            //   data: response.data
            // };
        } catch (error) {
            const message = error.response?.data?.message || 'Erro ao buscar eventos';
            return {
                success: false,
                error: message
            };
        }
    },

    // Atualizar eventos do colaborador
    updateEmployeeEvents: async (employeeId, events) => {
        try {
            const response = await api.put(`/employees/${employeeId}/events`, { events });
            return {
                success: true,
                data: response.data,
                message: 'Eventos atualizados com sucesso!'
            };
        } catch (error) {
            const message = error.response?.data?.message || 'Erro ao atualizar eventos';
            return {
                success: false,
                error: message
            };
        }
    },

    // Importar colaboradores
    importEmployees: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/employees/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return {
                success: true,
                data: response.data,
                message: 'Colaboradores importados com sucesso!'
            };
        } catch (error) {
            const message = error.response?.data?.message || 'Erro ao importar colaboradores';
            return {
                success: false,
                error: message
            };
        }
    },

    // Exportar colaboradores
    exportEmployees: async () => {
        try {
            const response = await api.get('/employees/export', {
                responseType: 'blob'
            });

            // Criar link para download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `colaboradores_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return {
                success: true,
                message: 'Colaboradores exportados com sucesso!'
            };
        } catch (error) {
            const message = error.response?.data?.message || 'Erro ao exportar colaboradores';
            return {
                success: false,
                error: message
            };
        }
    },

    // Verificar se email já existe
    checkEmailExists: async (email) => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 200));

            // Verificar se email já existe nos colaboradores mockados
            const exists = mockEmployees.some(employee => employee.email === email);
            return {
                success: true,
                exists
            };
        } catch (error) {
            return {
                success: false,
                exists: false
            };
        }
    }
};

// Serviço de auditoria
export const auditService = {
    // Log de eventos
    logEvent: async (eventData) => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 100));

            // Em um ambiente real, isso seria enviado para o backend
            console.log('🔍 AUDIT LOG:', eventData);

            return {
                success: true,
                message: 'Evento registrado com sucesso'
            };
        } catch (error) {
            console.error('Erro ao registrar evento de auditoria:', error);
            return {
                success: false,
                error: 'Erro ao registrar evento'
            };
        }
    },

    // Buscar logs de auditoria
    getAuditLogs: async (filters = {}) => {
        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 500));

            // Dados mockados de logs de auditoria
            const mockLogs = [
                {
                    id: 1,
                    timestamp: new Date().toISOString(),
                    type: 'login_success',
                    userId: 1,
                    userEmail: 'admin@sistema.com',
                    userName: 'Administrador',
                    ipAddress: '192.168.1.100',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    details: 'Login realizado com sucesso'
                },
                {
                    id: 2,
                    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    type: 'login_failure',
                    userEmail: 'usuario@teste.com',
                    ipAddress: '192.168.1.101',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    details: 'Credenciais inválidas'
                },
                {
                    id: 3,
                    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                    type: 'session_expired',
                    userId: 2,
                    userEmail: 'colaborador@sistema.com',
                    userName: 'Colaborador',
                    ipAddress: '192.168.1.102',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    details: 'Sessão expirada por inatividade'
                }
            ];

            return {
                success: true,
                data: mockLogs
            };
        } catch (error) {
            return {
                success: false,
                error: 'Erro ao buscar logs de auditoria'
            };
        }
    }
};

export default api;
