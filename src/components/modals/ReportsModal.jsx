import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, FileText, Download, Calendar, Users, Clock, BarChart3,
    TrendingUp, Filter, Search, Eye, Printer, Mail, Share2,
    CheckCircle, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUsers } from '../../hooks/useRealData';

const ReportsModal = ({ isOpen, onClose }) => {
    const { users } = useUsers();
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('users');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [filters, setFilters] = useState({
        department: '',
        status: '',
        profile: ''
    });

    const reportTypes = [
        { value: 'users', label: 'Relatório de Usuários', icon: Users },
        { value: 'attendance', label: 'Relatório de Ponto', icon: Clock },
        { value: 'departments', label: 'Relatório por Departamento', icon: BarChart3 },
        { value: 'summary', label: 'Relatório Resumo', icon: FileText }
    ];

    const departments = [
        'Administração', 'Recursos Humanos', 'TI', 'Financeiro',
        'Vendas', 'Marketing', 'Operações', 'Fisioterapia',
        'Enfermagem', 'Medicina'
    ];

    const profiles = [
        'Administrador', 'Colaborador', 'Recursos Humanos', 'Gestor'
    ];

    const statusOptions = [
        'Ativo', 'Inativo'
    ];

    const generateReport = async () => {
        setLoading(true);

        try {
            // Simular geração de relatório
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Filtrar dados baseado nos filtros
            let filteredData = users || [];

            if (filters.department) {
                filteredData = filteredData.filter(user => user.department === filters.department);
            }

            if (filters.status) {
                filteredData = filteredData.filter(user => user.status === filters.status);
            }

            if (filters.profile) {
                filteredData = filteredData.filter(user => user.profile === filters.profile);
            }

            // Simular download
            const reportData = {
                type: reportType,
                dateRange,
                filters,
                data: filteredData,
                generatedAt: new Date().toISOString(),
                totalRecords: filteredData.length
            };

            // Criar arquivo de relatório
            const blob = new Blob([JSON.stringify(reportData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('✅ Relatório gerado e baixado com sucesso!', {
                duration: 4000,
                style: {
                    background: '#10B981',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });

        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            toast.error('Erro ao gerar relatório');
        } finally {
            setLoading(false);
        }
    };

    const previewReport = () => {
        toast('📊 Visualização do relatório em desenvolvimento', {
            icon: 'ℹ️',
            style: {
                background: '#3B82F6',
                color: '#fff',
            },
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Gerar Relatório
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Configure e gere relatórios personalizados
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Configurações do Relatório */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                            <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                                            Configurações do Relatório
                                        </h3>

                                        {/* Tipo de Relatório */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Tipo de Relatório
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {reportTypes.map((type) => {
                                                    const Icon = type.icon;
                                                    return (
                                                        <button
                                                            key={type.value}
                                                            onClick={() => setReportType(type.value)}
                                                            className={`p-3 rounded-lg border-2 transition-all ${reportType === type.value
                                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <Icon className="w-4 h-4 text-purple-500" />
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    {type.label}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Período */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Período
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Data Inicial</label>
                                                    <input
                                                        type="date"
                                                        value={dateRange.start}
                                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Data Final</label>
                                                    <input
                                                        type="date"
                                                        value={dateRange.end}
                                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filtros */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                            <Filter className="w-5 h-5 mr-2 text-green-500" />
                                            Filtros
                                        </h3>

                                        <div className="space-y-4">
                                            {/* Departamento */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Departamento
                                                </label>
                                                <select
                                                    value={filters.department}
                                                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="">Todos os departamentos</option>
                                                    {departments.map(dept => (
                                                        <option key={dept} value={dept}>{dept}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Status
                                                </label>
                                                <select
                                                    value={filters.status}
                                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="">Todos os status</option>
                                                    {statusOptions.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Perfil */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Perfil
                                                </label>
                                                <select
                                                    value={filters.profile}
                                                    onChange={(e) => setFilters(prev => ({ ...prev, profile: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="">Todos os perfis</option>
                                                    {profiles.map(profile => (
                                                        <option key={profile} value={profile}>{profile}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Resumo */}
                                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Resumo do Relatório
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {reportTypes.find(t => t.value === reportType)?.label}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Período:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {dateRange.start && dateRange.end
                                                    ? `${dateRange.start} a ${dateRange.end}`
                                                    : 'Não definido'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Filtros:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {Object.values(filters).filter(Boolean).length} aplicado(s)
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Registros:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {users?.length || 0} usuário(s)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Relatórios são gerados em formato JSON
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={previewReport}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center space-x-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Visualizar</span>
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={generateReport}
                                        disabled={loading}
                                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Gerando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                <span>Gerar Relatório</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ReportsModal;
