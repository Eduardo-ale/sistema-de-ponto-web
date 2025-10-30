import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Clock,
    BarChart3,
    LogOut,
    Calendar,
    TrendingUp,
    UserCheck,
    FileText,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react';

const HRDashboard = () => {
    const stats = [
        { title: 'Total de Funcionários', value: '156', icon: Users, color: 'blue', change: '+5%' },
        { title: 'Pontos Hoje', value: '142', icon: Clock, color: 'green', change: '+2%' },
        { title: 'Atrasos', value: '8', icon: AlertTriangle, color: 'yellow', change: '-12%' },
        { title: 'Relatórios', value: '23', icon: FileText, color: 'purple', change: '+8%' }
    ];

    const recentActivities = [
        {
            user: 'Maria Silva',
            action: 'Registrou entrada',
            time: '08:15',
            status: 'success',
            department: 'Vendas'
        },
        {
            user: 'João Santos',
            action: 'Registrou saída',
            time: '17:45',
            status: 'success',
            department: 'TI'
        },
        {
            user: 'Ana Costa',
            action: 'Atraso na entrada',
            time: '09:30',
            status: 'warning',
            department: 'Marketing'
        },
        {
            user: 'Pedro Lima',
            action: 'Falta não justificada',
            time: '--:--',
            status: 'error',
            department: 'Produção'
        }
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'error':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'text-green-600 dark:text-green-400';
            case 'warning':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'error':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Painel de RH
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Gestão de Pessoas e Controle de Ponto
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Recursos Humanos
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    rh@sistema.com
                                </p>
                            </div>
                            <button className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {stat.value}
                                    </p>
                                    <p className={`text-xs mt-1 ${stat.change.startsWith('+')
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {stat.change} vs mês anterior
                                    </p>
                                </div>
                                <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Grid Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Atividades Recentes */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Atividades Recentes
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentActivities.map((activity, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                                    >
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(activity.status)}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {activity.user}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {activity.department}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                                                {activity.action}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Ações Rápidas */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        {/* Relatórios */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Relatórios
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {[
                                        { name: 'Relatório Mensal', icon: Calendar },
                                        { name: 'Análise de Frequência', icon: BarChart3 },
                                        { name: 'Horas Extras', icon: Clock },
                                        { name: 'Produtividade', icon: TrendingUp }
                                    ].map((report, index) => (
                                        <button
                                            key={report.name}
                                            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <report.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {report.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Alertas */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Alertas
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                3 Funcionários com Atraso
                                            </p>
                                            <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                                Hoje
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <XCircle className="w-5 h-5 text-red-500" />
                                        <div>
                                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                                1 Falta Não Justificada
                                            </p>
                                            <p className="text-xs text-red-600 dark:text-red-400">
                                                Hoje
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                Meta de Pontualidade Atingida
                                            </p>
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                Esta semana
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default HRDashboard;

