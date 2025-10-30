/**
 * Modal detalhado de cálculo de horas
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Clock,
    TrendingUp,
    TrendingDown,
    Calendar,
    AlertCircle,
    FileText,
    History,
    Download
} from 'lucide-react';
import { formatarHoras } from '../../utils/calculoHorasUtils';
import horasService from '../../services/horasService';
import { useLogsCalculo } from '../../hooks/useHorasCalculadas';
import GraficoHorasTrabalhadas from '../ui/GraficoHorasTrabalhadas';

const DetalhesHorasModal = ({ isOpen, onClose, marcacao, calculo }) => {
    const { logs } = useLogsCalculo(marcacao?.id);
    const [activeTab, setActiveTab] = useState('detalhes');

    if (!isOpen || !marcacao) return null;

    const tabs = [
        { id: 'detalhes', label: 'Detalhes', icon: FileText },
        { id: 'historico', label: 'Histórico', icon: History },
        { id: 'grafico', label: 'Gráfico', icon: TrendingUp }
    ];

    const exportarRelatorio = () => {
        const data = {
            colaborador: marcacao.colaborador,
            data: marcacao.data,
            entrada: marcacao.entrada,
            saida: marcacao.saida,
            calculo: calculo,
            logs: logs
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-horas-${marcacao.colaborador}-${marcacao.data}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Detalhamento de Horas
                                        </h2>
                                        <p className="text-sm text-white/80">
                                            {marcacao.colaborador} - {new Date(marcacao.data).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={exportarRelatorio}
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                        title="Exportar relatório"
                                    >
                                        <Download className="w-5 h-5 text-white" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                                <div className="flex space-x-1">
                                    {tabs.map((tab) => {
                                        const IconComponent = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center space-x-2 px-4 py-3 transition-colors relative ${isActive
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                    }`}
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                <span className="font-medium">{tab.label}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'detalhes' && (
                                        <motion.div
                                            key="detalhes"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-6"
                                        >
                                            {calculo ? (
                                                <>
                                                    {/* Resumo Principal */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                                    Horas Trabalhadas
                                                                </span>
                                                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                                                {formatarHoras(calculo.horasTrabalhadas)}
                                                            </p>
                                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                                Jornada contratual: {formatarHoras(calculo.jornadaContratual)}
                                                            </p>
                                                        </div>

                                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                                    Horas Extras
                                                                </span>
                                                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                            </div>
                                                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                                {formatarHoras(calculo.horasExtras.total)}
                                                            </p>
                                                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                                                Diurnas: {formatarHoras(calculo.horasExtras.diurnas)} |
                                                                Noturnas: {formatarHoras(calculo.horasExtras.noturnas)} |
                                                                Feriado: {formatarHoras(calculo.horasExtras.feriado)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Banco de Horas */}
                                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                                                Banco de Horas
                                                            </span>
                                                            {calculo.bancoHoras.saldo >= 0 ? (
                                                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                            ) : (
                                                                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Positivo</p>
                                                                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                                                    {formatarHoras(calculo.bancoHoras.positivo)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Negativo</p>
                                                                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                                                    {formatarHoras(calculo.bancoHoras.negativo)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Saldo</p>
                                                                <p className={`text-lg font-bold ${calculo.bancoHoras.saldo >= 0
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                                    }`}>
                                                                    {formatarHoras(Math.abs(calculo.bancoHoras.saldo))}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Linha do Tempo */}
                                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>Linha do Tempo - {new Date(marcacao.data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                                        </h3>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                                <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                                                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                                                                        Entrada
                                                                    </p>
                                                                    <p className="text-lg font-mono font-bold text-green-700 dark:text-green-300">
                                                                        {marcacao.entrada}
                                                                    </p>
                                                                    {calculo?.atraso?.atrasado && (
                                                                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                                                            ⚠️ Atraso de {calculo.atraso.minutos} minutos
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {marcacao.intervaloInicio && marcacao.intervaloFim ? (
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                                                    <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                                                                        <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                                                                            Intervalo de Almoço
                                                                        </p>
                                                                        <p className="text-lg font-mono font-bold text-orange-700 dark:text-orange-300">
                                                                            {marcacao.intervaloInicio} - {marcacao.intervaloFim}
                                                                        </p>
                                                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                                                            Duração: {formatarHoras((new Date(`2000-01-01 ${marcacao.intervaloFim}`) - new Date(`2000-01-01 ${marcacao.intervaloInicio}`)) / (1000 * 60 * 60))}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                                                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                            Intervalo de Almoço (Padrão)
                                                                        </p>
                                                                        <p className="text-lg font-mono font-bold text-gray-600 dark:text-gray-400">
                                                                            12:00 - 13:00
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                                            Intervalo padrão aplicado: 1 hora
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                                <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                                                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                                                                        Saída
                                                                    </p>
                                                                    <p className="text-lg font-mono font-bold text-red-700 dark:text-red-300">
                                                                        {marcacao.saida}
                                                                    </p>
                                                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                                        Total: {formatarHoras(calculo?.horasTrabalhadas || 0)}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Barra de progresso visual */}
                                                            <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-gradient-to-r from-green-500 via-orange-500 to-red-500 h-full"
                                                                    style={{ width: '100%' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Alertas */}
                                                    {(calculo.atraso.atrasado || calculo.feriado || calculo.finalSemana) && (
                                                        <div className="space-y-2">
                                                            {calculo.atraso.atrasado && (
                                                                <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                                                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                                                        Atraso de {calculo.atraso.minutos} minutos
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {calculo.feriado && (
                                                                <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                                    <span className="text-sm text-blue-800 dark:text-blue-200">
                                                                        Feriado - Horas extras com adicional de 100%
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {calculo.finalSemana && (
                                                                <div className="flex items-center space-x-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                                                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                                    <span className="text-sm text-indigo-800 dark:text-indigo-200">
                                                                        Final de semana
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        Cálculo não disponível para esta marcação
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'historico' && (
                                        <motion.div
                                            key="historico"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-4"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Logs de Cálculo
                                            </h3>
                                            {logs && logs.length > 0 ? (
                                                <div className="space-y-2">
                                                    {logs.map((log) => (
                                                        <div
                                                            key={log.id}
                                                            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {log.tipo === 'calculo_automatico' ? 'Cálculo Automático' : 'Recálculo'}
                                                                </span>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                {log.detalhes}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        Nenhum log disponível
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'grafico' && (
                                        <motion.div
                                            key="grafico"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                        >
                                            <GraficoHorasTrabalhadas
                                                usuarioId={marcacao.email || marcacao.colaborador}
                                                periodo="semana"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DetalhesHorasModal;

