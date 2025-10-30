import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Shield, Clock } from 'lucide-react';

const PasswordSecurityFeedback = ({
    complexityCheck,
    passwordHistoryError,
    isValidatingHistory
}) => {
    if (!complexityCheck && !passwordHistoryError && !isValidatingHistory) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
        >
            {/* Feedback de Complexidade */}
            {complexityCheck && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-600"
                >
                    <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-white mb-2">
                                Requisitos de Segurança
                            </h4>
                            <div className="space-y-1">
                                <div className={`flex items-center space-x-2 text-xs ${complexityCheck.length ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {complexityCheck.length ? (
                                        <CheckCircle className="w-3 h-3" />
                                    ) : (
                                        <AlertCircle className="w-3 h-3" />
                                    )}
                                    <span>Mínimo 8 caracteres</span>
                                </div>
                                <div className={`flex items-center space-x-2 text-xs ${complexityCheck.uppercase ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {complexityCheck.uppercase ? (
                                        <CheckCircle className="w-3 h-3" />
                                    ) : (
                                        <AlertCircle className="w-3 h-3" />
                                    )}
                                    <span>Pelo menos 1 letra maiúscula</span>
                                </div>
                                <div className={`flex items-center space-x-2 text-xs ${complexityCheck.lowercase ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {complexityCheck.lowercase ? (
                                        <CheckCircle className="w-3 h-3" />
                                    ) : (
                                        <AlertCircle className="w-3 h-3" />
                                    )}
                                    <span>Pelo menos 1 letra minúscula</span>
                                </div>
                                <div className={`flex items-center space-x-2 text-xs ${complexityCheck.number ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {complexityCheck.number ? (
                                        <CheckCircle className="w-3 h-3" />
                                    ) : (
                                        <AlertCircle className="w-3 h-3" />
                                    )}
                                    <span>Pelo menos 1 número</span>
                                </div>
                                <div className={`flex items-center space-x-2 text-xs ${complexityCheck.symbol ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {complexityCheck.symbol ? (
                                        <CheckCircle className="w-3 h-3" />
                                    ) : (
                                        <AlertCircle className="w-3 h-3" />
                                    )}
                                    <span>Pelo menos 1 símbolo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Feedback de Histórico */}
            {isValidatingHistory && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-600"
                >
                    <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-yellow-400 animate-spin" />
                        <span className="text-sm text-yellow-400">
                            Verificando histórico de senhas...
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Erro de Histórico */}
            {passwordHistoryError && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-red-900/20 rounded-lg border border-red-500/50"
                >
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-400 mb-1">
                                Senha Não Permitida
                            </h4>
                            <p className="text-xs text-red-300">
                                {passwordHistoryError}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export const PasswordSuccessAlert = ({ message, onClose }) => {
    // Não renderizar se não houver mensagem
    if (!message) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 p-4 bg-green-900/90 backdrop-blur-sm rounded-lg border border-green-500/50 shadow-lg"
        >
            <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-400">
                        Senha Redefinida com Sucesso!
                    </h4>
                    <p className="text-xs text-green-300 mt-1">
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-green-800/50 transition-colors"
                >
                    <AlertCircle className="w-4 h-4 text-green-400" />
                </button>
            </div>
        </motion.div>
    );
};

export const PasswordErrorAlert = ({ message, onClose }) => {
    // Não renderizar se não houver mensagem
    if (!message) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 p-4 bg-red-900/90 backdrop-blur-sm rounded-lg border border-red-500/50 shadow-lg"
        >
            <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-400">
                        Erro ao Redefinir Senha
                    </h4>
                    <p className="text-xs text-red-300 mt-1">
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-red-800/50 transition-colors"
                >
                    <AlertCircle className="w-4 h-4 text-red-400" />
                </button>
            </div>
        </motion.div>
    );
};

export default PasswordSecurityFeedback;