import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, User, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { useUsers } from '../../hooks/useRealData';
import { useAuth } from '../../contexts/AuthContext';
import userLogsService from '../../services/userLogsService';

const DeleteUserModal = ({ isOpen, onClose, user }) => {
    const { actions: { deleteUser } } = useUsers();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');

    const handleDelete = async () => {
        if (!user) return;

        // Validar motivo
        if (!reason.trim()) {
            toast.error('Por favor, informe o motivo da exclusão');
            return;
        }

        if (reason.trim().length < 10) {
            toast.error('O motivo deve ter no mínimo 10 caracteres');
            return;
        }

        setLoading(true);

        try {
            const result = await deleteUser(user.id);

            if (result.success) {
                // Registrar log de exclusão
                try {
                    await userLogsService.saveDeletionLog(
                        user,
                        currentUser?.id || 'admin',
                        currentUser?.name || 'Administrador',
                        reason.trim()
                    );
                } catch (logError) {
                    console.error('Erro ao salvar log de exclusão:', logError);
                }

                toast.success('✅ Usuário excluído com sucesso!', {
                    duration: 4000,
                    style: {
                        background: '#10B981',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });
                setReason('');
                onClose();
            } else {
                toast.error(result.error || 'Erro ao excluir usuário');
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            toast.error('Erro interno do servidor');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Excluir Usuário
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Esta ação não pode ser desfeita
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    disabled={loading}
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="text-center space-y-4">
                                    {/* Ícone de aviso */}
                                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                                        <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                                    </div>

                                    {/* Mensagem principal */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Tem certeza que deseja excluir este usuário?
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Esta ação removerá permanentemente o usuário do sistema e não poderá ser desfeita.
                                        </p>
                                    </div>

                                    {/* Informações do usuário */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-left">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {user.name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.position} • {user.department}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Aviso adicional */}
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm">
                                                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                                                    Atenção!
                                                </p>
                                                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                                                    Todos os dados relacionados a este usuário serão perdidos permanentemente,
                                                    incluindo histórico de ponto e atividades.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campo de Motivo */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Motivo da Exclusão <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Descreva o motivo da exclusão deste usuário (mínimo 10 caracteres)..."
                                            rows="4"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                                            disabled={loading}
                                        />
                                        {reason && reason.length < 10 && (
                                            <p className="mt-1 text-sm text-red-500">
                                                O motivo deve ter no mínimo 10 caracteres ({reason.length}/10)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="px-6"
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleDelete}
                                    className="px-6 bg-red-600 hover:bg-red-700 text-white"
                                    disabled={loading || !reason.trim() || reason.trim().length < 10}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Excluindo...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Excluir Usuário
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DeleteUserModal;
