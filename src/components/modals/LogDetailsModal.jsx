import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, UserPlus, UserX, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

const LogDetailsModal = ({ isOpen, onClose, log, logType }) => {
    if (!isOpen || !log) return null;

    const getTypeIcon = () => {
        switch (logType) {
            case 'email':
                return <Mail className="w-6 h-6 text-blue-500" />;
            case 'creation':
                return <UserPlus className="w-6 h-6 text-green-500" />;
            case 'deletion':
                return <UserX className="w-6 h-6 text-red-500" />;
            default:
                return <FileText className="w-6 h-6 text-gray-500" />;
        }
    };

    const getTypeTitle = () => {
        switch (logType) {
            case 'email':
                return 'Detalhes do E-mail';
            case 'creation':
                return 'Detalhes da Criação';
            case 'deletion':
                return 'Detalhes da Exclusão';
            default:
                return 'Detalhes do Log';
        }
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('pt-BR'),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const { date, time } = formatDateTime(log.timestamp);

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
                    className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-700 rounded-lg">
                                {getTypeIcon()}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">{getTypeTitle()}</h3>
                                <p className="text-sm text-gray-400">ID: {log.id}</p>
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
                    <div className="p-6 space-y-4">
                        {/* Data e Hora */}
                        <div className="flex items-center space-x-3 p-4 bg-gray-700/50 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <div>
                                <p className="text-sm text-gray-400">Data e Hora</p>
                                <p className="text-white font-medium">{date} às {time}</p>
                            </div>
                        </div>

                        {/* Conteúdo específico por tipo */}
                        {logType === 'email' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-700/50 rounded-lg">
                                        <p className="text-sm text-gray-400 mb-1">Destinatário</p>
                                        <p className="text-white font-medium">{log.recipient || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-700/50 rounded-lg">
                                        <p className="text-sm text-gray-400 mb-1">Status</p>
                                        <div className="flex items-center space-x-2">
                                            {log.status === 'sent' ? (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-400" />
                                            )}
                                            <span className={`font-medium ${log.status === 'sent' ? 'text-green-400' : 'text-red-400'}`}>
                                                {log.status === 'sent' ? 'Enviado' : 'Falhou'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Assunto</p>
                                    <p className="text-white font-medium">{log.subject || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Tipo</p>
                                    <p className="text-white font-medium">{log.type || 'N/A'}</p>
                                </div>
                            </>
                        )}

                        {logType === 'creation' && (
                            <>
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Usuário Criado</p>
                                    <p className="text-white font-medium">{log.userName || 'N/A'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-700/50 rounded-lg">
                                        <p className="text-sm text-gray-400 mb-1">E-mail</p>
                                        <p className="text-white font-medium">{log.userEmail || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-700/50 rounded-lg">
                                        <p className="text-sm text-gray-400 mb-1">Status</p>
                                        <div className="flex items-center space-x-2">
                                            {log.status === 'success' ? (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-400" />
                                            )}
                                            <span className={`font-medium ${log.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                                {log.status === 'success' ? 'Sucesso' : 'Falha'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Criado Por</p>
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-blue-400" />
                                        <p className="text-white font-medium">{log.createdByName || log.createdBy || 'N/A'}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {logType === 'deletion' && (
                            <>
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Usuário Excluído</p>
                                    <p className="text-white font-medium">{log.userName || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">E-mail</p>
                                    <p className="text-white font-medium">{log.userEmail || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Excluído Por</p>
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-red-400" />
                                        <p className="text-white font-medium">{log.deletedByName || log.deletedBy || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Motivo da Exclusão</p>
                                    <p className="text-white">{log.reason || 'N/A'}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end p-6 border-t border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </motion.div >
            </motion.div >
        </AnimatePresence >
    );
};

export default LogDetailsModal;

