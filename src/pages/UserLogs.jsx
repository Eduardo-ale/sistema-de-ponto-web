import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Mail, UserPlus, UserX, Search, Filter, RefreshCw, CheckCircle,
    XCircle, Clock, Eye, FileText, Users
} from 'lucide-react';
import { useUserLogs } from '../hooks/useUserLogs';
import LogDetailsModal from '../components/modals/LogDetailsModal';
import toast from 'react-hot-toast';

const UserLogs = ({ onVoltar }) => {
    const { emailLogs, creationLogs, deletionLogs, loading, refreshLogs } = useUserLogs();

    const [activeTab, setActiveTab] = useState('email');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const itemsPerPage = 10;

    // Função para buscar pelo termo
    const filterBySearch = (items) => {
        if (!searchTerm) return items;

        const term = searchTerm.toLowerCase();
        return items.filter(item => {
            if (activeTab === 'email') {
                return item.recipient?.toLowerCase().includes(term) ||
                    item.subject?.toLowerCase().includes(term);
            } else if (activeTab === 'creation') {
                return item.userName?.toLowerCase().includes(term) ||
                    item.createdByName?.toLowerCase().includes(term);
            } else {
                return item.userName?.toLowerCase().includes(term) ||
                    item.deletedByName?.toLowerCase().includes(term);
            }
        });
    };

    // Função para filtrar por status
    const filterByStatus = (items) => {
        if (filterStatus === 'all') return items;

        return items.filter(item => {
            if (activeTab === 'email') {
                return item.status === filterStatus;
            } else {
                return item.status === filterStatus;
            }
        });
    };

    // Obter dados filtrados
    const getFilteredData = () => {
        let data = [];

        switch (activeTab) {
            case 'email':
                data = emailLogs;
                break;
            case 'creation':
                data = creationLogs;
                break;
            case 'deletion':
                data = deletionLogs;
                break;
            default:
                data = [];
        }

        data = filterBySearch(data);
        data = filterByStatus(data);

        return data;
    };

    const filteredData = getFilteredData();

    // Paginação
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleRefresh = async () => {
        toast.loading('Atualizando logs...');
        await refreshLogs();
        toast.dismiss();
        toast.success('Logs atualizados!');
    };

    const handleViewDetails = (log) => {
        setSelectedLog(log);
        setShowDetailsModal(true);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleDateString('pt-BR');
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const getTabIcon = (tab) => {
        switch (tab) {
            case 'email':
                return <Mail className="w-5 h-5" />;
            case 'creation':
                return <UserPlus className="w-5 h-5" />;
            case 'deletion':
                return <UserX className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    const tabs = [
        { id: 'email', label: 'Logs de Envio de E-mail', count: emailLogs.length, icon: Mail },
        { id: 'creation', label: 'Logs de Criação', count: creationLogs.length, icon: UserPlus },
        { id: 'deletion', label: 'Logs de Exclusão de Usuários', count: deletionLogs.length, icon: UserX }
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={onVoltar}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Voltar</span>
                        </button>

                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            <span>Atualizar</span>
                        </button>
                    </div>

                    <h1 className="text-3xl font-bold">Logs de Usuários</h1>
                    <p className="text-gray-400 mt-2">Histórico completo de ações do sistema</p>
                </div>

                {/* Tabs */}
                <div className="bg-gray-800 rounded-lg p-1 mb-6">
                    <div className="flex space-x-2">
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setCurrentPage(1);
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                }}
                                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all relative ${activeTab === tab.id
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {React.createElement(tab.icon, { className: 'w-5 h-5' })}
                                <span className="font-medium">{tab.label}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-600 text-gray-300'
                                    }`}>
                                    {tab.count}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={
                                    activeTab === 'email'
                                        ? 'Buscar por e-mail ou assunto...'
                                        : activeTab === 'creation'
                                            ? 'Buscar por usuário ou criador...'
                                            : 'Buscar por usuário ou executor...'
                                }
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                        >
                            <option value="all">Todos os status</option>
                            {activeTab === 'email' && (
                                <>
                                    <option value="sent">Enviados</option>
                                    <option value="failed">Falhas</option>
                                </>
                            )}
                            {(activeTab === 'creation' || activeTab === 'deletion') && (
                                <>
                                    <option value="success">Sucesso</option>
                                    <option value="failed">Falha</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : paginatedData.length === 0 ? (
                            <div className="flex flex-col items-center py-20 text-center">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                                    {activeTab === 'email' && <Mail className="w-12 h-12 text-gray-500" />}
                                    {activeTab === 'creation' && <UserPlus className="w-12 h-12 text-gray-500" />}
                                    {activeTab === 'deletion' && <UserX className="w-12 h-12 text-gray-500" />}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Nenhum log encontrado
                                </h3>
                                <p className="text-gray-400">
                                    {searchTerm || filterStatus !== 'all'
                                        ? 'Tente ajustar os filtros de busca.'
                                        : `Nenhum log de ${activeTab === 'email' ? 'e-mail' : activeTab === 'creation' ? 'criação' : 'exclusão'} foi registrado ainda.`
                                    }
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        {activeTab === 'email' && (
                                            <>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Destinatário</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Assunto/Tipo</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data/Hora</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Observações</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                                            </>
                                        )}
                                        {activeTab === 'creation' && (
                                            <>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário Criado</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Criado Por</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Hora</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                                            </>
                                        )}
                                        {activeTab === 'deletion' && (
                                            <>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário Excluído</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Excluído Por</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Hora</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Motivo</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {paginatedData.map((log) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="hover:bg-gray-700 cursor-pointer"
                                        >
                                            {activeTab === 'email' && (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Mail className="w-4 h-4 text-blue-400 mr-2" />
                                                            <span className="text-sm font-medium">{log.recipient || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium">{log.subject || 'N/A'}</div>
                                                            <div className="text-xs text-gray-400">{log.type || 'N/A'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center space-x-2">
                                                            {log.status === 'sent' ? (
                                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-400" />
                                                            )}
                                                            <span className={`text-sm font-medium ${log.status === 'sent' ? 'text-green-400' : 'text-red-400'}`}>
                                                                {log.status === 'sent' ? 'Enviado' : 'Falhou'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium">{formatDate(log.timestamp)}</div>
                                                            <div className="text-xs text-gray-400">{formatTime(log.timestamp)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-400">{log.observations || '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleViewDetails(log)}
                                                            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            <span className="text-sm">Detalhes</span>
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'creation' && (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <UserPlus className="w-4 h-4 text-green-400 mr-2" />
                                                            <span className="text-sm font-medium">{log.userName || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm">{log.createdByName || log.createdBy || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm">{formatDate(log.timestamp)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm">{formatTime(log.timestamp)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center space-x-2">
                                                            {log.status === 'success' ? (
                                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-400" />
                                                            )}
                                                            <span className={`text-sm font-medium ${log.status === 'success' ? 'text-green-400' : 'text-red-400'
                                                                }`}>
                                                                {log.status === 'success' ? 'Sucesso' : 'Falha'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleViewDetails(log)}
                                                            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            <span className="text-sm">Detalhes</span>
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'deletion' && (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <UserX className="w-4 h-4 text-red-400 mr-2" />
                                                            <span className="text-sm font-medium">{log.userName || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm">{log.deletedByName || log.deletedBy || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py- Doctrine whitespace-nowrap">
                                                        <span className="text-sm">{formatDate(log.timestamp)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm">{formatTime(log.timestamp)}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-400">{log.reason || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleViewDetails(log)}
                                                            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            <span className="text-sm">Detalhes</span>
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                    Página {currentPage} de {totalPages} ({filteredData.length} registros)
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalhes */}
            <LogDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                log={selectedLog}
                logType={activeTab}
            />
        </div>
    );
};

export default UserLogs;

