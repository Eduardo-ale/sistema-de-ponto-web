import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History,
    X,
    Search,
    Filter,
    Calendar,
    User,
    Mail,
    CheckCircle2,
    XCircle,
    Clock,
    Shield,
    Download,
    RefreshCw,
    AlertTriangle,
    Eye,
    Trash2
} from 'lucide-react';
import advancedEmailService from '../../services/advancedEmailService';

const PasswordResetHistoryModal = ({ isOpen, onClose }) => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [emailLogs, setEmailLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('all');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Carregar logs de auditoria
            const auditData = advancedEmailService.getPasswordResetAuditLogs();
            setAuditLogs(auditData);

            // Carregar logs de e-mail
            const emailData = JSON.parse(localStorage.getItem('emailLogs') || '[]');
            setEmailLogs(emailData);

            // Carregar estatísticas
            const statsData = advancedEmailService.getEmailStats();
            setStats(statsData);

            console.log('📊 Dados de histórico carregados:', {
                auditLogs: auditData.length,
                emailLogs: emailData.length,
                stats: statsData
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadData();
    };

    const handleClearHistory = () => {
        if (window.confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('passwordResetAudit');
            localStorage.removeItem('emailLogs');
            loadData();
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Data inválida';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'failed':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const filteredAuditLogs = auditLogs.filter(log => {
        const matchesSearch = log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resetBy?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                    className="bg-gray-900 rounded-3xl w-full max-w-6xl max-h-[90vh] shadow-2xl border border-gray-700 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-700 rounded-t-3xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                    <History className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Histórico de Redefinições de Senha
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        Logs de auditoria e notificações por e-mail
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {/* Estatísticas */}
                        {stats && (
                            <div className="px-8 py-4 bg-gray-800/50">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{stats.resets.total}</div>
                                        <div className="text-xs text-gray-400">Total de Redefinições</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-400">{stats.resets.successful}</div>
                                        <div className="text-xs text-gray-400">Sucessos</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{stats.resets.failed}</div>
                                        <div className="text-xs text-gray-400">Falhas</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-400">{stats.resets.successRate}%</div>
                                        <div className="text-xs text-gray-400">Taxa de Sucesso</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filtros */}
                        <div className="px-8 py-4 border-b border-gray-700">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por usuário, e-mail ou responsável..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="all">Todos os Status</option>
                                        <option value="success">Sucesso</option>
                                        <option value="failed">Falha</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Logs */}
                        <div className="flex-1 overflow-y-auto px-8 py-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                                    <span className="ml-2 text-gray-400">Carregando histórico...</span>
                                </div>
                            ) : filteredAuditLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                                    <History className="w-12 h-12 mb-4" />
                                    <p>Nenhum registro encontrado</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredAuditLogs.map((log) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {getStatusIcon(log.status)}
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-semibold text-white">
                                                                {log.userName}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(log.status)}`}>
                                                                {log.status === 'success' ? 'Sucesso' : 'Falha'}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            <span className="flex items-center space-x-1">
                                                                <Mail className="w-3 h-3" />
                                                                <span>{log.userEmail}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-400">
                                                        {formatDate(log.timestamp)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Por: {log.resetBy}
                                                    </div>
                                                </div>
                                            </div>
                                            {log.errorMessage && (
                                                <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                                                    <div className="flex items-start space-x-2">
                                                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                                                        <div>
                                                            <div className="text-sm font-medium text-red-400">Erro:</div>
                                                            <div className="text-sm text-red-300">{log.errorMessage}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-4 border-t border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                    {filteredAuditLogs.length} de {auditLogs.length} registros
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleClearHistory}
                                        className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2 inline" />
                                        Limpar Histórico
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PasswordResetHistoryModal;

import { motion, AnimatePresence } from 'framer-motion';
import {
    History,
    X,
    Search,
    Filter,
    Calendar,
    User,
    Mail,
    CheckCircle2,
    XCircle,
    Clock,
    Shield,
    Download,
    RefreshCw,
    AlertTriangle,
    Eye,
    Trash2
} from 'lucide-react';
import advancedEmailService from '../../services/advancedEmailService';

const PasswordResetHistoryModal = ({ isOpen, onClose }) => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [emailLogs, setEmailLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('all');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Carregar logs de auditoria
            const auditData = advancedEmailService.getPasswordResetAuditLogs();
            setAuditLogs(auditData);

            // Carregar logs de e-mail
            const emailData = JSON.parse(localStorage.getItem('emailLogs') || '[]');
            setEmailLogs(emailData);

            // Carregar estatísticas
            const statsData = advancedEmailService.getEmailStats();
            setStats(statsData);

            console.log('📊 Dados de histórico carregados:', {
                auditLogs: auditData.length,
                emailLogs: emailData.length,
                stats: statsData
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadData();
    };

    const handleClearHistory = () => {
        if (window.confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('passwordResetAudit');
            localStorage.removeItem('emailLogs');
            loadData();
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Data inválida';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'failed':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const filteredAuditLogs = auditLogs.filter(log => {
        const matchesSearch = log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resetBy?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                    className="bg-gray-900 rounded-3xl w-full max-w-6xl max-h-[90vh] shadow-2xl border border-gray-700 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-700 rounded-t-3xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                    <History className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Histórico de Redefinições de Senha
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        Logs de auditoria e notificações por e-mail
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {/* Estatísticas */}
                        {stats && (
                            <div className="px-8 py-4 bg-gray-800/50">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{stats.resets.total}</div>
                                        <div className="text-xs text-gray-400">Total de Redefinições</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-400">{stats.resets.successful}</div>
                                        <div className="text-xs text-gray-400">Sucessos</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{stats.resets.failed}</div>
                                        <div className="text-xs text-gray-400">Falhas</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-400">{stats.resets.successRate}%</div>
                                        <div className="text-xs text-gray-400">Taxa de Sucesso</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filtros */}
                        <div className="px-8 py-4 border-b border-gray-700">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por usuário, e-mail ou responsável..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="all">Todos os Status</option>
                                        <option value="success">Sucesso</option>
                                        <option value="failed">Falha</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Logs */}
                        <div className="flex-1 overflow-y-auto px-8 py-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                                    <span className="ml-2 text-gray-400">Carregando histórico...</span>
                                </div>
                            ) : filteredAuditLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                                    <History className="w-12 h-12 mb-4" />
                                    <p>Nenhum registro encontrado</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredAuditLogs.map((log) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {getStatusIcon(log.status)}
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-semibold text-white">
                                                                {log.userName}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(log.status)}`}>
                                                                {log.status === 'success' ? 'Sucesso' : 'Falha'}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            <span className="flex items-center space-x-1">
                                                                <Mail className="w-3 h-3" />
                                                                <span>{log.userEmail}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-400">
                                                        {formatDate(log.timestamp)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Por: {log.resetBy}
                                                    </div>
                                                </div>
                                            </div>
                                            {log.errorMessage && (
                                                <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                                                    <div className="flex items-start space-x-2">
                                                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                                                        <div>
                                                            <div className="text-sm font-medium text-red-400">Erro:</div>
                                                            <div className="text-sm text-red-300">{log.errorMessage}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-4 border-t border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                    {filteredAuditLogs.length} de {auditLogs.length} registros
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleClearHistory}
                                        className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2 inline" />
                                        Limpar Histórico
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PasswordResetHistoryModal;


