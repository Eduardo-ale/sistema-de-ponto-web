import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Download,
    Eye,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    Shield,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        dateFrom: '',
        dateTo: '',
        user: 'all'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    // Carregar logs do localStorage
    useEffect(() => {
        loadLogs();
    }, []);

    // Filtrar logs
    useEffect(() => {
        let filtered = [...logs];

        // Filtro por busca
        if (filters.search) {
            filtered = filtered.filter(log =>
                log.userName?.toLowerCase().includes(filters.search.toLowerCase()) ||
                log.userEmail?.toLowerCase().includes(filters.search.toLowerCase()) ||
                log.details?.toLowerCase().includes(filters.search.toLowerCase()) ||
                log.ip?.includes(filters.search)
            );
        }

        // Filtro por tipo
        if (filters.type !== 'all') {
            filtered = filtered.filter(log => log.type === filters.type);
        }

        // Filtro por usuário
        if (filters.user !== 'all') {
            filtered = filtered.filter(log => log.userId === parseInt(filters.user));
        }

        // Filtro por data
        if (filters.dateFrom) {
            filtered = filtered.filter(log =>
                new Date(log.timestamp) >= new Date(filters.dateFrom)
            );
        }

        if (filters.dateTo) {
            filtered = filtered.filter(log =>
                new Date(log.timestamp) <= new Date(filters.dateTo + 'T23:59:59')
            );
        }

        setFilteredLogs(filtered);
        setCurrentPage(1);
    }, [logs, filters]);

    const loadLogs = () => {
        try {
            const storedLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
            setLogs(storedLogs);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao carregar logs:', error);
            setLoading(false);
        }
    };

    const getEventIcon = (type) => {
        switch (type) {
            case 'login_success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'login_failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'logout':
                return <Clock className="w-5 h-5 text-gray-500" />;
            case 'session_expired':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'session_warning':
                return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'session_renewed':
                return <RefreshCw className="w-5 h-5 text-blue-500" />;
            case 'session_resumed':
                return <Shield className="w-5 h-5 text-purple-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'login_success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'login_failed':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'logout':
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
            case 'session_expired':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'session_warning':
                return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
            case 'session_renewed':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            case 'session_resumed':
                return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
        }
    };

    const getEventLabel = (type) => {
        switch (type) {
            case 'login_success':
                return 'Login Bem-sucedido';
            case 'login_failed':
                return 'Falha no Login';
            case 'logout':
                return 'Logout';
            case 'session_expired':
                return 'Sessão Expirada';
            case 'session_warning':
                return 'Aviso de Sessão';
            case 'session_renewed':
                return 'Sessão Renovada';
            case 'session_resumed':
                return 'Sessão Retomada';
            default:
                return 'Evento';
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const exportLogs = () => {
        try {
            const csvContent = [
                ['Data/Hora', 'Tipo', 'Usuário', 'Email', 'IP', 'Detalhes'],
                ...filteredLogs.map(log => [
                    formatDate(log.timestamp),
                    getEventLabel(log.type),
                    log.userName || '-',
                    log.userEmail || '-',
                    log.ip || '-',
                    log.details || '-'
                ])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();

            toast.success('Logs exportados com sucesso!');
        } catch (error) {
            toast.error('Erro ao exportar logs');
        }
    };

    const clearLogs = () => {
        if (window.confirm('Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('auditLogs');
            setLogs([]);
            toast.success('Logs limpos com sucesso!');
        }
    };

    // Paginação
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLogs = filteredLogs.slice(startIndex, endIndex);

    // Obter usuários únicos para filtro
    const uniqueUsers = [...new Set(logs.map(log => log.userId).filter(Boolean))]
        .map(userId => {
            const userLog = logs.find(log => log.userId === userId);
            return { id: userId, name: userLog?.userName, email: userLog?.userEmail };
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Logs de Auditoria
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Monitoramento de segurança e atividades do sistema
                    </p>
                </div>

                <div className="flex space-x-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={loadLogs}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Atualizar</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={exportLogs}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Exportar</span>
                    </motion.button>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Busca */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Buscar
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Usuário, email, IP, detalhes..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Tipo de evento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Evento
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Todos os eventos</option>
                            <option value="login_success">Login bem-sucedido</option>
                            <option value="login_failed">Falha no login</option>
                            <option value="logout">Logout</option>
                            <option value="session_expired">Sessão expirada</option>
                            <option value="session_warning">Aviso de sessão</option>
                            <option value="session_renewed">Sessão renovada</option>
                            <option value="session_resumed">Sessão retomada</option>
                        </select>
                    </div>

                    {/* Data inicial */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data Inicial
                        </label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Data final */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data Final
                        </label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {logs.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Total de Logs
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {logs.filter(log => log.type === 'login_success').length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Logins Bem-sucedidos
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {logs.filter(log => log.type === 'login_failed').length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Falhas de Login
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {logs.filter(log => log.type === 'session_expired').length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Sessões Expiradas
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                {currentLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Nenhum log encontrado
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Ajuste os filtros para ver os logs de auditoria
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentLogs.map((log, index) => (
                            <motion.div
                                key={`${log.timestamp}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${getEventColor(log.type)} border-l-4`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getEventIcon(log.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {getEventLabel(log.type)}
                                            </h4>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(log.timestamp)}
                                            </span>
                                        </div>

                                        <div className="mt-2 space-y-1">
                                            {log.userName && (
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        <strong>{log.userName}</strong> ({log.userEmail})
                                                    </span>
                                                </div>
                                            )}

                                            {log.ip && (
                                                <div className="flex items-center space-x-2">
                                                    <Shield className="w-3 h-3 text-gray-400" />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        IP: {log.ip}
                                                    </span>
                                                </div>
                                            )}

                                            {log.details && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                    {log.details}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredLogs.length)} de {filteredLogs.length} logs
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Anterior
                                </button>

                                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                                    {currentPage} de {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Próximo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;






