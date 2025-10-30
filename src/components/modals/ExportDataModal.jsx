import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Download, FileText, Database, Users, Clock, BarChart3,
    CheckCircle, AlertCircle, Loader2, RefreshCw, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUsers } from '../../hooks/useRealData';
import horasService from '../../services/horasService';

const ExportDataModal = ({ isOpen, onClose }) => {
    const { users } = useUsers();
    const [loading, setLoading] = useState(false);
    const [exportFormat, setExportFormat] = useState('json');
    const [exportType, setExportType] = useState('all');
    const [includeMetadata, setIncludeMetadata] = useState(true);

    const exportFormats = [
        { value: 'json', label: 'JSON', icon: FileText, description: 'Formato estruturado para desenvolvimento' },
        { value: 'csv', label: 'CSV', icon: Database, description: 'Planilha compatível com Excel' },
        { value: 'txt', label: 'TXT', icon: FileText, description: 'Arquivo de texto simples' }
    ];

    const exportTypes = [
        { value: 'all', label: 'Todos os Dados', icon: Database, description: 'Exportar todos os usuários e dados' },
        { value: 'users', label: 'Apenas Usuários', icon: Users, description: 'Exportar apenas dados dos usuários' },
        { value: 'hours', label: 'Cálculos de Horas', icon: Clock, description: 'Exportar horas trabalhadas, extras e banco de horas' },
        { value: 'summary', label: 'Resumo', icon: BarChart3, description: 'Exportar estatísticas e resumos' }
    ];

    const formatData = (data, format, exportType) => {
        switch (format) {
            case 'csv':
                // Para exportação de horas, formatar de forma especial
                if (exportType === 'hours' && data.calculos) {
                    if (!data.calculos.length) return 'Nenhum cálculo disponível';
                    const headers = [
                        'Colaborador', 'Data', 'Entrada', 'Saída', 'Horas Trabalhadas',
                        'Jornada Contratual', 'Extras Total', 'Extras Diurnas', 'Extras Noturnas', 'Extras Feriado',
                        'Banco Positivo', 'Banco Negativo', 'Saldo', 'Atraso (min)', 'Feriado', 'Final Semana'
                    ];
                    const rows = data.calculos.map(calc => [
                        calc.colaborador || '',
                        calc.data || '',
                        calc.entrada || '',
                        calc.saida || '',
                        calc.horasTrabalhadas || 0,
                        calc.jornadaContratual || 0,
                        calc.horasExtras?.total || 0,
                        calc.horasExtras?.diurnas || 0,
                        calc.horasExtras?.noturnas || 0,
                        calc.horasExtras?.feriado || 0,
                        calc.bancoHoras?.positivo || 0,
                        calc.bancoHoras?.negativo || 0,
                        calc.bancoHoras?.saldo || 0,
                        calc.atraso?.minutos || 0,
                        calc.feriado ? 'Sim' : 'Não',
                        calc.finalSemana ? 'Sim' : 'Não'
                    ]);
                    return [headers.join(','), ...rows.map(row => row.map(v =>
                        typeof v === 'string' && v.includes(',') ? `"${v}"` : v
                    ).join(','))].join('\n');
                }

                if (!Array.isArray(data) || !data.length) return '';
                const headers = Object.keys(data[0]).join(',');
                const rows = data.map(item =>
                    Object.values(item).map(value =>
                        typeof value === 'string' && value.includes(',')
                            ? `"${value}"`
                            : value
                    ).join(',')
                );
                return [headers, ...rows].join('\n');

            case 'txt':
                if (Array.isArray(data)) {
                    return data.map(item =>
                        Object.entries(item)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\n')
                    ).join('\n\n');
                } else {
                    return Object.entries(data)
                        .map(([key, value]) => {
                            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                return `${key}:\n${Object.entries(value).map(([k, v]) => `  ${k}: ${v}`).join('\n')}`;
                            }
                            return `${key}: ${value}`;
                        })
                        .join('\n');
                }

            case 'json':
            default:
                return JSON.stringify(data, null, 2);
        }
    };

    const exportData = async () => {
        setLoading(true);

        try {
            let dataToExport = [];

            // Preparar dados baseado no tipo de exportação
            switch (exportType) {
                case 'users':
                    dataToExport = users || [];
                    break;
                case 'hours':
                    // Buscar todos os cálculos de horas
                    try {
                        const calculos = JSON.parse(localStorage.getItem('horas_calculadas') || '[]');
                        const totais = await horasService.getTotaisAgregados('mes');

                        dataToExport = {
                            calculos: calculos,
                            totais: totais,
                            resumo: {
                                totalCalculos: calculos.length,
                                periodo: 'mensal',
                                exportDate: new Date().toISOString()
                            },
                            metadata: includeMetadata ? {
                                exportDate: new Date().toISOString(),
                                systemVersion: '2.0.0',
                                generatedBy: 'Sistema de Ponto CORE RH',
                                description: 'Exportação de cálculos de horas trabalhadas, extras e banco de horas'
                            } : null
                        };
                    } catch (error) {
                        console.error('Erro ao buscar cálculos de horas:', error);
                        toast.error('Erro ao buscar dados de horas');
                        return;
                    }
                    break;
                case 'summary':
                    dataToExport = {
                        totalUsers: users?.length || 0,
                        activeUsers: users?.filter(u => u.status === 'Ativo').length || 0,
                        inactiveUsers: users?.filter(u => u.status === 'Inativo').length || 0,
                        departments: [...new Set(users?.map(u => u.department).filter(Boolean))],
                        profiles: [...new Set(users?.map(u => u.profile).filter(Boolean))],
                        exportDate: new Date().toISOString(),
                        generatedBy: 'Sistema de Ponto CORE RH'
                    };
                    break;
                case 'all':
                default:
                    // Incluir cálculos de horas quando exportar todos
                    try {
                        const calculos = JSON.parse(localStorage.getItem('horas_calculadas') || '[]');
                        dataToExport = {
                            users: users || [],
                            horasCalculadas: calculos,
                            metadata: includeMetadata ? {
                                exportDate: new Date().toISOString(),
                                totalRecords: users?.length || 0,
                                totalCalculos: calculos.length,
                                systemVersion: '2.0.0',
                                generatedBy: 'Sistema de Ponto CORE RH'
                            } : null
                        };
                    } catch (error) {
                        dataToExport = {
                            users: users || [],
                            metadata: includeMetadata ? {
                                exportDate: new Date().toISOString(),
                                totalRecords: users?.length || 0,
                                systemVersion: '2.0.0',
                                generatedBy: 'Sistema de Ponto CORE RH'
                            } : null
                        };
                    }
                    break;
            }

            // Formatar dados
            const formattedData = formatData(dataToExport, exportFormat, exportType);

            // Criar arquivo
            const blob = new Blob([formattedData], {
                type: exportFormat === 'csv' ? 'text/csv' :
                    exportFormat === 'txt' ? 'text/plain' :
                        'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Nome do arquivo
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `export_${exportType}_${timestamp}.${exportFormat}`;
            a.download = filename;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('✅ Dados exportados com sucesso!', {
                duration: 4000,
                style: {
                    background: '#10B981',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });

        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            toast.error('Erro ao exportar dados');
        } finally {
            setLoading(false);
        }
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
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Exportar Dados
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Configure e baixe os dados do sistema
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
                                <div className="space-y-6">
                                    {/* Formato de Exportação */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-blue-500" />
                                            Formato de Exportação
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {exportFormats.map((format) => {
                                                const Icon = format.icon;
                                                return (
                                                    <button
                                                        key={format.value}
                                                        onClick={() => setExportFormat(format.value)}
                                                        className={`p-4 rounded-lg border-2 transition-all text-left ${exportFormat === format.value
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <Icon className="w-5 h-5 text-blue-500" />
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {format.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {format.description}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Tipo de Dados */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                            <Database className="w-5 h-5 mr-2 text-green-500" />
                                            Tipo de Dados
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {exportTypes.map((type) => {
                                                const Icon = type.icon;
                                                return (
                                                    <button
                                                        key={type.value}
                                                        onClick={() => setExportType(type.value)}
                                                        className={`p-4 rounded-lg border-2 transition-all text-left ${exportType === type.value
                                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <Icon className="w-5 h-5 text-green-500" />
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {type.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {type.description}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Opções Adicionais */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                            <Settings className="w-5 h-5 mr-2 text-purple-500" />
                                            Opções Adicionais
                                        </h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={includeMetadata}
                                                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    Incluir metadados (data de exportação, versão do sistema, etc.)
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Resumo */}
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Resumo da Exportação
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Formato:</span>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {exportFormats.find(f => f.value === exportFormat)?.label}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {exportTypes.find(t => t.value === exportType)?.label}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Registros:</span>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {exportType === 'hours'
                                                        ? `${JSON.parse(localStorage.getItem('horas_calculadas') || '[]').length} cálculo(s)`
                                                        : `${users?.length || 0} usuário(s)`}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Metadados:</span>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {includeMetadata ? 'Incluídos' : 'Não incluídos'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Arquivo será baixado automaticamente
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={exportData}
                                        disabled={loading}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Exportando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                <span>Exportar Dados</span>
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

export default ExportDataModal;
