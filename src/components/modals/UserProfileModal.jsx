import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Edit,
    Save,
    X,
    Camera,
    Key,
    Eye,
    EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const UserProfileModal = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        department: '',
        position: '',
        hireDate: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Carregar dados do usuário
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                department: user.department || 'Tecnologia da Informação',
                position: user.position || 'Administrador',
                hireDate: user.hireDate || '2024-01-01',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            // Validações básicas
            if (!formData.name.trim()) {
                toast.error('Nome é obrigatório');
                return;
            }

            if (!formData.email.trim()) {
                toast.error('E-mail é obrigatório');
                return;
            }

            // Validação de senha se estiver alterando
            if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
                toast.error('Senhas não coincidem');
                return;
            }

            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Perfil atualizado com sucesso!', {
                duration: 3000,
                icon: '✅'
            });

            setIsEditing(false);
        } catch (error) {
            toast.error('Erro ao atualizar perfil');
        }
    };

    const handleCancel = () => {
        // Restaurar dados originais
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                department: user.department || 'Tecnologia da Informação',
                position: user.position || 'Administrador',
                hireDate: user.hireDate || '2024-01-01',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
        setIsEditing(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence key="user-profile-presence">
            <motion.div
                key="user-profile-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    key="user-profile-modal"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                    className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Perfil do Usuário</h2>
                                    <p className="text-sm text-gray-400">Gerencie suas informações pessoais</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {isEditing ? (
                                    <>
                                        <motion.button
                                            onClick={handleCancel}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                            title="Cancelar"
                                        >
                                            <X className="w-5 h-5 text-gray-400" />
                                        </motion.button>
                                        <motion.button
                                            onClick={handleSave}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                            title="Salvar"
                                        >
                                            <Save className="w-5 h-5 text-white" />
                                        </motion.button>
                                    </>
                                ) : (
                                    <motion.button
                                        onClick={() => setIsEditing(true)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        title="Editar perfil"
                                    >
                                        <Edit className="w-5 h-5 text-white" />
                                    </motion.button>
                                )}
                                <motion.button
                                    onClick={onClose}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    title="Fechar"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Foto do Perfil */}
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                                    <User className="w-10 h-10 text-gray-400" />
                                </div>
                                {isEditing && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                        title="Alterar foto"
                                    >
                                        <Camera className="w-4 h-4 text-white" />
                                    </motion.button>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{formData.name}</h3>
                                <p className="text-gray-400">{formData.position}</p>
                                <p className="text-sm text-gray-500">{formData.department}</p>
                            </div>
                        </div>

                        {/* Informações Pessoais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="(11) 99999-9999"
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Departamento
                                </label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed"
                                >
                                    <option value="Tecnologia da Informação">Tecnologia da Informação</option>
                                    <option value="Recursos Humanos">Recursos Humanos</option>
                                    <option value="Administração">Administração</option>
                                    <option value="Financeiro">Financeiro</option>
                                    <option value="Comercial">Comercial</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Cargo
                                </label>
                                <input
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Data de Admissão
                                </label>
                                <input
                                    type="date"
                                    name="hireDate"
                                    value={formData.hireDate}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Endereço */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Endereço
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                rows={3}
                                placeholder="Rua, número, bairro, cidade, estado"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed resize-none"
                            />
                        </div>

                        {/* Alteração de Senha */}
                        {isEditing && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                            >
                                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <Key className="w-5 h-5 mr-2" />
                                    Alterar Senha
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Senha Atual
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                autoComplete="current-password"
                                                className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nova Senha
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            autoComplete="new-password"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Confirmar Nova Senha
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            autoComplete="new-password"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Informações de Segurança */}
                        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800/30">
                            <h4 className="text-lg font-semibold text-blue-300 mb-2 flex items-center">
                                <Shield className="w-5 h-5 mr-2" />
                                Informações de Segurança
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-400">Último acesso:</span>
                                    <span className="text-blue-300 ml-2">{new Date().toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-blue-400">Status da conta:</span>
                                    <span className="text-green-400 ml-2">Ativa</span>
                                </div>
                                <div>
                                    <span className="text-blue-400">Permissões:</span>
                                    <span className="text-blue-300 ml-2">Administrador</span>
                                </div>
                                <div>
                                    <span className="text-blue-400">Sessão ativa:</span>
                                    <span className="text-green-400 ml-2">Sim</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UserProfileModal;
