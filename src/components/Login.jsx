import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    Sun,
    Moon,
    AlertCircle,
    CheckCircle,
    Loader2,
    Clock,
    Building2,
    Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import './Login.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [focusedField, setFocusedField] = useState('');
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

    // Carregar preferência de modo escuro do localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Alternar modo escuro
    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Manipular mudanças nos campos
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpar mensagens de erro ao digitar
        if (error) setError('');
    };

    // Validação do formulário
    const validateForm = () => {
        if (!formData.email.trim()) {
            setError('Por favor, digite seu email');
            return false;
        }
        if (!formData.password.trim()) {
            setError('Por favor, digite sua senha');
            return false;
        }
        return true;
    };

    // Mapear credenciais simples para emails do sistema
    const mapCredentials = (username, password) => {
        const credentialMap = {
            'admin': { email: 'admin@sistema.com', password: 'admin123' },
            'colaborador': { email: 'colaborador@sistema.com', password: 'colab123' },
            'rh': { email: 'rh@sistema.com', password: 'rh123' }
        };

        // Se for um email válido, usar diretamente
        if (username.includes('@')) {
            return { email: username, password };
        }

        // Se for um nome de usuário simples, mapear
        const mapped = credentialMap[username.toLowerCase()];
        if (mapped) {
            return mapped;
        }

        return { email: username, password };
    };

    // Manipular envio do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Mapear credenciais para o formato correto
            const credentials = mapCredentials(formData.email, formData.password);

            // Usar o sistema de autenticação integrado
            const result = await login(credentials);

            if (result.success) {
                setSuccess('Login realizado com sucesso!');

                // Redirecionar baseado no tipo de usuário usando React Router
                setTimeout(() => {
                    const redirectPath = {
                        'admin': '/admin-dashboard',
                        'colaborador': '/user-dashboard',
                        'rh': '/hr-dashboard'
                    }[result.user.role];

                    navigate(redirectPath);
                }, 1500);

            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            {/* Lado esquerdo - Formulário */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24"
            >
                {/* Header */}
                <div className="mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between mb-6"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Sistema de Ponto
                            </h1>
                        </div>

                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Bem-vindo de volta
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Faça login para acessar seu painel de controle
                        </p>
                    </motion.div>
                </div>

                {/* Formulário */}
                <motion.form
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Campo Email/Usuário */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email ou Usuário
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User
                                    className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'email'
                                        ? 'text-blue-600'
                                        : 'text-gray-400'
                                        }`}
                                />
                            </div>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField('')}
                                className="input-focus w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Digite seu email ou usuário"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Campo Senha */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Senha
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock
                                    className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'password'
                                        ? 'text-blue-600'
                                        : 'text-gray-400'
                                        }`}
                                />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField('')}
                                className="input-focus w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Digite sua senha"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                )}
                            </button>
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

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                            >
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-green-700 dark:text-green-400 text-sm">{success}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Botão de Login */}
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
                                Entrando...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </motion.button>

                    {/* Link Esqueci Senha */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setShowForgotPasswordModal(true)}
                            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300 hover:underline"
                            disabled={isLoading}
                        >
                            Esqueci minha senha
                        </button>
                    </div>
                </motion.form>

                {/* Credenciais de demonstração */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                >
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Credenciais de demonstração:
                    </h3>
                    <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                        <div>Admin: <span className="font-mono">admin / admin123</span></div>
                        <div>Colaborador: <span className="font-mono">colaborador / colab123</span></div>
                        <div>RH: <span className="font-mono">rh / rh123</span></div>
                    </div>
                </motion.div>

                {/* Rodapé */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400"
                >
                    <p>Sistema de Ponto Web v2.0.0</p>
                    <p>&copy; 2024 Todos os direitos reservados</p>
                </motion.div>
            </motion.div>

            {/* Lado direito - Imagem ilustrativa */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden"
            >
                {/* Elementos decorativos */}
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Ícones flutuantes */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-20 left-20 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                    <Building2 className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute top-40 right-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                    <Users className="w-6 h-6 text-white" />
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, -15, 0],
                        rotate: [0, 3, 0]
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-40 left-16 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                    <Clock className="w-7 h-7 text-white" />
                </motion.div>

                {/* Conteúdo central */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center text-white p-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mb-8"
                    >
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-6">
                            <Clock className="w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4">
                            Controle de Ponto
                        </h2>
                        <p className="text-xl text-white/90 max-w-md">
                            Gerencie a jornada de trabalho da sua equipe com tecnologia moderna e interface intuitiva
                        </p>
                    </motion.div>

                    {/* Cards de funcionalidades */}
                    <div className="grid grid-cols-1 gap-4 max-w-md">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                        >
                            <h3 className="font-semibold mb-2">Registro Automático</h3>
                            <p className="text-sm text-white/80">Controle preciso de entrada e saída</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                        >
                            <h3 className="font-semibold mb-2">Relatórios Detalhados</h3>
                            <p className="text-sm text-white/80">Análises completas de produtividade</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4 }}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                        >
                            <h3 className="font-semibold mb-2">Acesso Seguro</h3>
                            <p className="text-sm text-white/80">Autenticação robusta e dados protegidos</p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Modal de Recuperação de Senha */}
            <ForgotPasswordModal
                isOpen={showForgotPasswordModal}
                onClose={() => setShowForgotPasswordModal(false)}
            />
        </div>
    );
};

export default Login;
