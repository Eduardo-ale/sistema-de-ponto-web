import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Briefcase, Shield, Clock, Calendar, CheckCircle, XCircle, Edit } from 'lucide-react';
import Button from '../ui/Button';

const UserDetailsModal = ({ isOpen, onClose, user, onEdit }) => {
    if (!isOpen || !user) return null;

    const getStatusIcon = (status) => {
        return status === 'Ativo' || status === 'active' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
            <XCircle className="w-5 h-5 text-red-500" />
        );
    };

    const getProfileIcon = (profile) => {
        switch (profile) {
            case 'admin':
                return <Shield className="w-5 h-5 text-purple-500" />;
            case 'colaborador':
                return <User className="w-5 h-5 text-blue-500" />;
            case 'rh':
                return <Briefcase className="w-5 h-5 text-green-500" />;
            default:
                return <User className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Nunca';
        try {
            return new Date(dateString).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Data inválida';
        }
    };

    const formatProfile = (profile) => {
        const profiles = {
            'admin': 'Administrador',
            'colaborador': 'Colaborador',
            'rh': 'Recursos Humanos',
            'gestor': 'Gestor'
        };
        return profiles[profile] || profile;
    };

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
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Detalhes do Usuário
                                    </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Informações completas do colaborador
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                    <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                <div className="space-y-6">
                                    {/* Informações Básicas */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                            <User className="w-5 h-5 mr-2 text-blue-500" />
                                            Informações Básicas
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Nome Completo
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        {user.name || 'Não informado'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        E-mail
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium flex items-center">
                                                        <Mail className="w-4 h-4 mr-2 text-blue-500" />
                                                        {user.email || 'Não informado'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Login de Acesso
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium flex items-center font-mono bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-lg">
                                                        <User className="w-4 h-4 mr-2 text-green-500" />
                                                        {user.login || 'Não gerado'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        CPF
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        {user.cpf || 'Não informado'}
                                                    </p>
                                    </div>
                                    <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Matrícula
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        {user.registration || 'Não informado'}
                                                    </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                                {/* Informações Profissionais */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                            <Briefcase className="w-5 h-5 mr-2 text-green-500" />
                                            Informações Profissionais
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                            <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Cargo
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                    {user.position || 'Não informado'}
                                                </p>
                                            </div>
                                            <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Departamento
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        {user.department || 'Não informado'}
                                                </p>
                                            </div>
                                        </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Perfil de Acesso
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium flex items-center">
                                                        {getProfileIcon(user.profile)}
                                                        <span className="ml-2">{formatProfile(user.profile)}</span>
                                                    </p>
                                            </div>
                                            <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Status
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium flex items-center">
                                                        {getStatusIcon(user.status)}
                                                        <span className="ml-2">{user.status || 'Não informado'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                    {/* Horários de Trabalho */}
                                    {(user.entryTime || user.exitTime || user.workSchedule) && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                                                Horários de Trabalho
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Entrada
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        {user.entryTime || 'Não definido'}
                                                    </p>
                                            </div>
                                            <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Saída
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        {user.exitTime || 'Não definido'}
                                                    </p>
                                            </div>
                                            <div>
                                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Escala
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        {user.workSchedule || 'Não definida'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    )}

                                    {/* Informações do Sistema */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                            <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                                            Informações do Sistema
                                        </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Data de Criação
                                                </label>
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {formatDate(user.createdAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Última Atualização
                                                </label>
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {formatDate(user.updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    ID do usuário: {user.id}
                                            </div>
                                                <div className="flex items-center space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        className="px-6"
                                    >
                                        Fechar
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            onEdit(user);
                                            // Não fechar o modal de detalhes imediatamente
                                            // Deixar o UsersManagementModal gerenciar isso
                                        }}
                                        className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar Usuário
                                    </Button>
                                                    </div>
                                                </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default UserDetailsModal;
