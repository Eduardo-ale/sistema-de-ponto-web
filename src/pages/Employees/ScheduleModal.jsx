import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { employeeService } from '../../services/api';

const ScheduleModal = ({ isOpen, onClose, employee, onSuccess }) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        dayOfWeek: '',
        startTime: '08:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        isActive: true
    });

    const dayOptions = [
        { value: 'monday', label: 'Segunda-feira' },
        { value: 'tuesday', label: 'Terça-feira' },
        { value: 'wednesday', label: 'Quarta-feira' },
        { value: 'thursday', label: 'Quinta-feira' },
        { value: 'friday', label: 'Sexta-feira' },
        { value: 'saturday', label: 'Sábado' },
        { value: 'sunday', label: 'Domingo' }
    ];

    const scheduleTemplates = [
        { value: '08h-17h', label: '08h às 17h (Padrão)', startTime: '08:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
        { value: '06h-14h', label: '06h às 14h', startTime: '06:00', endTime: '14:00', breakStartTime: '10:00', breakEndTime: '10:30' },
        { value: '14h-22h', label: '14h às 22h', startTime: '14:00', endTime: '22:00', breakStartTime: '18:00', breakEndTime: '19:00' },
        { value: '22h-06h', label: '22h às 06h (Noturno)', startTime: '22:00', endTime: '06:00', breakStartTime: '02:00', breakEndTime: '02:30' }
    ];

    // Carregar horários do colaborador
    useEffect(() => {
        if (isOpen && employee) {
            loadSchedules();
        }
    }, [isOpen, employee]);

    const loadSchedules = async () => {
        try {
            const result = await employeeService.getEmployeeSchedules(employee.id);
            if (result.success) {
                setSchedules(result.data);
            }
        } catch (error) {
            console.error('Erro ao carregar horários:', error);
        }
    };

    const handleTemplateChange = (templateValue) => {
        const template = scheduleTemplates.find(t => t.value === templateValue);
        if (template) {
            setNewSchedule(prev => ({
                ...prev,
                startTime: template.startTime,
                endTime: template.endTime,
                breakStartTime: template.breakStartTime,
                breakEndTime: template.breakEndTime
            }));
        }
    };

    const handleAddSchedule = () => {
        if (!newSchedule.dayOfWeek) {
            toast.error('Selecione um dia da semana');
            return;
        }

        // Verificar se já existe horário para este dia
        const existingSchedule = schedules.find(s => s.dayOfWeek === newSchedule.dayOfWeek);
        if (existingSchedule) {
            toast.error('Já existe um horário configurado para este dia');
            return;
        }

        setSchedules(prev => [...prev, { ...newSchedule, id: Date.now() }]);
        setNewSchedule({
            dayOfWeek: '',
            startTime: '08:00',
            endTime: '17:00',
            breakStartTime: '12:00',
            breakEndTime: '13:00',
            isActive: true
        });
    };

    const handleRemoveSchedule = (scheduleId) => {
        setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    };

    const handleToggleSchedule = (scheduleId) => {
        setSchedules(prev => prev.map(s =>
            s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await employeeService.updateEmployeeSchedules(employee.id, schedules);

            if (result.success) {
                toast.success('✅ Horários atualizados com sucesso!');
                onSuccess();
            } else {
                toast.error(`❌ ${result.error}`);
            }
        } catch (error) {
            toast.error('❌ Erro interno do servidor');
            console.error('Erro ao salvar horários:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDayLabel = (dayOfWeek) => {
        const day = dayOptions.find(d => d.value === dayOfWeek);
        return day ? day.label : dayOfWeek;
    };

    const formatTime = (time) => {
        return time || '--:--';
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
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Horários e Escalas
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {employee?.name} - Configure os horários de trabalho
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
                            {/* Adicionar Novo Horário */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Adicionar Horário
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Select
                                        label="Dia da Semana"
                                        name="dayOfWeek"
                                        value={newSchedule.dayOfWeek}
                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                                        options={dayOptions}
                                        placeholder="Selecione o dia"
                                    />

                                    <Select
                                        label="Modelo de Horário"
                                        name="template"
                                        value=""
                                        onChange={(e) => handleTemplateChange(e.target.value)}
                                        options={scheduleTemplates}
                                        placeholder="Escolha um modelo"
                                    />

                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="primary"
                                            onClick={handleAddSchedule}
                                            icon={Plus}
                                            className="w-full"
                                        >
                                            Adicionar
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    <Input
                                        label="Entrada"
                                        name="startTime"
                                        type="time"
                                        value={newSchedule.startTime}
                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                                    />

                                    <Input
                                        label="Saída"
                                        name="endTime"
                                        type="time"
                                        value={newSchedule.endTime}
                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                                    />

                                    <Input
                                        label="Início Pausa"
                                        name="breakStartTime"
                                        type="time"
                                        value={newSchedule.breakStartTime}
                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, breakStartTime: e.target.value }))}
                                    />

                                    <Input
                                        label="Fim Pausa"
                                        name="breakEndTime"
                                        type="time"
                                        value={newSchedule.breakEndTime}
                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, breakEndTime: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Lista de Horários */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Horários Configurados ({schedules.length})
                                </h3>

                                {schedules.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <Clock className="w-12 h-12 mx-auto mb-4" />
                                        <p>Nenhum horário configurado</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {schedules.map((schedule) => (
                                            <motion.div
                                                key={schedule.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-4 rounded-lg border ${schedule.isActive
                                                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={schedule.isActive}
                                                                onChange={() => handleToggleSchedule(schedule.id)}
                                                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                            />
                                                            <span className={`text-sm font-medium ${schedule.isActive
                                                                    ? 'text-green-800 dark:text-green-400'
                                                                    : 'text-gray-500 dark:text-gray-400'
                                                                }`}>
                                                                {getDayLabel(schedule.dayOfWeek)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                                            <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                                                            <span>Pausa: {formatTime(schedule.breakStartTime)} - {formatTime(schedule.breakEndTime)}</span>
                                                        </div>
                                                    </div>

                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleRemoveSchedule(schedule.id)}
                                                        className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
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
                                    {loading ? 'Salvando...' : 'Salvar Horários'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScheduleModal;






