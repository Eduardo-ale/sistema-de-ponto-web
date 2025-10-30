import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import correcaoMarcacoesService from '../../services/correcaoMarcacoesService';

const HistoricoCorrecoesModal = ({ isOpen, onClose, marcacao }) => {
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && marcacao) {
            loadHistorico();
        }
    }, [isOpen, marcacao]);

    const loadHistorico = async () => {
        try {
            setLoading(true);
            const data = await correcaoMarcacoesService.getHistoricoCorrecoes(marcacao.id);
            setHistorico(data);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('pt-BR'),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (!isOpen || !marcacao) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-600 rounded-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Histórico de Correções</h3>
                                <p className="text-sm text-gray-400">
                                    {marcacao.colaborador} - {new Date(marcacao.data).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Clock className="w-8 h-8 animate-spin text-purple-500" />
                            </div>
                        ) : historico.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                                    <FileText className="w-12 h-12 text-gray-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-300">Nenhuma correção registrada</h3>
                                <p className="text-gray-400">
                                    Esta marcação ainda não possui correções em seu histórico.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {historico.map((correcao, index) => {
                                    const { date, time } = formatDateTime(correcao.dataCorrecao);
                                    const entradaAlterada = correcao.entradaOriginal !== correcao.entradaNova;
                                    const saidaAlterada = correcao.saidaOriginal !== correcao.saidaNova;

                                    return (
                                        <motion.div
                                            key={correcao.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gray-700/50 rounded-lg p-5 border border-gray-600"
                                        >
                                            {/* Header do Card */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold">{correcao.corrigidoPor}</p>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{date} às {time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                    <span className="text-xs font-medium text-green-400">Corrigida</span>
                                                </div>
                                            </div>

                                            {/* Alterações */}
                                            {entradaAlterada && (
                                                <div className="mb-3 p-3 bg-gray-600/50 rounded-lg">
                                                    <p className="text-xs text-gray-400 mb-1">Entrada</p>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-red-300 font-mono font-medium">{correcao.entradaOriginal}</span>
                                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                                        <span className="text-green-300 font-mono font-medium">{correcao.entradaNova}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {saidaAlterada && (
                                                <div className="mb-3 p-3 bg-gray-600/50 rounded-lg">
                                                    <p className="text-xs text-gray-400 mb-1">Saída</p>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-red-300 font-mono font-medium">{correcao.saidaOriginal}</span>
                                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                                        <span className="text-green-300 font-mono font-medium">{correcao.saidaNova}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Motivo */}
                                            <div className="p-3 bg-gray-600/30 rounded-lg border border-gray-600">
                                                <p className="text-xs text-gray-400 mb-2">Motivo da Correção</p>
                                                <p className="text-gray-200 text-sm leading-relaxed">{correcao.motivo}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end p-6 border-t border-gray-700 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HistoricoCorrecoesModal;

