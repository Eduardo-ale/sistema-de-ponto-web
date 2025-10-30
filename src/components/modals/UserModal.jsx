import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Shield,
    UserCheck,
    Building
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserModal = ({ isOpen, onClose, user = null, mode = 'create' }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
        role: user?.role || 'Colaborador',
        department: user?.department || '',
        status: user?.status || 'Ativo'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const roles = [
        { value: 'Administrador', label: 'Administrador', icon: Shield },
        { value: 'RH', label: 'Recursos Humanos', icon: UserCheck },
        { value: 'Gestor', label: 'Gestor de Unidade', icon: Building },
        { value: 'Colaborador', label: 'Colaborador', icon: User }
    ];

    const departments = [
        'TI', 'RH', 'Financeiro', 'Vendas', 'Marketing', 'Produção', 'Qualidade', 'Administrativo'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (mode === 'create' || formData.password) {
            if (!formData.password) {
                newErrors.password = 'Senha é obrigatória';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Senhas não coincidem';
            }
        }

        if (!formData.department) {
            newErrors.department = 'Departamento é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Por favor, corrija os erros no formulário');
            return;
        }

        setIsLoading(true);

        try {
            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (mode === 'create') {
                toast.success('Usuário criado com sucesso!');
            } else {
                toast.success('Usuário atualizado com sucesso!');
            }

            onClose();
        } catch (error) {
            toast.error('Erro ao salvar usuário');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'Colaborador',
            department: '',
            status: 'Ativo'
        });
        setErrors({});
        onClose();
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
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {mode === 'create' ? 'Preencha os dados para criar um novo usuário' : 'Atualize as informações do usuário'}
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nome */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nome Completo *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder="Digite o nome completo"
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.name}</span>
                                    </p>
                                )}
                            </div>

                            {/* E-mail */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    E-mail *
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
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder="usuario@empresa.com"
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.email}</span>
                                    </p>
                                )}
                            </div>

                            {/* Senha */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Senha {mode === 'create' && '*'}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder={mode === 'create' ? 'Digite a senha' : 'Deixe em branco para manter a atual'}
                                        disabled={isLoading}
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
                                {errors.password && (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.password}</span>
                                    </p>
                                )}
                            </div>

                            {/* Confirmar Senha */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirmar Senha {mode === 'create' && '*'}
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
                                        className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder="Confirme a senha"
                                        disabled={isLoading}
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
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.confirmPassword}</span>
                                    </p>
                                )}
                            </div>

                            {/* Perfil */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Perfil *
                                </label>
                                <div className="relative">
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={isLoading}
                                    >
                                        {roles.map((role) => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Departamento */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Departamento *
                                </label>
                                <div className="relative">
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.department ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        disabled={isLoading}
                                    >
                                        <option value="">Selecione um departamento</option>
                                        {departments.map((dept) => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.department && (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.department}</span>
                                    </p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="Ativo"
                                            checked={formData.status === 'Ativo'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-900 dark:text-white">Ativo</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="Inativo"
                                            checked={formData.status === 'Inativo'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-900 dark:text-white">Inativo</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Salvando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>{mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UserModal;






