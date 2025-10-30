import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Eye, EyeOff, Building2, Shield, CheckCircle, Clock, Calendar, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useUsers } from '../../hooks/useRealData';
import { departmentService } from '../../services/api';
import validationUtils from '../../utils/validationUtils';

const EditUserModal = ({ isOpen, onClose, user }) => {
    const { actions: { updateUser } } = useUsers();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        position: '',
        department: '',
        profile: 'colaborador',
        status: 'Ativo',
        entryTime: '',
        exitTime: '',
        workSchedule: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [emailChecking, setEmailChecking] = useState(false);

    // Opções para perfis
    const profileOptions = [
        { value: 'admin', label: 'Administrador' },
        { value: 'colaborador', label: 'Colaborador' },
        { value: 'rh', label: 'Recursos Humanos' },
        { value: 'gestor', label: 'Gestor' }
    ];

    // Opções para escalas de trabalho
    const workScheduleOptions = [
        { value: '08h-17h', label: '08h às 17h (Padrão)' },
        { value: '06h-14h', label: '06h às 14h' },
        { value: '14h-22h', label: '14h às 22h' },
        { value: '22h-06h', label: '22h às 06h (Noturno)' },
        { value: 'flexivel', label: 'Horário Flexível' }
    ];

    // Opções para status
    const statusOptions = [
        { value: 'Ativo', label: 'Ativo' },
        { value: 'Inativo', label: 'Inativo' }
    ];

    // Carregar dados do usuário quando o modal abrir
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                position: user.position || '',
                department: user.department || '',
                profile: user.profile || 'colaborador',
                status: user.status || 'Ativo',
                entryTime: user.entryTime || '',
                exitTime: user.exitTime || '',
                workSchedule: user.workSchedule || ''
            });
            setErrors({});
        }
    }, [isOpen, user]);

    // Carregar departamentos
    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const result = await departmentService.getDepartments();
                if (result.success) {
                    setDepartments(result.data);
                }
            } catch (error) {
                console.error('Erro ao carregar departamentos:', error);
            }
        };

        if (isOpen) {
            loadDepartments();
        }
    }, [isOpen]);

    // Validação de email
    const handleEmailBlur = async () => {
        if (formData.email && !errors.email && formData.email !== user.email) {
            setEmailChecking(true);
            try {
                // Verificar se email já existe nos usuários cadastrados
                const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
                const emailExists = existingUsers.some(u => u.email === formData.email && u.id !== user.id);
                const result = { success: true, exists: emailExists };

                if (result.success && result.exists) {
                    setErrors(prev => ({
                        ...prev,
                        email: 'E-mail já está em uso'
                    }));
                } else {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.email;
                        return newErrors;
                    });
                }
            } catch (error) {
                console.error('Erro ao verificar email:', error);
            } finally {
                setEmailChecking(false);
            }
        }
    };

    // Validação do formulário
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

        if (!formData.position.trim()) {
            newErrors.position = 'Cargo é obrigatório';
        }

        if (!formData.department) {
            newErrors.department = 'Departamento é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Função de submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Por favor, corrija os erros no formulário');
            return;
        }

        setLoading(true);

        try {
            const userData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                position: formData.position.trim(),
                department: formData.department,
                profile: formData.profile,
                status: formData.status,
                entryTime: formData.entryTime,
                exitTime: formData.exitTime,
                workSchedule: formData.workSchedule
            };

            const result = await updateUser({ id: user.id, userData });

            if (result.success) {
                toast.success('✅ Usuário atualizado com sucesso!', {
                    duration: 4000,
                    style: {
                        background: '#10B981',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });
                onClose();
            } else {
                toast.error(result.error || 'Erro ao atualizar usuário');
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            toast.error('Erro interno do servidor');
        } finally {
            setLoading(false);
        }
    };

    // Função para atualizar campos
    const handleInputChange = (field, value) => {
        let formattedValue = value;

        // Aplicar máscara de CPF
        if (field === 'cpf') {
            formattedValue = validationUtils.formatCPF(value);
            // Limitar a 14 caracteres (com máscara)
            if (formattedValue.length > 14) {
                formattedValue = formattedValue.substring(0, 14);
            }
        }

        setFormData(prev => ({ ...prev, [field]: formattedValue }));

        // Limpar erro do campo quando usuário começar a digitar
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Validação em tempo real para CPF e email
        if (field === 'cpf' && formattedValue.length >= 11) {
            const cpfValidation = validationUtils.validateCPF(formattedValue);
            if (!cpfValidation.valid) {
                setErrors(prev => ({ ...prev, cpf: cpfValidation.message }));
            } else {
                const cpfCheck = validationUtils.checkDuplicateData('cpf', formattedValue, user.id);
                if (cpfCheck.exists) {
                    setErrors(prev => ({ ...prev, cpf: 'CPF já cadastrado' }));
                }
            }
        } else if (field === 'email' && formattedValue) {
            const emailValidation = validationUtils.validateEmail(formattedValue);
            if (!emailValidation.valid) {
                setErrors(prev => ({ ...prev, email: emailValidation.message }));
            } else {
                const emailCheck = validationUtils.checkDuplicateData('email', formattedValue, user.id);
                if (emailCheck.exists) {
                    setErrors(prev => ({ ...prev, email: 'E-mail já cadastrado' }));
                }
            }
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
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Editar Usuário
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Atualize as informações do colaborador
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
                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                <div className="space-y-6">
                                    {/* Informações Básicas */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                            <User className="w-5 h-5 mr-2 text-blue-500" />
                                            Informações Básicas
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Input
                                                    label="Nome Completo"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    error={errors.name}
                                                    placeholder="Digite o nome completo"
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    label="E-mail Corporativo"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    onBlur={handleEmailBlur}
                                                    error={errors.email}
                                                    placeholder="usuario@empresa.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informações Profissionais */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                            <Briefcase className="w-5 h-5 mr-2 text-green-500" />
                                            Informações Profissionais
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Input
                                                    label="Cargo"
                                                    type="text"
                                                    value={formData.position}
                                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                                    error={errors.position}
                                                    placeholder="Digite o cargo"
                                                />
                                            </div>
                                            <div>
                                                <Select
                                                    label="Setor/Departamento"
                                                    value={formData.department}
                                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                                    error={errors.department}
                                                    placeholder="Selecione o departamento"
                                                    options={departments.map(dept => ({
                                                        value: dept.name,
                                                        label: dept.name
                                                    }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Select
                                                    label="Perfil de Acesso"
                                                    value={formData.profile}
                                                    onChange={(e) => handleInputChange('profile', e.target.value)}
                                                    options={profileOptions}
                                                />
                                            </div>
                                            <div>
                                                <Select
                                                    label="Status"
                                                    value={formData.status}
                                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                                    options={statusOptions}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Horários de Trabalho */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                            <Clock className="w-5 h-5 mr-2 text-orange-500" />
                                            Horários de Trabalho
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Input
                                                    label="Hora de Entrada"
                                                    type="time"
                                                    value={formData.entryTime}
                                                    onChange={(e) => handleInputChange('entryTime', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    label="Hora de Saída"
                                                    type="time"
                                                    value={formData.exitTime}
                                                    onChange={(e) => handleInputChange('exitTime', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Select
                                                    label="Escala de Trabalho"
                                                    value={formData.workSchedule}
                                                    onChange={(e) => handleInputChange('workSchedule', e.target.value)}
                                                    options={workScheduleOptions}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Editando usuário: {user.name}
                                </div>
                                <div className="flex items-center space-x-3">
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
                                        type="submit"
                                        onClick={handleSubmit}
                                        className="px-6 bg-green-600 hover:bg-green-700 text-white"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Salvar Alterações
                                            </>
                                        )}
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

export default EditUserModal;