import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    AlertTriangle,
    RefreshCw,
    LogOut,
    Shield,
    Timer
} from 'lucide-react';
import toast from 'react-hot-toast';

const SessionWarningModal = ({
    isOpen,
    onClose,
    onExtendSession,
    onLogout,
    timeRemaining,
    isExtending = false
}) => {
    const [countdown, setCountdown] = useState(timeRemaining);

    // Atualizar countdown a cada segundo
    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen]);

    // Atualizar countdown quando timeRemaining muda
    useEffect(() => {
        setCountdown(timeRemaining);
    }, [timeRemaining]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleExtendSession = () => {
        toast.success('Sessão estendida com sucesso!', {
            duration: 3000,
            icon: '✅'
        });
        onExtendSession();
    };

    const handleLogout = () => {
        toast('Encerrando sessão...', {
            duration: 2000,
            icon: '👋',
            style: { background: '#3B82F6', color: '#fff' }
        });
        onLogout();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                    className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                            className="w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <AlertTriangle className="w-8 h-8 text-yellow-400" />
                        </motion.div>

                        <h3 className="text-xl font-bold text-white mb-2">
                            Sessão Inativa
                        </h3>

                        <p className="text-gray-400 text-sm">
                            Você está inativo há algum tempo. Sua sessão será encerrada automaticamente em:
                        </p>
                    </div>

                    {/* Timer */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-center mb-6"
                    >
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Timer className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm text-gray-400">Tempo restante</span>
                        </div>

                        <motion.div
                            key={countdown}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="text-3xl font-bold text-yellow-400 font-mono"
                        >
                            {formatTime(countdown)}
                        </motion.div>

                        {/* Barra de progresso */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <motion.div
                                className="bg-yellow-400 h-2 rounded-full"
                                initial={{ width: '100%' }}
                                animate={{ width: `${(countdown / timeRemaining) * 100}%` }}
                                transition={{ duration: 1, ease: 'linear' }}
                            />
                        </div>
                    </motion.div>

                    {/* Informações adicionais */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-800/30"
                    >
                        <div className="flex items-start space-x-3">
                            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div className="text-sm text-blue-300">
                                <p className="font-medium mb-1">Por segurança:</p>
                                <ul className="text-xs space-y-1 text-blue-400">
                                    <li>• Sua sessão será encerrada automaticamente</li>
                                    <li>• Todos os dados serão salvos</li>
                                    <li>• Você precisará fazer login novamente</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Botões de ação */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex space-x-3"
                    >
                        <motion.button
                            onClick={handleLogout}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sair Agora</span>
                        </motion.button>

                        <motion.button
                            onClick={handleExtendSession}
                            disabled={isExtending}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                            {isExtending ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Estendendo...</span>
                                </>
                            ) : (
                                <>
                                    <Clock className="w-4 h-4" />
                                    <span>Continuar</span>
                                </>
                            )}
                        </motion.button>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-center mt-4"
                    >
                        <p className="text-xs text-gray-500">
                            Clique fora desta janela para fechar
                        </p>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SessionWarningModal;