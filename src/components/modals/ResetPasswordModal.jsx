import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RotateCcw,
    X,
    Eye,
    EyeOff,
    Key,
    AlertCircle,
    CheckCircle,
    Loader2,
    Shield,
    Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateLogin } from '../../utils/loginUtils';
import advancedEmailService from '../../services/advancedEmailService';
import passwordSecurityService from '../../services/passwordSecurityService';
import PasswordSecurityFeedback, { PasswordSuccessAlert, PasswordErrorAlert } from '../ui/PasswordSecurityFeedback';
// Removido imports de Input e Button - usando elementos HTML nativos

const ResetPasswordModal = ({ isOpen, onClose, user, onSuccess }) => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordHistoryError, setPasswordHistoryError] = useState('');
    const [isValidatingHistory, setIsValidatingHistory] = useState(false);
    const [complexityCheck, setComplexityCheck] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const handleInputChange = (field, value) => {
        console.log('🔍 handleInputChange:', field, value, 'User:', user);

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpar erro quando usuário começar a digitar
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }

        // Limpar erro de histórico quando nova senha mudar
        if (field === 'newPassword') {
            setPasswordHistoryError('');
        }

        // Validação de segurança IMEDIATA (sem debounce)
        if (field === 'newPassword' && value.length >= 3) {
            validatePasswordSecurity(value);
        }
    };

    const validatePasswordSecurity = async (password) => {
        if (!user?.id) return;

        console.log('🔍 Validando segurança da senha IMEDIATAMENTE:', password);
        setIsValidatingHistory(true);

        try {
            const result = await passwordSecurityService.isPasswordRecentlyUsed(user.id, password);
            const complexity = passwordSecurityService.checkPasswordComplexity(password);

            console.log('🔍 Resultado da validação:', { result, complexity });

            setComplexityCheck(complexity);

            if (result.isUsed) {
                setPasswordHistoryError('Esta senha não é permitida, pois já foi utilizada recentemente.');
                console.log('❌ Senha já utilizada recentemente');
            } else if (!complexity.isValid) {
                setPasswordHistoryError('A senha não atende aos critérios de complexidade necessários.');
                console.log('❌ Senha não atende aos critérios de complexidade');
            } else {
                setPasswordHistoryError('');
                console.log('✅ Senha válida');
            }
        } catch (error) {
            console.error('❌ Erro na validação:', error);
            setPasswordHistoryError('Erro ao validar senha. Tente novamente.');
        } finally {
            setIsValidatingHistory(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validação da nova senha
        if (!formData.newPassword) {
            newErrors.newPassword = 'Nova senha é obrigatória';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'A senha deve ter pelo menos 6 caracteres';
        }

        // Validação da confirmação
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        // Validação de complexidade
        if (formData.newPassword) {
            const complexity = passwordSecurityService.checkPasswordComplexity(formData.newPassword);
            if (!complexity.isValid) {
                newErrors.newPassword = 'A senha deve conter pelo menos: 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 símbolo';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🔍 handleSubmit - User:', user, 'FormData:', formData);

        if (!user?.id) {
            toast.error('Usuário não encontrado', {
                icon: '❌',
                style: {
                    background: '#EF4444',
                    color: '#fff'
                }
            });
            return;
        }

        if (!validateForm()) {
            console.log('❌ Validação do formulário falhou');
            return;
        }

        // Verificar se há erro de histórico de senha
        if (passwordHistoryError) {
            console.log('❌ Erro de histórico de senha:', passwordHistoryError);
            setShowErrorAlert(true);
            setAlertMessage(passwordHistoryError);
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔍 Iniciando reset de senha para usuário:', user.id);

            // Resetar senha com histórico
            const resetResult = await passwordSecurityService.resetPasswordWithHistory(
                user.id,
                formData.newPassword
            );

            console.log('🔍 Resultado do reset:', resetResult);

            if (resetResult.status === 'PASSWORD_RECENTLY_USED') {
                setShowErrorAlert(true);
                setAlertMessage('Esta senha não é permitida, pois já foi utilizada recentemente.');
                return;
            }

            if (!resetResult.success) {
                throw new Error(resetResult.message || 'Erro ao redefinir senha');
            }

            // Enviar e-mail de notificação
            console.log('🔍 Enviando e-mail de notificação...');
            const resetInfo = {
                resetBy: 'Administrador',
                resetByUserId: 'admin',
                timestamp: new Date().toISOString(),
                ipAddress: '127.0.0.1'
            };

            const emailResult = await advancedEmailService.sendPasswordResetNotification(user, resetInfo);
            console.log('🔍 Resultado do e-mail:', emailResult);

            // Trigger de notificação interna
            try {
                const notificationTriggers = (await import('../../services/notificationTriggers')).default;
                await notificationTriggers.onSenhaRedefinida(
                    user,
                    { id: 'admin', name: 'Administrador' },
                    resetInfo.ipAddress
                );
            } catch (notifError) {
                console.error('Erro ao disparar notificação de senha redefinida:', notifError);
            }

            // Sucesso
            const successMessage = emailResult.success
                ? 'Senha redefinida com sucesso! E-mail de notificação enviado.'
                : 'Senha redefinida com sucesso! (E-mail não pôde ser enviado)';

            setAlertMessage(successMessage);
            setShowSuccessAlert(true);

            // Chamar callback de sucesso
            if (onSuccess) {
                onSuccess({
                    login: user.login || generateLogin(user.name),
                    password: formData.newPassword,
                    email: user.email
                });
            }

            // Limpar formulário
            setFormData({
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswords({ new: false, confirm: false });
            setPasswordHistoryError('');
            setComplexityCheck(null);

            console.log('✅ Reset de senha concluído com sucesso');

        } catch (error) {
            console.error('❌ Erro no reset de senha:', error);

            setShowErrorAlert(true);
            setAlertMessage(error.message || 'Erro ao redefinir senha. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            newPassword: '',
            confirmPassword: ''
        });
        setShowPasswords({ new: false, confirm: false });
        setErrors({});
        setPasswordHistoryError('');
        setComplexityCheck(null);
        setShowSuccessAlert(false);
        setShowErrorAlert(false);
        setAlertMessage('');
        onClose();
    };

    console.log('🔍 ResetPasswordModal render - showPasswords:', showPasswords);

    return (
        <>
            {/* Alertas de Sucesso e Erro */}
            {showSuccessAlert && (
                <PasswordSuccessAlert
                    message={alertMessage}
                    onClose={() => setShowSuccessAlert(false)}
                />
            )}
            {showErrorAlert && (
                <PasswordErrorAlert
                    message={alertMessage}
                    onClose={() => setShowErrorAlert(false)}
                />
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl border border-gray-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-gray-700 rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-blue-600/20 rounded-xl">
                                            <Shield className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">
                                                Redefinir Senha
                                            </h2>
                                            <p className="text-sm text-gray-400">
                                                Defina uma nova senha para o usuário
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-8 py-8">
                                {/* Usuário Selecionado */}
                                {user && (
                                    <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <Key className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{user.name}</p>
                                                <p className="text-sm text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Nova Senha */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nova Senha
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={formData.newPassword}
                                                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                                placeholder="Digite a nova senha"
                                                className="w-full pr-12 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                {showPasswords.new ? (
                                                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-white" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-gray-400 hover:text-white" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.newPassword && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.newPassword}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirmar Senha */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Confirmar Nova Senha
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                placeholder="Confirme a nova senha"
                                                className="w-full pr-12 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                {showPasswords.confirm ? (
                                                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-white" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-gray-400 hover:text-white" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>

                                    {/* Feedback de Segurança */}
                                    {complexityCheck && (
                                        <PasswordSecurityFeedback
                                            complexity={complexityCheck}
                                            isValidating={isValidatingHistory}
                                        />
                                    )}

                                    {/* Erro de Histórico de Senha */}
                                    {passwordHistoryError && (
                                        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                                            <div className="flex items-center space-x-2">
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                                <p className="text-sm text-red-400">{passwordHistoryError}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Botões */}
                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading || passwordHistoryError}
                                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Redefinindo...
                                                </>
                                            ) : (
                                                <>
                                                    <RotateCcw className="w-5 h-5 mr-2" />
                                                    Redefinir Senha
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ResetPasswordModal;