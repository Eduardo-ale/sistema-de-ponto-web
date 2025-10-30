import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Mail,
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Eye,
    EyeOff,
    Lock,
    Shield
} from 'lucide-react';
import passwordResetService from '../services/passwordResetService';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState('email'); // 'email', 'success', 'reset'
    const [formData, setFormData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Validar força da senha
    const validatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };

    // Manipular mudanças nos campos
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'newPassword') {
            setPasswordStrength(validatePasswordStrength(value));
        }

        if (error) setError('');
    };

    // Validar email
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Enviar email de recuperação usando o serviço
    const sendResetEmail = async (email) => {
        setIsLoading(true);
        setError('');

        try {
            const result = await passwordResetService.sendResetEmail(email);

            if (result.success) {
                // Salvar token para demonstração
                localStorage.setItem('resetToken', result.token);

                setSuccess('Link de recuperação enviado com sucesso!');
                setStep('success');
            }
        } catch (err) {
            setError(err.message || 'Erro ao enviar e-mail. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Redefinir senha usando o serviço
    const resetPassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (passwordStrength < 3) {
            setError('A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('resetToken');
            if (!token) {
                throw new Error('Token de redefinição não encontrado');
            }

            const result = await passwordResetService.resetPassword(token, formData.newPassword);

            if (result.success) {
                setSuccess('Senha redefinida com sucesso!');

                // Limpar token
                localStorage.removeItem('resetToken');

                // Redirecionar para login após 2 segundos
                setTimeout(() => {
                    onClose();
                    setStep('email');
                    setFormData({ email: '', newPassword: '', confirmPassword: '' });
                }, 2000);
            }

        } catch (err) {
            setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Manipular envio do formulário
    const handleSubmit = (e) => {
        e.preventDefault();

        if (step === 'email') {
            if (!validateEmail(formData.email)) {
                setError('Por favor, digite um e-mail válido.');
                return;
            }
            sendResetEmail(formData.email);
        } else if (step === 'reset') {
            resetPassword();
        }
    };

    // Fechar modal
    const handleClose = () => {
        onClose();
        setStep('email');
        setFormData({ email: '', newPassword: '', confirmPassword: '' });
        setError('');
        setSuccess('');
    };

    // Ir para página de redefinição
    const goToResetPage = () => {
        setStep('reset');
        setError('');
        setSuccess('');
    };

    // Voltar para email
    const goBackToEmail = () => {
        setStep('email');
        setError('');
        setSuccess('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {step === 'email' && 'Recuperar Senha'}
                                    {step === 'success' && 'E-mail Enviado'}
                                    {step === 'reset' && 'Nova Senha'}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {step === 'email' && 'Digite seu e-mail para receber o link de recuperação'}
                                    {step === 'success' && 'Verifique sua caixa de entrada'}
                                    {step === 'reset' && 'Defina uma nova senha segura'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Step 1: Email */}
                            {step === 'email' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            E-mail cadastrado
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="seu@email.com"
                                                disabled={isLoading}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Mensagens de feedback */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                            >
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                                <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Botão Enviar */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin-custom" />
                                                Enviando...
                                            </>
                                        ) : (
                                            'Enviar Link de Recuperação'
                                        )}
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* Step 2: Success */}
                            {step === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-6"
                                >
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            E-mail Enviado!
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Enviamos um link de recuperação para <strong>{formData.email}</strong>
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            Verifique sua caixa de entrada e spam. O link expira em 15 minutos.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={goToResetPage}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-300"
                                        >
                                            Continuar para Redefinição
                                        </motion.button>

                                        <button
                                            onClick={goBackToEmail}
                                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            <span>Voltar</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Reset Password */}
                            {step === 'reset' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Nova Senha
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Digite sua nova senha"
                                                disabled={isLoading}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                                ) : (
                                                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Indicador de força da senha */}
                                        {formData.newPassword && (
                                            <div className="space-y-2">
                                                <div className="flex space-x-1">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-1 flex-1 rounded ${level <= passwordStrength
                                                                    ? passwordStrength <= 2
                                                                        ? 'bg-red-500'
                                                                        : passwordStrength <= 3
                                                                            ? 'bg-yellow-500'
                                                                            : 'bg-green-500'
                                                                    : 'bg-gray-200 dark:bg-gray-600'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {passwordStrength <= 2 && 'Senha fraca'}
                                                    {passwordStrength === 3 && 'Senha média'}
                                                    {passwordStrength >= 4 && 'Senha forte'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Confirmar Nova Senha
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Confirme sua nova senha"
                                                disabled={isLoading}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                                ) : (
                                                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mensagens de feedback */}
                                    <AnimatePresence>
                                        {(error || success) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className={`flex items-center space-x-2 p-3 rounded-lg border ${success
                                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                    }`}
                                            >
                                                {success ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                                )}
                                                <span className={`text-sm ${success
                                                        ? 'text-green-700 dark:text-green-400'
                                                        : 'text-red-700 dark:text-red-400'
                                                    }`}>
                                                    {success || error}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Botões */}
                                    <div className="space-y-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin-custom" />
                                                    Atualizando...
                                                </>
                                            ) : (
                                                'Atualizar Senha'
                                            )}
                                        </motion.button>

                                        <button
                                            onClick={goBackToEmail}
                                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            <span>Voltar</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ForgotPasswordModal;
