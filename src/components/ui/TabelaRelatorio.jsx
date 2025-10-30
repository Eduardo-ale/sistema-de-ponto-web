/**
 * Componente reutilizável de tabela com paginação e busca
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react';

const TabelaRelatorio = ({
    dados,
    colunas,
    loading = false,
    onRowClick,
    onExport,
    titulo = 'Dados'
}) => {
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina] = useState(20);
    const [busca, setBusca] = useState('');

    // Filtrar dados por busca
    const dadosFiltrados = useMemo(() => {
        if (!busca) return dados;

        const buscaLower = busca.toLowerCase();
        return dados.filter(item => {
            return colunas.some(col => {
                const valor = item[col.key];
                if (valor === null || valor === undefined) return false;
                return String(valor).toLowerCase().includes(buscaLower);
            });
        });
    }, [dados, busca, colunas]);

    // Calcular paginação
    const totalPaginas = Math.ceil(dadosFiltrados.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const dadosPagina = dadosFiltrados.slice(inicio, fim);

    const irParaPagina = (pagina) => {
        setPaginaAtual(Math.max(1, Math.min(pagina, totalPaginas)));
    };

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-400">Carregando dados...</p>
            </div>
        );
    }

    if (!dados || dados.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                <p className="text-gray-400">Nenhum dado disponível para exibição</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
            {/* Cabeçalho com busca e exportação */}
            <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2 flex-1 max-w-md">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={busca}
                        onChange={(e) => {
                            setBusca(e.target.value);
                            setPaginaAtual(1); // Resetar para primeira página
                        }}
                        placeholder={`Buscar em ${titulo.toLowerCase()}...`}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                {onExport && (
                    <button
                        onClick={() => onExport(dadosFiltrados)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Exportar</span>
                    </button>
                )}
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-700 border-b border-gray-600">
                            {colunas.map(col => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                                >
                                    {col.label || col.key}
                                </th>
                            ))}
                            {onRowClick && (
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Ações
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {dadosPagina.map((item, index) => (
                            <motion.tr
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.02 }}
                                className={`hover:bg-gray-700/50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick && onRowClick(item)}
                            >
                                {colunas.map(col => (
                                    <td
                                        key={col.key}
                                        className="px-4 py-3 text-sm text-gray-300"
                                    >
                                        {col.format ? col.format(item[col.key], item) : (item[col.key] ?? 'N/A')}
                                    </td>
                                ))}
                                {onRowClick && (
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRowClick(item);
                                            }}
                                            className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span className="text-xs">Ver</span>
                                        </button>
                                    </td>
                                )}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Rodapé com paginação e informações */}
            <div className="p-4 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-400">
                    Mostrando {inicio + 1} até {Math.min(fim, dadosFiltrados.length)} de {dadosFiltrados.length} {titulo.toLowerCase()}
                    {busca && ` (filtrado de ${dados.length} total)`}
                </div>

                {totalPaginas > 1 && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => irParaPagina(paginaAtual - 1)}
                            disabled={paginaAtual === 1}
                            className={`p-2 rounded-lg ${paginaAtual === 1
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <span className="text-sm text-gray-300">
                            Página {paginaAtual} de {totalPaginas}
                        </span>

                        <button
                            onClick={() => irParaPagina(paginaAtual + 1)}
                            disabled={paginaAtual === totalPaginas}
                            className={`p-2 rounded-lg ${paginaAtual === totalPaginas
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                                }`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabelaRelatorio;

