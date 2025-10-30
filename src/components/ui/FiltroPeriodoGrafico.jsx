/**
 * Componente de filtro de período para gráficos
 */

import React, { useState } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FiltroPeriodoGrafico = ({
    periodoPadrao = 'semana',
    onFiltroChange,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [periodoSelecionado, setPeriodoSelecionado] = useState(periodoPadrao);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [mesAno, setMesAno] = useState('');

    const presets = [
        { value: 'hoje', label: 'Hoje' },
        { value: 'semana', label: 'Esta Semana' },
        { value: 'mes', label: 'Este Mês' },
        { value: '7dias', label: 'Últimos 7 dias' },
        { value: '30dias', label: 'Últimos 30 dias' },
        { value: 'personalizado', label: 'Período Personalizado' },
        { value: 'mesEspecifico', label: 'Mês Específico' }
    ];

    const handlePresetChange = (value) => {
        setPeriodoSelecionado(value);
        setDataInicio('');
        setDataFim('');
        setMesAno('');

        if (value !== 'personalizado' && value !== 'mesEspecifico') {
            aplicarFiltro(value, null, null, null);
            setIsOpen(false);
        }
    };

    const aplicarFiltro = (periodo, inicio, fim, mes) => {
        if (onFiltroChange) {
            onFiltroChange({
                periodo: periodo || periodoSelecionado,
                dataInicio: inicio || dataInicio,
                dataFim: fim || dataFim,
                mesAno: mes || mesAno
            });
        }
        setIsOpen(false);
    };

    const handlePersonalizado = () => {
        if (dataInicio && dataFim) {
            aplicarFiltro('personalizado', dataInicio, dataFim, null);
        }
    };

    const handleMesEspecifico = () => {
        if (mesAno) {
            aplicarFiltro('mesEspecifico', null, null, mesAno);
        }
    };

    const resetarFiltro = () => {
        setPeriodoSelecionado(periodoPadrao);
        setDataInicio('');
        setDataFim('');
        setMesAno('');
        aplicarFiltro(periodoPadrao, null, null, null);
    };

    const getPeriodoLabel = () => {
        if (periodoSelecionado === 'personalizado' && dataInicio && dataFim) {
            return `${new Date(dataInicio).toLocaleDateString('pt-BR')} - ${new Date(dataFim).toLocaleDateString('pt-BR')}`;
        }
        if (periodoSelecionado === 'mesEspecifico' && mesAno) {
            const [ano, mes] = mesAno.split('-');
            return new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        }
        return presets.find(p => p.value === periodoSelecionado)?.label || 'Período';
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm text-white border border-gray-600"
            >
                <Calendar className="w-4 h-4" />
                <span className="text-xs">{getPeriodoLabel()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 right-0 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 min-w-[280px]"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-white">Filtrar Período</h4>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Presets rápidos */}
                                <div>
                                    <label className="text-xs text-gray-400 mb-2 block">Períodos Rápidos</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {presets.filter(p => p.value !== 'personalizado' && p.value !== 'mesEspecifico').map(preset => (
                                            <button
                                                key={preset.value}
                                                onClick={() => handlePresetChange(preset.value)}
                                                className={`px-3 py-2 text-xs rounded-lg transition-colors ${periodoSelecionado === preset.value
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Período Personalizado */}
                                {periodoSelecionado === 'personalizado' && (
                                    <div className="space-y-2 pt-2 border-t border-gray-700">
                                        <label className="text-xs text-gray-400 block">Data Inicial</label>
                                        <input
                                            type="date"
                                            value={dataInicio}
                                            onChange={(e) => setDataInicio(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                                        />
                                        <label className="text-xs text-gray-400 block">Data Final</label>
                                        <input
                                            type="date"
                                            value={dataFim}
                                            onChange={(e) => setDataFim(e.target.value)}
                                            min={dataInicio}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={handlePersonalizado}
                                            disabled={!dataInicio || !dataFim}
                                            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm text-white transition-colors"
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                )}

                                {/* Mês Específico */}
                                {periodoSelecionado === 'mesEspecifico' && (
                                    <div className="space-y-2 pt-2 border-t border-gray-700">
                                        <label className="text-xs text-gray-400 block">Mês e Ano</label>
                                        <input
                                            type="month"
                                            value={mesAno}
                                            onChange={(e) => setMesAno(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={handleMesEspecifico}
                                            disabled={!mesAno}
                                            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm text-white transition-colors"
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                )}

                                {/* Opção de selecionar personalizado/mês */}
                                {periodoSelecionado !== 'personalizado' && periodoSelecionado !== 'mesEspecifico' && (
                                    <div className="pt-2 border-t border-gray-700 space-y-2">
                                        <button
                                            onClick={() => handlePresetChange('personalizado')}
                                            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                                        >
                                            Período Personalizado
                                        </button>
                                        <button
                                            onClick={() => handlePresetChange('mesEspecifico')}
                                            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                                        >
                                            Mês Específico
                                        </button>
                                    </div>
                                )}

                                {/* Resetar */}
                                <div className="pt-2 border-t border-gray-700">
                                    <button
                                        onClick={resetarFiltro}
                                        className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                                    >
                                        Resetar para Padrão
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FiltroPeriodoGrafico;

