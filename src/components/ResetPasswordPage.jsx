import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Loader2,
    Shield,
    ArrowLeft,
    Clock
} from 'lucide-react';
import passwordResetService from '../services/passwordResetService';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isValidToken, setIsValidToken] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Carregar preferência de modo escuro
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Validar token na inicialização usando o serviço
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setIsValidToken(false);
                return;
            }

            try {
                const validation = passwordResetService.validateToken(token);
                if (!validation.valid) {
                    setIsValidToken(false);
                }
            } catch (err) {
                setIsValidToken(false);
            }
        };

        validateToken();
    }, [token]);

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
            const result = await passwordResetService.resetPassword(token, formData.newPassword);

            if (result.success) {
                setSuccess('Senha redefinida com sucesso!');

                // Redirecionar para login após 2 segundos
                setTimeout(() => {
                    navigate('/login');
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
        resetPassword();
    };

    // Voltar para login
    const goToLogin = () => {
        navigate('/login');
    };

    // Se o token não for válido
    if (!isValidToken) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center"
                >
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Token Inválido ou Expirado
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        O link de recuperação de senha é inválido ou expirou.
                        Solicite um novo link de recuperação.
                    </p>

                    <div className="space-y-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={goToLogin}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        >
                            Voltar ao Login
                        </motion.button>

                        <button
                            onClick={goToLogin}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Solicitar Novo Link</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Redefinir Senha
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Defina uma nova senha segura
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Token válido por 15 minutos</span>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nova Senha */}
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

                        {/* Confirmar Senha */}
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
                        {(error || success) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
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
                                onClick={goToLogin}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Voltar ao Login</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Rodapé */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                        <p>Sistema de Ponto Web v2.0.0</p>
                        <p>&copy; 2024 Todos os direitos reservados</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
