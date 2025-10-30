import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Trash2,
    Eye,
    Filter,
    Search,
    Calendar,
    User,
    AlertCircle
} from 'lucide-react';
import emailService from '../../services/emailService';
import toast from 'react-hot-toast';

const EmailLogsModal = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        sent: 0,
        failed: 0,
        successRate: '0%'
    });

    // Carregar logs quando o modal abre
    useEffect(() => {
        if (isOpen) {
            loadLogs();
        }
    }, [isOpen]);

    // Carregar logs do localStorage
    const loadLogs = () => {
        setLoading(true);
        try {
            const emailLogs = emailService.getEmailLogs();
            setLogs(emailLogs);

            // Calcular estatísticas
            const emailStats = emailService.getEmailStats();
            setStats(emailStats);
        } catch (error) {
            console.error('Erro ao carregar logs:', error);
            toast.error('Erro ao carregar logs de e-mail');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar logs
    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Limpar logs
    const clearLogs = () => {
        if (window.confirm('Tem certeza que deseja limpar todos os logs de e-mail?')) {
            emailService.clearEmailLogs();
            loadLogs();
            toast.success('Logs de e-mail limpos com sucesso');
        }
    };

    // Formatar data
    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'Data não disponível';

            const date = new Date(dateString);

            // Verificar se a data é válida
            if (isNaN(date.getTime())) {
                return 'Data inválida';
            }

            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            console.error('Erro ao formatar data:', error, dateString);
            return 'Data inválida';
        }
    };

    // Obter ícone do status
    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    // Obter cor do status
    const getStatusColor = (status) => {
        switch (status) {
            case 'sent':
                return 'text-green-600 dark:text-green-400';
            case 'failed':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] shadow-2xl relative border border-gray-200 dark:border-gray-700"
                    initial={{ scale: 0.9, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -20 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Logs de E-mail
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Histórico de envios de credenciais
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Fechar"
                        >
                            <XCircle className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-5 w-5 text-blue-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Enviados</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.sent}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Falhas</span>
                            </div>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="h-5 w-5 text-purple-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Taxa de Sucesso</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.successRate}</p>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por e-mail ou assunto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="all">Todos os status</option>
                            <option value="sent">Enviados</option>
                            <option value="failed">Falhas</option>
                        </select>

                        <motion.button
                            onClick={loadLogs}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            title="Atualizar"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                            onClick={clearLogs}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            title="Limpar logs"
                        >
                            <Trash2 className="h-4 w-4" />
                        </motion.button>
                    </div>

                    {/* Lista de logs */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando logs...</span>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="text-center py-8">
                                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhum log encontrado</p>
                                <p className="text-sm text-gray-400">
                                    {logs.length === 0
                                        ? 'Nenhum e-mail foi enviado ainda'
                                        : 'Tente ajustar os filtros para encontrar logs'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {filteredLogs.map((log, index) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {getStatusIcon(log.status)}
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {log.to}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {log.subject}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                                                        {log.status === 'sent' ? 'Enviado' : 'Falha'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(log.timestamp)}
                                                    </p>
                                                </div>
                                            </div>

                                            {log.error && (
                                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                                    <p className="text-xs text-red-700 dark:text-red-400">
                                                        <strong>Erro:</strong> {log.error}
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EmailLogsModal;