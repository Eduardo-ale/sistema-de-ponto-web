/**
 * Componente reutilizável para filtros de relatórios
 */

import React from 'react';
import { Calendar, Search, Users, Filter as FilterIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';

const FiltroRelatorio = ({ filtros, onFiltrosChange, departamentos = [], usuarios = [] }) => {
    const handleChange = (key, value) => {
        onFiltrosChange({
            ...filtros,
            [key]: value
        });
    };

    const limparFiltros = () => {
        onFiltrosChange({
            dataInicio: '',
            dataFim: '',
            departamento: '',
            colaborador: '',
            busca: ''
        });
    };

    const temFiltrosAtivos = filtros.dataInicio || filtros.dataFim || filtros.departamento || filtros.colaborador || filtros.busca;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <FilterIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-white">Filtros</h3>
                </div>
                {temFiltrosAtivos && (
                    <button
                        onClick={limparFiltros}
                        className="text-sm text-gray-400 hover:text-white flex items-center space-x-1"
                    >
                        <X className="w-4 h-4" />
                        <span>Limpar Filtros</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Período - Data Inicial */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Data Inicial
                    </label>
                    <input
                        type="date"
                        value={filtros.dataInicio || ''}
                        onChange={(e) => handleChange('dataInicio', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Período - Data Final */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Data Final
                    </label>
                    <input
                        type="date"
                        value={filtros.dataFim || ''}
                        onChange={(e) => handleChange('dataFim', e.target.value)}
                        min={filtros.dataInicio || ''}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Departamento */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Departamento
                    </label>
                    <select
                        value={filtros.departamento || ''}
                        onChange={(e) => handleChange('departamento', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Todos</option>
                        {departamentos.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                {/* Colaborador/Busca */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Search className="w-4 h-4 inline mr-1" />
                        Colaborador / Busca
                    </label>
                    <input
                        type="text"
                        value={filtros.colaborador || filtros.busca || ''}
                        onChange={(e) => handleChange(filtros.colaborador !== undefined ? 'colaborador' : 'busca', e.target.value)}
                        placeholder="Nome ou email..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Indicador de filtros ativos */}
            {temFiltrosAtivos && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 pt-3 border-t border-gray-700"
                >
                    <p className="text-xs text-gray-400">
                        Filtros ativos: {
                            [
                                filtros.dataInicio && `De ${new Date(filtros.dataInicio).toLocaleDateString('pt-BR')}`,
                                filtros.dataFim && `Até ${new Date(filtros.dataFim).toLocaleDateString('pt-BR')}`,
                                filtros.departamento && `Dept: ${filtros.departamento}`,
                                filtros.colaborador && `Colab: ${filtros.colaborador}`,
                                filtros.busca && `Busca: ${filtros.busca}`
                            ].filter(Boolean).join(' | ')
                        }
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default FiltroRelatorio;

