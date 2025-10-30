// Dados mockados para o dashboard administrativo
export const mockDashboardData = {
    // Estatísticas principais
    stats: [
        {
            id: 1,
            title: 'Total de Usuários',
            value: '1,247',
            change: '+12%',
            changeType: 'positive' as const,
            icon: 'Users',
            color: 'blue' as const
        },
        {
            id: 2,
            title: 'Pontos Hoje',
            value: '892',
            change: '+8%',
            changeType: 'positive' as const,
            icon: 'Clock',
            color: 'green' as const
        },
        {
            id: 3,
            title: 'Atrasos',
            value: '23',
            change: '-15%',
            changeType: 'positive' as const,
            icon: 'AlertTriangle',
            color: 'yellow' as const
        },
        {
            id: 4,
            title: 'Produtividade',
            value: '94%',
            change: '+3%',
            changeType: 'positive' as const,
            icon: 'TrendingUp',
            color: 'purple' as const
        }
    ],

    // Atividades recentes
    activities: [
        {
            id: 1,
            type: 'success' as const,
            message: 'Novo usuário cadastrado: Maria Silva',
            time: '2 minutos atrás',
            user: 'Admin'
        },
        {
            id: 2,
            type: 'warning' as const,
            message: 'João Santos com 15 minutos de atraso',
            time: '5 minutos atrás',
            user: 'Sistema'
        },
        {
            id: 3,
            type: 'info' as const,
            message: 'Relatório mensal gerado automaticamente',
            time: '10 minutos atrás',
            user: 'Sistema'
        },
        {
            id: 4,
            type: 'success' as const,
            message: 'Ana Costa bateu o ponto de saída',
            time: '15 minutos atrás',
            user: 'Sistema'
        },
        {
            id: 5,
            type: 'error' as const,
            message: 'Falha na sincronização com servidor',
            time: '20 minutos atrás',
            user: 'Sistema'
        }
    ],

    // Usuários recentes
    users: [
        {
            id: 1,
            name: 'Maria Silva',
            email: 'maria.silva@empresa.com',
            role: 'Colaborador',
            status: 'Ativo' as const,
            lastLogin: 'Há 2 min',
            avatar: null
        },
        {
            id: 2,
            name: 'João Santos',
            email: 'joao.santos@empresa.com',
            role: 'Gestor',
            status: 'Ativo' as const,
            lastLogin: 'Há 5 min',
            avatar: null
        },
        {
            id: 3,
            name: 'Ana Costa',
            email: 'ana.costa@empresa.com',
            role: 'RH',
            status: 'Ativo' as const,
            lastLogin: 'Há 10 min',
            avatar: null
        },
        {
            id: 4,
            name: 'Pedro Oliveira',
            email: 'pedro.oliveira@empresa.com',
            role: 'Colaborador',
            status: 'Inativo' as const,
            lastLogin: 'Há 2 dias',
            avatar: null
        },
        {
            id: 5,
            name: 'Carla Mendes',
            email: 'carla.mendes@empresa.com',
            role: 'Administrador',
            status: 'Ativo' as const,
            lastLogin: 'Há 1 hora',
            avatar: null
        }
    ],

    // Notificações
    notifications: [
        {
            id: 1,
            type: 'warning' as const,
            title: 'Atraso Detectado',
            message: 'João Santos chegou 15 minutos atrasado hoje',
            time: '5 min atrás',
            read: false
        },
        {
            id: 2,
            type: 'success' as const,
            title: 'Novo Usuário',
            message: 'Maria Silva foi cadastrada com sucesso',
            time: '10 min atrás',
            read: false
        },
        {
            id: 3,
            type: 'info' as const,
            title: 'Relatório Gerado',
            message: 'Relatório mensal de produtividade está pronto',
            time: '1 hora atrás',
            read: true
        },
        {
            id: 4,
            type: 'error' as const,
            title: 'Erro de Sincronização',
            message: 'Falha na sincronização com servidor principal',
            time: '2 horas atrás',
            read: true
        }
    ],

    // Dados para gráficos
    chartData: {
        attendance: [
            { name: 'Seg', value: 95 },
            { name: 'Ter', value: 98 },
            { name: 'Qua', value: 92 },
            { name: 'Qui', value: 96 },
            { name: 'Sex', value: 89 },
            { name: 'Sáb', value: 45 },
            { name: 'Dom', value: 12 }
        ],
        productivity: [
            { name: 'Jan', value: 85 },
            { name: 'Fev', value: 88 },
            { name: 'Mar', value: 92 },
            { name: 'Abr', value: 90 },
            { name: 'Mai', value: 94 },
            { name: 'Jun', value: 96 }
        ],
        departments: [
            { name: 'TI', value: 35, color: '#3B82F6' },
            { name: 'RH', value: 25, color: '#10B981' },
            { name: 'Financeiro', value: 20, color: '#F59E0B' },
            { name: 'Vendas', value: 20, color: '#EF4444' }
        ]
    }
};

export default mockDashboardData;






