import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Building,
    UserCheck,
    AlertCircle,
    CheckCircle,
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUsers } from '../../hooks/useRealData';
import { departmentService } from '../../services/api';
import { validationUtils } from '../../utils/validationUtils';
import { useAuth } from '../../contexts/AuthContext';
import userLogsService from '../../services/userLogsService';
import LoginGeneratedModal from './LoginGeneratedModal';

const NewUserModal = ({ isOpen, onClose, onUserCreated }) => {
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        role: 'employee',
        workStartTime: '08:00',
        workEndTime: '17:00'
    });

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [validationStates, setValidationStates] = useState({
        cpf: { isValid: null, message: '' },
        email: { isValid: null, message: '' }
    });
    const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });

    // Estados para o modal de login gerado
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [generatedLogin, setGeneratedLogin] = useState('');
    const [createdUserName, setCreatedUserName] = useState('');
    const [createdUserEmail, setCreatedUserEmail] = useState('');
    const [createdUserPassword, setCreatedUserPassword] = useState('');

    const { createUser } = useUsers();

    const loadDepartments = async () => {
        try {
            const result = await departmentService.getDepartments();
            if (result.success) {
                setDepartments(result.data || []);
            } else {
                console.error('Erro ao carregar departamentos:', result.error);
                setDepartments([]);
            }
        } catch (error) {
            console.error('Erro ao carregar departamentos:', error);
            setDepartments([]);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadDepartments();
        }
    }, [isOpen]);

    const generateLogin = (name) => {
        if (!name) return '';

        const normalizedName = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z\s]/g, '')
            .trim();

        const nameParts = normalizedName.split(' ').filter(part => part.length > 0);

        if (nameParts.length === 0) return '';
        if (nameParts.length === 1) return nameParts[0];

        return `${nameParts[0]}.${nameParts[nameParts.length - 1]}`;
    };

    const handleInputChange = (field, value) => {
        let processedValue = value;

        if (field === 'cpf') {
            processedValue = validationUtils.formatCPF(value);
        }

        setFormData(prev => ({
            ...prev,
            [field]: processedValue
        }));

        // Limpar erro quando usuário começar a digitar
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }

        // Validação em tempo real para CPF e email
        if (field === 'cpf' && processedValue.length >= 11) {
            const isValid = validationUtils.validateCPF(processedValue);
            setValidationStates(prev => ({
                ...prev,
                cpf: {
                    isValid,
                    message: isValid ? 'CPF válido' : 'CPF inválido'
                }
            }));
        }

        if (field === 'email' && processedValue.length > 0) {
            const isValid = validationUtils.validateEmail(processedValue);
            setValidationStates(prev => ({
                ...prev,
                email: {
                    isValid,
                    message: isValid ? 'E-mail válido' : 'E-mail inválido'
                }
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.cpf.trim()) {
            newErrors.cpf = 'CPF é obrigatório';
        } else if (!validationUtils.validateCPF(formData.cpf)) {
            newErrors.cpf = 'CPF inválido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!validationUtils.validateEmail(formData.email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (!formData.position.trim()) {
            newErrors.position = 'Cargo é obrigatório';
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
            return;
        }

        setLoading(true);

        try {
            const employeeData = {
                ...formData,
                registration: `EMP${Date.now()}`,
                status: true,
                createdAt: new Date().toISOString()
            };

            const result = await createUser(employeeData);

            if (result.success) {
                // Gerar login automaticamente
                const login = generateLogin(formData.name);

                // Definir estados para o modal de login
                setGeneratedLogin(login);
                setCreatedUserName(formData.name);
                setCreatedUserEmail(formData.email);
                setCreatedUserPassword('Temp123!'); // Senha temporária

                // Mostrar modal de login gerado
                setShowLoginModal(true);

                // Registrar log de criação
                try {
                    await userLogsService.saveCreationLog(
                        result.data,
                        currentUser?.id || 'admin',
                        currentUser?.name || 'Administrador',
                        'success'
                    );
                } catch (logError) {
                    console.error('Erro ao salvar log de criação:', logError);
                }

                // Trigger de notificação para novo usuário
                try {
                    const notificationTriggers = (await import('../../services/notificationTriggers')).default;
                    await notificationTriggers.onNovaContaCriada(
                        result.data,
                        'Temp123!', // Senha temporária gerada
                        currentUser || { id: 'admin', name: 'Administrador' }
                    );
                } catch (notifError) {
                    console.error('Erro ao disparar notificação de nova conta:', notifError);
                }

                toast.success('Colaborador criado com sucesso!', {
                    icon: '✅',
                    style: {
                        background: '#10B981',
                        color: '#fff'
                    }
                });

                if (onUserCreated) {
                    onUserCreated(result.data);
                }

                // Limpar formulário
                setFormData({
                    name: '',
                    cpf: '',
                    email: '',
                    phone: '',
                    position: '',
                    department: '',
                    role: 'employee',
                    workStartTime: '08:00',
                    workEndTime: '17:00'
                });
                setErrors({});
                setValidationStates({
                    cpf: { isValid: null, message: '' },
                    email: { isValid: null, message: '' }
                });

            } else {
                throw new Error(result.message || 'Erro ao criar colaborador');
            }

        } catch (error) {
            console.error('Erro ao criar colaborador:', error);
            toast.error('Erro ao criar colaborador', {
                icon: '❌',
                style: {
                    background: '#EF4444',
                    color: '#fff'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            cpf: '',
            email: '',
            phone: '',
            position: '',
            department: '',
            role: 'employee',
            workStartTime: '08:00',
            workEndTime: '17:00'
        });
        setErrors({});
        setValidationStates({
            cpf: { isValid: null, message: '' },
            email: { isValid: null, message: '' }
        });
        setShowPasswords({ new: false, confirm: false });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="new-user-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-600/20 rounded-lg">
                                <UserCheck className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Novo Colaborador
                                </h2>
                                <p className="text-sm text-gray-400">
                                    Cadastre um novo colaborador no sistema
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

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Informações Pessoais */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-400" />
                                    Informações Pessoais
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                            placeholder="Digite o nome completo"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            CPF *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.cpf}
                                                onChange={(e) => handleInputChange('cpf', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                            />
                                            {validationStates.cpf.isValid !== null && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    {validationStates.cpf.isValid ? (
                                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {errors.cpf && (
                                            <p className="mt-1 text-sm text-red-400">{errors.cpf}</p>
                                        )}
                                        {validationStates.cpf.message && (
                                            <p className={`mt-1 text-sm ${validationStates.cpf.isValid ? 'text-green-400' : 'text-red-400'}`}>
                                                {validationStates.cpf.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            E-mail *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                                placeholder="email@empresa.com"
                                            />
                                            {validationStates.email.isValid !== null && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    {validationStates.email.isValid ? (
                                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                                        )}
                                        {validationStates.email.message && (
                                            <p className={`mt-1 text-sm ${validationStates.email.isValid ? 'text-green-400' : 'text-red-400'}`}>
                                                {validationStates.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Telefone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Informações Profissionais */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center">
                                    <Building className="w-5 h-5 mr-2 text-purple-400" />
                                    Informações Profissionais
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Cargo *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.position}
                                            onChange={(e) => handleInputChange('position', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                            placeholder="Ex: Desenvolvedor"
                                        />
                                        {errors.position && (
                                            <p className="mt-1 text-sm text-red-400">{errors.position}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Departamento *
                                        </label>
                                        <select
                                            value={formData.department}
                                            onChange={(e) => handleInputChange('department', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="">Selecione um departamento</option>
                                            {Array.isArray(departments) && departments.map((dept) => (
                                                <option key={dept.id} value={dept.name}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.department && (
                                            <p className="mt-1 text-sm text-red-400">{errors.department}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Perfil
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => handleInputChange('role', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="employee">Colaborador</option>
                                            <option value="manager">Gerente</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Horário de Trabalho */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-orange-400" />
                                    Horário de Trabalho
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Horário de Entrada
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.workStartTime}
                                            onChange={(e) => handleInputChange('workStartTime', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Horário de Saída
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.workEndTime}
                                            onChange={(e) => handleInputChange('workEndTime', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Criando...
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            Criar Colaborador
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>

            {/* Modal de Login Gerado */}
            <LoginGeneratedModal
                isOpen={showLoginModal}
                onClose={() => {
                    setShowLoginModal(false);
                    setTimeout(() => {
                        handleClose();
                    }, 300);
                }}
                userLogin={generatedLogin}
                userName={createdUserName}
                userEmail={createdUserEmail}
                userPassword={createdUserPassword}
            />
        </AnimatePresence>
    );
};

export default NewUserModal;