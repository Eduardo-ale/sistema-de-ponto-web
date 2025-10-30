import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, CalendarDays, Plus, Trash2, Save, AlertCircle, CheckCircle,
    Clock, Calendar, FileText, User, Loader2, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const ManageAbsencesModal = ({ isOpen, onClose, user }) => {
    const [activeTab, setActiveTab] = useState('new');
    const [loading, setLoading] = useState(false);
    const [absences, setAbsences] = useState([]);
    const [formData, setFormData] = useState({
        tipo: '',
        inicio: '',
        fim: '',
        observacao: ''
    });
    const [errors, setErrors] = useState({});

    // Tipos de ausência
    const absenceTypes = [
        { value: 'Feriado', label: 'Feriado', color: 'text-red-500' },
        { value: 'Folga', label: 'Folga', color: 'text-blue-500' },
        { value: 'Férias', label: 'Férias', color: 'text-green-500' },
        { value: 'Afastamento médico', label: 'Afastamento médico', color: 'text-orange-500' },
        { value: 'Licença', label: 'Licença', color: 'text-purple-500' },
        { value: 'Outros', label: 'Outros', color: 'text-gray-500' }
    ];

    // Carregar ausências do usuário
    useEffect(() => {
        if (isOpen && user) {
            loadAbsences();
        }
    }, [isOpen, user]);

    const loadAbsences = () => {
        try {
            const storedAbsences = JSON.parse(localStorage.getItem('absences') || '[]');
            const userAbsences = storedAbsences.filter(absence => absence.userId === user.id);
            setAbsences(userAbsences);
        } catch (error) {
            console.error('Erro ao carregar ausências:', error);
            setAbsences([]);
        }
    };

    // Validação do formulário
    const validateForm = () => {
        const newErrors = {};

        if (!formData.tipo) {
            newErrors.tipo = 'Tipo de ausência é obrigatório';
        }

        if (!formData.inicio) {
            newErrors.inicio = 'Data de início é obrigatória';
        }

        if (!formData.fim) {
            newErrors.fim = 'Data de término é obrigatória';
        }

        if (formData.inicio && formData.fim && formData.inicio > formData.fim) {
            newErrors.fim = 'Data de término deve ser posterior à data de início';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Salvar nova ausência
    const handleSave = async () => {
        if (!validateForm()) {
            toast.error('Por favor, corrija os erros no formulário');
            return;
        }

        setLoading(true);

        try {
            const newAbsence = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                userId: user.id,
                userName: user.name,
                tipo: formData.tipo,
                inicio: formData.inicio,
                fim: formData.fim,
                observacao: formData.observacao || '',
                status: 'Ativo',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Salvar no localStorage
            const storedAbsences = JSON.parse(localStorage.getItem('absences') || '[]');
            storedAbsences.push(newAbsence);
            localStorage.setItem('absences', JSON.stringify(storedAbsences));

            // Atualizar lista
            loadAbsences();

            // Limpar formulário
            setFormData({
                tipo: '',
                inicio: '',
                fim: '',
                observacao: ''
            });

            toast.success('✅ Ausência registrada com sucesso!', {
                duration: 4000,
                style: {
                    background: '#10B981',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });

        } catch (error) {
            console.error('Erro ao salvar ausência:', error);
            toast.error('Erro ao salvar ausência');
        } finally {
            setLoading(false);
        }
    };

    // Excluir ausência
    const handleDelete = async (absenceId) => {
        if (!window.confirm('Deseja realmente excluir esta ausência?')) {
            return;
        }

        try {
            const storedAbsences = JSON.parse(localStorage.getItem('absences') || '[]');
            const updatedAbsences = storedAbsences.filter(absence => absence.id !== absenceId);
            localStorage.setItem('absences', JSON.stringify(updatedAbsences));

            loadAbsences();

            toast.success('✅ Ausência excluída com sucesso!', {
                duration: 4000,
                style: {
                    background: '#10B981',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });

        } catch (error) {
            console.error('Erro ao excluir ausência:', error);
            toast.error('Erro ao excluir ausência');
        }
    };

    // Formatar data
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    };

    // Calcular duração
    const calculateDuration = (inicio, fim) => {
        try {
            const start = new Date(inicio);
            const end = new Date(fim);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
        } catch {
            return 'N/A';
        }
    };

    // Obter cor do tipo
    const getTypeColor = (tipo) => {
        const type = absenceTypes.find(t => t.value === tipo);
        return type ? type.color : 'text-gray-500';
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
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                                        <CalendarDays className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Gerenciar Ausências
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {user.name} - Feriados, folgas e afastamentos
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
                                {/* Tabs */}
                                <div className="mb-6">
                                    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                        <button
                                            onClick={() => setActiveTab('new')}
                                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'new'
                                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <Plus className="w-4 h-4 mr-2 inline" />
                                            Nova Ausência
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('history')}
                                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'history'
                                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <Clock className="w-4 h-4 mr-2 inline" />
                                            Histórico ({absences.length})
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Content */}
                                {activeTab === 'new' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Tipo de Ausência */}
                                            <div>
                                                <Select
                                                    label="Tipo de Ausência"
                                                    value={formData.tipo}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                                                    error={errors.tipo}
                                                    placeholder="Selecione o tipo"
                                                    options={absenceTypes}
                                                />
                                            </div>

                                            {/* Duração Calculada */}
                                            <div className="flex items-end">
                                                <div className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Duração
                                                    </label>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {formData.inicio && formData.fim
                                                            ? calculateDuration(formData.inicio, formData.fim)
                                                            : 'Selecione as datas'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Data de Início */}
                                            <div>
                                                <Input
                                                    label="Data de Início"
                                                    type="date"
                                                    value={formData.inicio}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, inicio: e.target.value }))}
                                                    error={errors.inicio}
                                                />
                                            </div>

                                            {/* Data de Término */}
                                            <div>
                                                <Input
                                                    label="Data de Término"
                                                    type="date"
                                                    value={formData.fim}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, fim: e.target.value }))}
                                                    error={errors.fim}
                                                />
                                            </div>
                                        </div>

                                        {/* Observação */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Observação
                                            </label>
                                            <textarea
                                                value={formData.observacao}
                                                onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                                                placeholder="Descreva detalhes sobre a ausência..."
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-200"
                                            />
                                        </div>

                                        {/* Botões */}
                                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                                                onClick={handleSave}
                                                className="px-6 bg-yellow-600 hover:bg-yellow-700 text-white"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Salvar Ausência
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'history' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4"
                                    >
                                        {absences.length === 0 ? (
                                            <div className="text-center py-12">
                                                <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                    Nenhuma ausência registrada
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Clique em "Nova Ausência" para registrar feriados, folgas ou afastamentos.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                                            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                                                Tipo
                                                            </th>
                                                            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                                                Período
                                                            </th>
                                                            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                                                Duração
                                                            </th>
                                                            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                                                Observação
                                                            </th>
                                                            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                                                Status
                                                            </th>
                                                            <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                                                Ações
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {absences.map((absence) => (
                                                            <tr key={absence.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                <td className="py-3 px-4">
                                                                    <span className={`font-medium ${getTypeColor(absence.tipo)}`}>
                                                                        {absence.tipo}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="text-gray-600 dark:text-gray-400">
                                                                        <div>{formatDate(absence.inicio)}</div>
                                                                        <div className="text-xs">até {formatDate(absence.fim)}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <span className="text-gray-600 dark:text-gray-400">
                                                                        {calculateDuration(absence.inicio, absence.fim)}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <span className="text-gray-600 dark:text-gray-400">
                                                                        {absence.observacao || '-'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${absence.status === 'Ativo'
                                                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                                                        : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                                                                        }`}>
                                                                        {absence.status}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button
                                                                        onClick={() => handleDelete(absence.id)}
                                                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                        title="Excluir ausência"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ManageAbsencesModal;
