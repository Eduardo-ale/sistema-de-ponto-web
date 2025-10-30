import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, CheckCircle, XCircle, Clock, FileText, UserX, Calendar, User,
    Paperclip, Download, AlertCircle, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import justificativasService from '../../services/justificativasService';

const DetalhesJustificativaModal = ({ isOpen, onClose, justificativa, onUpdate }) => {
    const { user } = useAuth();
    const canEdit = user?.role === 'admin' || user?.role === 'manager';

    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState(null); // 'approve' | 'reject'
    const [observations, setObservations] = useState('');
    const [showConfirmApprove, setShowConfirmApprove] = useState(false);
    const [showConfirmReject, setShowConfirmReject] = useState(false);

    if (!isOpen || !justificativa) return null;

    const handleApproveClick = () => {
        setShowConfirmApprove(true);
    };

    const handleApprove = async () => {
        if (loading) return; // Prevenir múltiplas chamadas

        try {
            setShowConfirmApprove(false);
            setLoading(true);

            console.log('Iniciando aprovação...', {
                id: justificativa.id,
                user: user?.name,
                observations: observations.trim() || null
            });

            const result = await justificativasService.approveJustificativa(
                justificativa.id,
                user?.name || 'Admin',
                observations.trim() || null
            );

            console.log('Resultado da aprovação:', result);

            setLoading(false);

            if (result && result.success) {
                toast.success('Justificativa aprovada com sucesso!', {
                    icon: '✅',
                    style: {
                        background: '#10B981',
                        color: '#fff'
                    }
                });

                // Resetar estados
                setObservations('');
                setAction(null);

                // Atualizar a lista antes de fechar
                if (onUpdate) {
                    onUpdate();
                }

                // Fechar modal após um breve delay para o toast aparecer
                setTimeout(() => {
                    onClose();
                }, 300);
            } else {
                const errorMsg = result?.error || 'Erro ao aprovar justificativa';
                console.error('Erro na aprovação:', errorMsg);
                toast.error(errorMsg, {
                    icon: '❌',
                    style: {
                        background: '#EF4444',
                        color: '#fff'
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao aprovar:', error);
            setLoading(false);
            toast.error('Erro ao aprovar justificativa: ' + (error.message || 'Erro desconhecido'), {
                icon: '❌',
                style: {
                    background: '#EF4444',
                    color: '#fff'
                }
            });
        }
    };

    const handleRejectClick = () => {
        if (!observations.trim() || observations.trim().length < 10) {
            toast.error('Por favor, informe o motivo da recusa (mínimo 10 caracteres)', {
                icon: '❌',
                style: {
                    background: '#EF4444',
                    color: '#fff'
                }
            });
            return;
        }

        setShowConfirmReject(true);
    };

    const handleReject = async () => {
        try {
            setShowConfirmReject(false);
            setLoading(true);

            const result = await justificativasService.rejectJustificativa(
                justificativa.id,
                user.name,
                observations.trim()
            );

            setLoading(false);

            if (result.success) {
                toast.error('Justificativa recusada', {
                    icon: '❌',
                    style: {
                        background: '#EF4444',
                        color: '#fff'
                    }
                });

                // Resetar estados
                setObservations('');

                // Atualizar a lista antes de fechar
                if (onUpdate) {
                    onUpdate();
                }

                // Fechar modal após um breve delay para o toast aparecer
                setTimeout(() => {
                    onClose();
                }, 300);
            } else {
                toast.error(result.error || 'Erro ao recusar justificativa', {
                    icon: '❌',
                    style: {
                        background: '#EF4444',
                        color: '#fff'
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao recusar:', error);
            setLoading(false);
            toast.error('Erro ao recusar justificativa', {
                icon: '❌',
                style: {
                    background: '#EF4444',
                    color: '#fff'
                }
            });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = () => {
        const statusConfig = {
            pendente: { color: 'bg-yellow-900/20 text-yellow-400', icon: Clock, label: 'Pendente' },
            aprovado: { color: 'bg-green-900/20 text-green-400', icon: CheckCircle, label: 'Aprovado' },
            recusado: { color: 'bg-red-900/20 text-red-400', icon: XCircle, label: 'Recusado' }
        };

        const config = statusConfig[justificativa.status] || statusConfig.pendente;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className="w-4 h-4" />
                <span>{config.label}</span>
            </span>
        );
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    key="detalhes-justificativa-modal"
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
                        className="bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-600 rounded-lg">
                                    {justificativa.tipo === 'ausencia' ? (
                                        <UserX className="w-6 h-6 text-white" />
                                    ) : (
                                        <Clock className="w-6 h-6 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">
                                        {justificativa.tipo === 'ausencia' ? 'Justificativa de Ausência' : 'Justificativa de Atraso'}
                                    </h3>
                                    <p className="text-sm text-gray-400">{justificativa.colaboradorNome}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="p-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Status</span>
                                {getStatusBadge()}
                            </div>

                            {/* Tipo */}
                            <div className="p-4 bg-gray-700/50 rounded-lg">
                                <span className="text-sm text-gray-400 block mb-1">Tipo</span>
                                <span className="text-white font-medium capitalize">
                                    {justificativa.tipo === 'ausencia' ? 'Ausência' : 'Atraso'}
                                </span>
                            </div>

                            {/* Data Evento */}
                            <div className="p-4 bg-gray-700/50 rounded-lg">
                                <span className="text-sm text-gray-400 block mb-1">Data do Evento</span>
                                <span className="text-white font-medium">{formatDate(justificativa.dataEvento)}</span>
                            </div>

                            {/* Horário (se atraso) */}
                            {justificativa.tipo === 'atraso' && justificativa.horario && (
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <span className="text-sm text-gray-400 block mb-1">Horário</span>
                                    <span className="text-white font-medium">{justificativa.horario}</span>
                                </div>
                            )}

                            {/* Motivo */}
                            <div className="p-4 bg-gray-700/50 rounded-lg">
                                <span className="text-sm text-gray-400 block mb-1">Motivo</span>
                                <p className="text-white whitespace-pre-wrap">{justificativa.motivo}</p>
                            </div>

                            {/* Anexo */}
                            {justificativa.anexo && (
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <span className="text-sm text-gray-400 block mb-2">Anexo</span>
                                    <a
                                        href={justificativa.anexo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                        <span className="font-medium">{justificativa.anexo.name}</span>
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>
                            )}

                            {/* Observações (se aprovado) */}
                            {justificativa.status === 'aprovado' && justificativa.observacoes && (
                                <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg">
                                    <span className="text-sm text-green-400 block mb-1 font-medium">Observações da Aprovação</span>
                                    <p className="text-green-300">{justificativa.observacoes}</p>
                                </div>
                            )}

                            {/* Motivo da Recusa */}
                            {justificativa.status === 'recusado' && justificativa.motivoRecusa && (
                                <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg">
                                    <span className="text-sm text-red-400 block mb-1 font-medium">Motivo da Recusa</span>
                                    <p className="text-red-300">{justificativa.motivoRecusa}</p>
                                </div>
                            )}

                            {/* Info de Decisão */}
                            {justificativa.status !== 'pendente' && (
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <span className="text-sm text-gray-400 block mb-1">
                                        {justificativa.status === 'aprovado' ? 'Aprovado por' : 'Recusado por'}
                                    </span>
                                    <span className="text-white font-medium">{justificativa.decisaoPor}</span>
                                    <span className="text-gray-400 text-sm block mt-1">
                                        em {formatDate(justificativa.decisaoEm)} às {formatTime(justificativa.decisaoEm)}
                                    </span>
                                </div>
                            )}

                            {/* Ações (se pendente e admin/manager) */}
                            {canEdit && justificativa.status === 'pendente' && (
                                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Observações (Opcional para aprovação)
                                            {action === 'reject' && <span className="text-red-400">*</span>}
                                        </label>
                                        <textarea
                                            value={observations}
                                            onChange={(e) => setObservations(e.target.value)}
                                            rows="3"
                                            placeholder="Adicione observações sobre a decisão..."
                                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 resize-none"
                                        />
                                        {action === 'reject' && observations.length < 10 && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>Motivo da recusa deve ter no mínimo 10 caracteres</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={handleApproveClick}
                                            disabled={loading}
                                            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Aprovar</span>
                                        </button>
                                        <button
                                            onClick={handleRejectClick}
                                            disabled={loading}
                                            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            <span>Recusar</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Modal de Confirmação - Aprovar */}
            {showConfirmApprove && !loading && (
                <motion.div
                    key="confirm-approve-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowConfirmApprove(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-white mb-2">Confirmar Aprovação</h3>
                        <p className="text-gray-300 mb-6">Deseja realmente aprovar esta justificativa?</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowConfirmApprove(false)}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processando...</span>
                                    </>
                                ) : (
                                    <span>Confirmar</span>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Overlay de Loading */}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700 flex flex-col items-center space-y-4"
                    >
                        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
                        <p className="text-white font-medium">Processando aprovação...</p>
                    </motion.div>
                </motion.div>
            )}

            {/* Modal de Confirmação - Recusar */}
            {showConfirmReject && (
                <motion.div
                    key="confirm-reject-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowConfirmReject(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-white mb-2">Confirmar Recusa</h3>
                        <p className="text-gray-300 mb-6">Deseja realmente recusar esta justificativa?</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowConfirmReject(false)}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {loading ? 'Processando...' : 'Confirmar'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DetalhesJustificativaModal;

