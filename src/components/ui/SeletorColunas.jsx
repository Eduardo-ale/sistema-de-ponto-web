/**
 * Componente para seleção de colunas a exibir em relatórios
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Columns, Check, X } from 'lucide-react';

const SeletorColunas = ({ colunas, colunasSelecionadas, onColunasChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleColuna = (colunaKey) => {
        const novasSelecionadas = colunasSelecionadas.includes(colunaKey)
            ? colunasSelecionadas.filter(c => c !== colunaKey)
            : [...colunasSelecionadas, colunaKey];

        onColunasChange(novasSelecionadas);
    };

    const selecionarTodas = () => {
        onColunasChange(colunas.map(c => c.key));
    };

    const deselecionarTodas = () => {
        onColunasChange([]);
    };

    const colunasVisiveis = colunas.filter(c => colunasSelecionadas.includes(c.key));
    const totalSelecionadas = colunasSelecionadas.length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors border border-gray-600"
            >
                <Columns className="w-4 h-4" />
                <span>Colunas ({totalSelecionadas}/{colunas.length})</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 p-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold text-white">Selecionar Colunas</h4>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mb-3 flex space-x-2">
                                <button
                                    onClick={selecionarTodas}
                                    className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
                                >
                                    Todas
                                </button>
                                <button
                                    onClick={deselecionarTodas}
                                    className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white text-xs"
                                >
                                    Nenhuma
                                </button>
                            </div>

                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {colunas.map(coluna => {
                                    const isSelected = colunasSelecionadas.includes(coluna.key);
                                    return (
                                        <label
                                            key={coluna.key}
                                            className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleColuna(coluna.key)}
                                                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                            />
                                            <span className={`text-sm ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                                {coluna.label || coluna.key}
                                            </span>
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-blue-400" />
                                            )}
                                        </label>
                                    );
                                })}
                            </div>

                            {colunasVisiveis.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <p className="text-xs text-gray-400 mb-2">Colunas visíveis:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {colunasVisiveis.map(col => (
                                            <span
                                                key={col.key}
                                                className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded"
                                            >
                                                {col.label || col.key}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SeletorColunas;

