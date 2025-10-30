/**
 * Modal de progresso para operações de backup e restauração
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const ProgressModal = ({ isOpen, progress, mensagem, sucesso, erro }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
            >
                <div className="text-center">
                    {/* Ícone de status */}
                    {sucesso ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </motion.div>
                    ) : erro ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </motion.div>
                    ) : (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </motion.div>
                    )}

                    {/* Mensagem */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {sucesso ? 'Operação Concluída!' : erro ? 'Erro na Operação' : mensagem || 'Processando...'}
                    </h3>

                    {/* Descrição */}
                    {erro ? (
                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                            {erro}
                        </p>
                    ) : sucesso ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {mensagem || 'Operação realizada com sucesso!'}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Por favor, aguarde...
                        </p>
                    )}

                    {/* Barra de progresso */}
                    {!sucesso && !erro && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                            />
                        </div>
                    )}

                    {/* Porcentagem */}
                    {!sucesso && !erro && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {progress}%
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ProgressModal;

