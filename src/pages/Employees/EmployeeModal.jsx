import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Building2, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { employeeService } from '../../services/api';

const EmployeeModal = ({ isOpen, onClose, employee, mode, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        registration: '',
        position: '',
        department: '',
        email: '',
        phone: '',
        role: 'employee',
        status: true,
        workStartTime: '08:00',
        workEndTime: '17:00',
        workSchedule: '08h-17h'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);

    // Opções para perfis
    const roleOptions = [
        { value: 'employee', label: 'Colaborador' },
        { value: 'manager', label: 'Gestor' },
        { value: 'rh', label: 'RH' },
        { value: 'admin', label: 'Administrador' }
    ];

    // Opções para escalas
    const scheduleOptions = [
        { value: '08h-17h', label: '08h às 17h' },
        { value: '12x36', label: '12x36' },
        { value: '6h-diarias', label: '6h diárias' },
        { value: 'custom', label: 'Personalizada' }
    ];

    // Carregar departamentos
    useEffect(() => {
        if (isOpen) {
            loadDepartments();
        }
    }, [isOpen]);

    // Preencher formulário se estiver editando
    useEffect(() => {
        if (employee && mode !== 'create') {
            setFormData({
                name: employee.name || '',
                cpf: employee.cpf || '',
                registration: employee.registration || '',
                position: employee.position || '',
                department: employee.department || '',
                email: employee.email || '',
                phone: employee.phone || '',
                role: employee.role || 'employee',
                status: employee.status !== undefined ? employee.status : true,
                workStartTime: employee.workStartTime || '08:00',
                workEndTime: employee.workEndTime || '17:00',
                workSchedule: employee.workSchedule || '08h-17h'
            });
        } else {
            // Limpar formulário para criação
            setFormData({
                name: '',
                cpf: '',
                registration: '',
                position: '',
                department: '',
                email: '',
                phone: '',
                role: 'employee',
                status: true,
                workStartTime: '08:00',
                workEndTime: '17:00',
                workSchedule: '08h-17h'
            });
        }
        setErrors({});
    }, [employee, mode, isOpen]);

    const loadDepartments = async () => {
        try {
            const result = await employeeService.getDepartments();
            if (result.success) {
                setDepartments(result.data.map(dept => ({
                    value: dept.name,
                    label: dept.name
                })));
            }
        } catch (error) {
            console.error('Erro ao carregar departamentos:', error);
        }
    };

    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = 'Nome é obrigatório';
                } else if (value.trim().length < 2) {
                    newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
                } else {
                    delete newErrors.name;
                }
                break;

            case 'cpf':
                if (!value.trim()) {
                    newErrors.cpf = 'CPF é obrigatório';
                } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) {
                    newErrors.cpf = 'CPF deve estar no formato 000.000.000-00';
                } else {
                    delete newErrors.cpf;
                }
                break;

            case 'registration':
                if (!value.trim()) {
                    newErrors.registration = 'Matrícula é obrigatória';
                } else {
                    delete newErrors.registration;
                }
                break;

            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'E-mail é obrigatório';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = 'E-mail inválido';
                } else {
                    delete newErrors.email;
                }
                break;

            case 'position':
                if (!value.trim()) {
                    newErrors.position = 'Cargo é obrigatório';
                } else {
                    delete newErrors.position;
                }
                break;

            case 'department':
                if (!value.trim()) {
                    newErrors.department = 'Departamento é obrigatório';
                } else {
                    delete newErrors.department;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validação em tempo real
        validateField(name, value);
    };

    const formatCPF = (value) => {
        // Remove tudo que não é dígito
        const numbers = value.replace(/\D/g, '');

        // Aplica a máscara
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }

        return value;
    };

    const handleCPFChange = (e) => {
        const formatted = formatCPF(e.target.value);
        setFormData(prev => ({
            ...prev,
            cpf: formatted
        }));

        validateField('cpf', formatted);
    };

    const validateForm = () => {
        const requiredFields = ['name', 'cpf', 'registration', 'email', 'position', 'department'];
        const newErrors = {};

        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} é obrigatório`;
            }
        });

        // Validações específicas
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (formData.cpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
            newErrors.cpf = 'CPF deve estar no formato 000.000.000-00';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === 'view') {
            onClose();
            return;
        }

        if (!validateForm()) {
            toast.error('Por favor, corrija os erros no formulário');
            return;
        }

        setLoading(true);

        try {
            const employeeData = {
                name: formData.name.trim(),
                cpf: formData.cpf.trim(),
                registration: formData.registration.trim(),
                position: formData.position.trim(),
                department: formData.department.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                role: formData.role,
                status: formData.status,
                workStartTime: formData.workStartTime,
                workEndTime: formData.workEndTime,
                workSchedule: formData.workSchedule
            };

            let result;
            if (mode === 'create') {
                result = await employeeService.createEmployee(employeeData);
            } else {
                result = await employeeService.updateEmployee(employee.id, employeeData);
            }

            if (result.success) {
                toast.success(`✅ Colaborador ${mode === 'create' ? 'criado' : 'atualizado'} com sucesso!`);
                onSuccess(result.data);
            } else {
                toast.error(`❌ ${result.error}`);
            }
        } catch (error) {
            toast.error('❌ Erro interno do servidor');
            console.error('Erro ao salvar colaborador:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    const isReadOnly = mode === 'view';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onKeyDown={handleKeyDown}
                    tabIndex={-1}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {mode === 'create' ? 'Novo Colaborador' :
                                            mode === 'edit' ? 'Editar Colaborador' :
                                                'Visualizar Colaborador'}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {mode === 'create' ? 'Preencha os dados para criar um novo colaborador' :
                                            mode === 'edit' ? 'Atualize os dados do colaborador' :
                                                'Visualize os dados do colaborador'}
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

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Informações Pessoais */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informações Pessoais</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Nome Completo"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Digite o nome completo"
                                        error={errors.name}
                                        required
                                        icon={User}
                                        disabled={isReadOnly}
                                    />

                                    <Input
                                        label="CPF"
                                        name="cpf"
                                        value={formData.cpf}
                                        onChange={handleCPFChange}
                                        placeholder="000.000.000-00"
                                        error={errors.cpf}
                                        required
                                        icon={CreditCard}
                                        disabled={isReadOnly}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Matrícula"
                                        name="registration"
                                        value={formData.registration}
                                        onChange={handleInputChange}
                                        placeholder="Digite a matrícula"
                                        error={errors.registration}
                                        required
                                        icon={CreditCard}
                                        disabled={isReadOnly}
                                    />

                                    <Input
                                        label="Telefone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="(00) 00000-0000"
                                        icon={Phone}
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>

                            {/* Informações Profissionais */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informações Profissionais</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Cargo"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        placeholder="Digite o cargo"
                                        error={errors.position}
                                        required
                                        icon={Building2}
                                        disabled={isReadOnly}
                                    />

                                    <Select
                                        label="Departamento"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        options={departments}
                                        placeholder="Selecione o departamento"
                                        error={errors.department}
                                        required
                                        disabled={isReadOnly}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="E-mail Corporativo"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="usuario@empresa.com"
                                        error={errors.email}
                                        required
                                        icon={Mail}
                                        disabled={isReadOnly}
                                    />

                                    <Select
                                        label="Perfil de Acesso"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        options={roleOptions}
                                        placeholder="Selecione o perfil"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>

                            {/* Horários de Trabalho */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Horários de Trabalho</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Input
                                        label="Hora de Entrada"
                                        name="workStartTime"
                                        type="time"
                                        value={formData.workStartTime}
                                        onChange={handleInputChange}
                                        icon={Clock}
                                        disabled={isReadOnly}
                                    />

                                    <Input
                                        label="Hora de Saída"
                                        name="workEndTime"
                                        type="time"
                                        value={formData.workEndTime}
                                        onChange={handleInputChange}
                                        icon={Clock}
                                        disabled={isReadOnly}
                                    />

                                    <Select
                                        label="Escala"
                                        name="workSchedule"
                                        value={formData.workSchedule}
                                        onChange={handleInputChange}
                                        options={scheduleOptions}
                                        placeholder="Selecione a escala"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            {!isReadOnly && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status</h3>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="status"
                                            name="status"
                                            checked={formData.status}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <label htmlFor="status" className="text-sm font-medium text-gray-900 dark:text-white">
                                            Colaborador ativo
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Botões */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    {isReadOnly ? 'Fechar' : 'Cancelar'}
                                </Button>

                                {!isReadOnly && (
                                    <Button
                                        type="submit"
                                        variant="success"
                                        loading={loading}
                                        disabled={loading || Object.keys(errors).length > 0}
                                        icon={CheckCircle}
                                    >
                                        {loading ? 'Salvando...' : mode === 'create' ? 'Criar Colaborador' : 'Salvar Alterações'}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmployeeModal;
