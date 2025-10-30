import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Plus, Search, Filter, RefreshCw, Clock, UserX, CheckCircle,
    XCircle, Eye, FileText, Loader2, Users, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import justificativasService from '../services/justificativasService';
import NovaJustificativaModal from '../components/modals/NovaJustificativaModal';
import DetalhesJustificativaModal from '../components/modals/DetalhesJustificativaModal';

const Justificativas = ({ onVoltar }) => {
    const { user } = useAuth();
    const canManage = user?.role === 'admin' || user?.role === 'manager';

    // Estados
    const [activeTab, setActiveTab] = useState(canManage ? 'approve' : 'my-requests');
    const [loading, setLoading] = useState(false);
    const [justificativas, setJustificativas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedJustificativa, setSelectedJustificativa] = useState(null);

    const itemsPerPage = 10;

    // Carregar dados
    useEffect(() => {
        loadJustificativas();
    }, []);

    const loadJustificativas = async () => {
        setLoading(true);
        try {
            const data = justificativasService.getJustificativas({
                search: searchTerm,
                status: filterStatus || undefined,
                tipo: filterType || undefined,
                colaboradorId: activeTab === 'my-requests' ? user.id : undefined
            });
            setJustificativas(data);
        } catch (error) {
            console.error('Erro ao carregar justificativas:', error);
            toast.error('Erro ao carregar justificativas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJustificativas();
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterType, activeTab]);

    // Filtros
    const filteredData = justificativas.filter(j => {
        if (activeTab === 'approve') {
            return j.status === 'pendente';
        }
        return true;
    });

    // Paginação
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleViewDetails = (justificativa) => {
        setSelectedJustificativa(justificativa);
        setShowDetailsModal(true);
    };

    const handleSuccess = () => {
        loadJustificativas();
    };

    // Abas
    const tabs = [
        { id: 'my-requests', label: 'Minhas Solicitações', icon: FileText, visible: true },
        { id: 'approve', label: 'Aprovar Solicitações', icon: CheckCircle, visible: canManage },
        { id: 'history', label: 'Histórico Completo', icon: Clock, visible: true }
    ].filter(tab => tab.visible);

    const getStatusBadge = (status) => {
        const config = {
            pendente: { color: 'bg-yellow-900/20 text-yellow-400', icon: Clock, label: 'Pendente' },
            aprovado: { color: 'bg-green-900/20 text-green-400', icon: CheckCircle, label: 'Aprovado' },
            recusado: { color: 'bg-red-900/20 text-red-400', icon: XCircle, label: 'Recusado' }
        };
        const { color, icon: Icon, label } = config[status] || config.pendente;
        return (
            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                <Icon className="w-3 h-3" />
                <span>{label}</span>
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onVoltar}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Voltar</span>
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-600 rounded-lg">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Justificativas de Ausência/Atraso</h1>
                                <p className="text-sm text-gray-400">Gerencie solicitações e aprovações</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {activeTab === 'my-requests' && (
                            <button
                                onClick={() => setShowNewModal(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Nova Justificativa</span>
                            </button>
                        )}
                        <button
                            onClick={loadJustificativas}
                            disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Atualizar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-800 border-b border-gray-700 px-6">
                <div className="flex space-x-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 flex items-center space-x-2 rounded-t-lg transition-colors relative ${activeTab === tab.id
                                ? 'bg-gray-900 text-yellow-400 border-b-2 border-yellow-400'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            {React.createElement(tab.icon, { className: 'w-5 h-5' })}
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    >
                        <option value="">Todos os tipos</option>
                        <option value="ausencia">Ausência</option>
                        <option value="atraso">Atraso</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    >
                        <option value="">Todos os status</option>
                        <option value="pendente">Pendente</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="recusado">Recusado</option>
                    </select>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('');
                            setFilterType('');
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Limpar Filtros</span>
                    </button>
                </div>
            </div>

            {/* Tabela */}
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
                    </div>
                ) : paginatedData.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Nenhuma solicitação encontrada</h3>
                        <p className="text-gray-400">
                            {activeTab === 'my-requests' && 'Comece criando sua primeira justificativa'}
                            {activeTab === 'approve' && 'Não há solicitações pendentes'}
                            {activeTab === 'history' && 'Não há histórico disponível'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        {activeTab === 'approve' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Colaborador</th>}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Data Evento</th>
                                        {activeTab !== 'approve' && activeTab !== 'my-requests' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Motivo</th>}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                                        {activeTab === 'history' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Decisão</th>}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {paginatedData.map((j) => (
                                        <tr key={j.id} className="hover:bg-gray-700 transition-colors">
                                            {activeTab === 'approve' && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span className="text-sm text-white">{j.colaboradorNome}</span>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${j.tipo === 'ausencia' ? 'bg-blue-900/20 text-blue-400' : 'bg-purple-900/20 text-purple-400'}`}>
                                                    {j.tipo === 'ausencia' ? <UserX className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    <span className="capitalize">{j.tipo}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-300">{formatDate(j.dataEvento)}</span>
                                                {j.horario && <span className="text-xs text-gray-500 ml-2">({j.horario})</span>}
                                            </td>
                                            {activeTab !== 'approve' && activeTab !== 'my-requests' && (
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-300">{truncateText(j.motivo, 60)}</span>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(j.status)}
                                            </td>
                                            {activeTab === 'history' && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {j.decisaoPor ? (
                                                        <div>
                                                            <div>{j.decisaoPor}</div>
                                                            <div className="text-xs text-gray-500">{formatDate(j.decisaoEm)}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleViewDetails(j)}
                                                    className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>Ver Detalhes</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 px-6 py-4">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        Anterior
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 rounded-lg transition-colors ${currentPage === index + 1 ? 'bg-yellow-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        Próxima
                    </button>
                </div>
            )}

            {/* Modais */}
            <AnimatePresence>
                {showNewModal && (
                    <NovaJustificativaModal
                        isOpen={showNewModal}
                        onClose={() => setShowNewModal(false)}
                        onSuccess={handleSuccess}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDetailsModal && (
                    <DetalhesJustificativaModal
                        isOpen={showDetailsModal}
                        onClose={() => {
                            setShowDetailsModal(false);
                            setSelectedJustificativa(null);
                        }}
                        justificativa={selectedJustificativa}
                        onUpdate={handleSuccess}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Justificativas;

