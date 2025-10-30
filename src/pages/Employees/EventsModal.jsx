import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Plus, Trash2, CheckCircle, AlertCircle, Clock, UserX, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { employeeService } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EventsModal = ({ isOpen, onClose, employee, onSuccess }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newEvent, setNewEvent] = useState({
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
        description: '',
        isPaid: false
    });

    const eventTypes = [
        { value: 'holiday', label: 'Feriado', icon: Calendar },
        { value: 'vacation', label: 'Férias', icon: Calendar },
        { value: 'sick_leave', label: 'Atestado Médico', icon: UserX },
        { value: 'personal_leave', label: 'Folga Pessoal', icon: Clock },
        { value: 'maternity_leave', label: 'Licença Maternidade', icon: UserX },
        { value: 'paternity_leave', label: 'Licença Paternidade', icon: UserX },
        { value: 'other', label: 'Outros', icon: FileText }
    ];

    const getEventIcon = (type) => {
        const eventType = eventTypes.find(et => et.value === type);
        return eventType ? eventType.icon : FileText;
    };

    const getEventColor = (type) => {
        const colors = {
            'holiday': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800',
            'vacation': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800',
            'sick_leave': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
            'personal_leave': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800',
            'maternity_leave': 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400 border-pink-200 dark:border-pink-800',
            'paternity_leave': 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
            'other': 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800'
        };
        return colors[type] || colors.other;
    };

    const getEventLabel = (type) => {
        const eventType = eventTypes.find(et => et.value === type);
        return eventType ? eventType.label : 'Outros';
    };

    // Carregar eventos do colaborador
    useEffect(() => {
        if (isOpen && employee) {
            loadEvents();
        }
    }, [isOpen, employee]);

    const loadEvents = async () => {
        try {
            const result = await employeeService.getEmployeeEvents(employee.id);
            if (result.success) {
                setEvents(result.data);
            }
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
        }
    };

    const handleAddEvent = () => {
        if (!newEvent.type || !newEvent.startDate) {
            toast.error('Preencha pelo menos o tipo e data de início');
            return;
        }

        if (newEvent.endDate && new Date(newEvent.endDate) < new Date(newEvent.startDate)) {
            toast.error('Data de fim deve ser posterior à data de início');
            return;
        }

        setEvents(prev => [...prev, {
            ...newEvent,
            id: Date.now(),
            employeeId: employee.id,
            createdAt: new Date().toISOString()
        }]);

        setNewEvent({
            type: '',
            startDate: '',
            endDate: '',
            reason: '',
            description: '',
            isPaid: false
        });
    };

    const handleRemoveEvent = (eventId) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await employeeService.updateEmployeeEvents(employee.id, events);

            if (result.success) {
                toast.success('✅ Eventos atualizados com sucesso!');
                onSuccess();
            } else {
                toast.error(`❌ ${result.error}`);
            }
        } catch (error) {
            toast.error('❌ Erro interno do servidor');
            console.error('Erro ao salvar eventos:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    };

    const getDateRange = (startDate, endDate) => {
        if (!endDate || startDate === endDate) {
            return formatDate(startDate);
        }
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
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
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Eventos de Ponto
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {employee?.name} - Gerencie feriados, folgas e afastamentos
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
                        <div className="p-6 space-y-6">
                            {/* Adicionar Novo Evento */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Adicionar Evento
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        label="Tipo de Evento"
                                        name="type"
                                        value={newEvent.type}
                                        onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                                        options={eventTypes}
                                        placeholder="Selecione o tipo"
                                    />

                                    <Input
                                        label="Motivo"
                                        name="reason"
                                        value={newEvent.reason}
                                        onChange={(e) => setNewEvent(prev => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Digite o motivo"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <Input
                                        label="Data de Início"
                                        name="startDate"
                                        type="date"
                                        value={newEvent.startDate}
                                        onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                                        required
                                    />

                                    <Input
                                        label="Data de Fim (opcional)"
                                        name="endDate"
                                        type="date"
                                        value={newEvent.endDate}
                                        onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Input
                                        label="Descrição"
                                        name="description"
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Descrição adicional (opcional)"
                                    />
                                </div>

                                <div className="flex items-center space-x-3 mt-4">
                                    <input
                                        type="checkbox"
                                        id="isPaid"
                                        checked={newEvent.isPaid}
                                        onChange={(e) => setNewEvent(prev => ({ ...prev, isPaid: e.target.checked }))}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <label htmlFor="isPaid" className="text-sm font-medium text-gray-900 dark:text-white">
                                        Evento remunerado
                                    </label>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={handleAddEvent}
                                        icon={Plus}
                                    >
                                        Adicionar Evento
                                    </Button>
                                </div>
                            </div>

                            {/* Lista de Eventos */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Eventos Cadastrados ({events.length})
                                </h3>

                                {events.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-12 h-12 mx-auto mb-4" />
                                        <p>Nenhum evento cadastrado</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {events.map((event) => {
                                            const EventIcon = getEventIcon(event.type);
                                            return (
                                                <motion.div
                                                    key={event.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`p-4 rounded-lg border ${getEventColor(event.type)}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <EventIcon className="w-5 h-5" />

                                                            <div>
                                                                <div className="font-medium">
                                                                    {getEventLabel(event.type)}
                                                                </div>
                                                                <div className="text-sm opacity-75">
                                                                    {getDateRange(event.startDate, event.endDate)}
                                                                </div>
                                                                {event.reason && (
                                                                    <div className="text-sm opacity-75">
                                                                        {event.reason}
                                                                    </div>
                                                                )}
                                                                {event.description && (
                                                                    <div className="text-sm opacity-75 mt-1">
                                                                        {event.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            {event.isPaid && (
                                                                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">
                                                                    Remunerado
                                                                </span>
                                                            )}

                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleRemoveEvent(event.id)}
                                                                className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Botões */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    variant="success"
                                    loading={loading}
                                    onClick={handleSubmit}
                                    icon={CheckCircle}
                                >
                                    {loading ? 'Salvando...' : 'Salvar Eventos'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EventsModal;






