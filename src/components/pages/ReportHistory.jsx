import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    Mail,
    Calendar,
    Filter,
    Search,
    RefreshCw,
    Trash2,
    Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReportHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        type: 'all',
        dateRange: 'all'
    });

    // Carregar histórico do localStorage
    useEffect(() => {
        loadHistory();
    }, []);

    // Aplicar filtros
    useEffect(() => {
        applyFilters();
    }, [history, filters]);

    const loadHistory = () => {
        try {
            const storedHistory = localStorage.getItem('reportHistory');
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                setHistory(parsedHistory.sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio)));
            }
            setLoading(false);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...history];

        // Filtro de busca
        if (filters.search) {
            filtered = filtered.filter(item =>
                item.tipoRelatorio.toLowerCase().includes(filters.search.toLowerCase()) ||
                item.destinatarios.toLowerCase().includes(filters.search.toLowerCase()) ||
                item.observacao?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        // Filtro de status
        if (filters.status !== 'all') {
            filtered = filtered.filter(item => item.statusEnvio === filters.status);
        }

        // Filtro de tipo
        if (filters.type !== 'all') {
            filtered = filtered.filter(item => item.tipoRelatorio === filters.type);
        }

        // Filtro de data
        if (filters.dateRange !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (filters.dateRange) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                default:
                    break;
            }

            filtered = filtered.filter(item => new Date(item.dataEnvio) >= filterDate);
        }

        setFilteredHistory(filtered);
    };

    const addToHistory = (reportData) => {
        const newReport = {
            id: Date.now(),
            tipoRelatorio: reportData.tipoRelatorio || 'Relatório Semanal de Ausências',
            dataEnvio: new Date().toISOString(),
            destinatarios: reportData.destinatarios || 'rh@saude.ms.gov.br, admin@core.ms.gov.br, ti@core.ms.gov.br',
            statusEnvio: reportData.statusEnvio || 'Sucesso',
            caminhoPdf: reportData.caminhoPdf || `Relatorio_Ausencias_${new Date().toISOString().split('T')[0]}.pdf`,
            observacao: reportData.observacao || '',
            tamanhoArquivo: reportData.tamanhoArquivo || '2.5 MB'
        };

        const updatedHistory = [newReport, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('reportHistory', JSON.stringify(updatedHistory));
    };

    const deleteReport = (id) => {
        const updatedHistory = history.filter(item => item.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem('reportHistory', JSON.stringify(updatedHistory));
        toast.success('Relatório removido do histórico');
    };

    const downloadReport = (report) => {
        // Simular download do PDF
        toast.loading('Preparando download...', { id: 'download' });

        setTimeout(() => {
            // Criar link de download simulado
            const link = document.createElement('a');
            link.href = '#';
            link.download = report.caminhoPdf;
            link.click();

            toast.success('Download iniciado!', { id: 'download' });
        }, 1000);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Sucesso':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'Falha':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'Pendente':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Sucesso':
                return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'Falha':
                return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'Pendente':
                return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            default:
                return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const clearHistory = () => {
        if (window.confirm('Tem certeza que deseja limpar todo o histórico?')) {
            setHistory([]);
            localStorage.removeItem('reportHistory');
            toast.success('Histórico limpo com sucesso');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-800/30 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-200">
                            Histórico de Relatórios
                        </h2>
                        <p className="text-sm text-gray-400">
                            Visualize todos os relatórios enviados automaticamente
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <motion.button
                        onClick={loadHistory}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCw className="h-4 w-4 text-gray-300" />
                    </motion.button>

                    {history.length > 0 && (
                        <motion.button
                            onClick={clearHistory}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors"
                            title="Limpar histórico"
                        >
                            <Trash2 className="h-4 w-4 text-red-400" />
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                <div className="flex items-center space-x-2 mb-4">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Filtros</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Busca */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar relatórios..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Status */}
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">Todos os status</option>
                        <option value="Sucesso">Sucesso</option>
                        <option value="Falha">Falha</option>
                        <option value="Pendente">Pendente</option>
                    </select>

                    {/* Tipo */}
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">Todos os tipos</option>
                        <option value="Relatório Semanal de Ausências">Semanal de Ausências</option>
                        <option value="Relatório Diário">Diário</option>
                        <option value="Relatório Mensal">Mensal</option>
                    </select>

                    {/* Data */}
                    <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">Todas as datas</option>
                        <option value="today">Hoje</option>
                        <option value="week">Última semana</option>
                        <option value="month">Último mês</option>
                    </select>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <span className="text-sm text-gray-400">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-200">{history.length}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <span className="text-sm text-gray-400">Sucessos</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">
                        {history.filter(h => h.statusEnvio === 'Sucesso').length}
                    </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <span className="text-sm text-gray-400">Falhas</span>
                    </div>
                    <p className="text-2xl font-bold text-red-400">
                        {history.filter(h => h.statusEnvio === 'Falha').length}
                    </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex items-center space-x-2">
                        <Mail className="h-5 w-5 text-purple-400" />
                        <span className="text-sm text-gray-400">Taxa de Sucesso</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">
                        {history.length > 0
                            ? Math.round((history.filter(h => h.statusEnvio === 'Sucesso').length / history.length) * 100)
                            : 0}%
                    </p>
                </div>
            </div>

            {/* Tabela de Histórico */}
            <div className="bg-gray-800/50 rounded-lg border border-gray-700/30 overflow-hidden">
                {filteredHistory.length === 0 ? (
                    <div className="p-8 text-center">
                        <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">Nenhum relatório encontrado</p>
                        <p className="text-sm text-gray-500">
                            {history.length === 0
                                ? 'Execute um relatório para ver o histórico aqui'
                                : 'Tente ajustar os filtros para encontrar relatórios'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Data/Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Destinatários
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Arquivo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/30">
                                <AnimatePresence>
                                    {filteredHistory.map((report, index) => (
                                        <motion.tr
                                            key={report.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-700/30 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-200">
                                                        {formatDate(report.dataEnvio)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-200">
                                                    {report.tipoRelatorio}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-200 truncate max-w-xs">
                                                        {report.destinatarios}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(report.statusEnvio)}`}>
                                                    {getStatusIcon(report.statusEnvio)}
                                                    <span className="text-sm font-medium">
                                                        {report.statusEnvio}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-200">
                                                        {report.caminhoPdf}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        ({report.tamanhoArquivo})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <motion.button
                                                        onClick={() => downloadReport(report)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                                        title="Baixar relatório"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </motion.button>

                                                    <motion.button
                                                        onClick={() => deleteReport(report.id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                                        title="Remover do histórico"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ReportHistory;
