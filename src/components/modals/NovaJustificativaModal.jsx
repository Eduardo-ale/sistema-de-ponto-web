import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import justificativasService from '../../services/justificativasService';

const NovaJustificativaModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tipo: '',
        dataEvento: '',
        horario: '',
        motivo: '',
        anexo: null
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpar erro do campo ao digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Validar tipo de arquivo
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Apenas arquivos PDF ou imagem (JPG, PNG) são permitidos', {
                icon: '❌',
                style: {
                    background: '#EF4444',
                    color: '#fff'
                }
            });
            e.target.value = '';
            return;
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Arquivo muito grande. Tamanho máximo: 5MB', {
                icon: '❌',
                style: {
                    background: '#EF4444',
                    color: '#fff'
                }
            });
            e.target.value = '';
            return;
        }

        setFormData(prev => ({
            ...prev,
            anexo: file
        }));

        toast.success('Arquivo anexado com sucesso!', {
            icon: '✅',
            style: {
                background: '#10B981',
                color: '#fff'
            }
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.tipo) {
            newErrors.tipo = 'Tipo de justificativa é obrigatório';
        }

        if (!formData.dataEvento) {
            newErrors.dataEvento = 'Data do evento é obrigatória';
        } else {
            const dataEvento = new Date(formData.dataEvento);
            const hoje = new Date();
            hoje.setHours(23, 59, 59, 999);

            if (dataEvento > hoje) {
                newErrors.dataEvento = 'Data não pode ser no futuro';
            }
        }

        if (formData.tipo === 'atraso' && !formData.horario) {
            newErrors.horario = 'Horário é obrigatório para atrasos';
        }

        if (!formData.motivo || formData.motivo.trim().length < 20) {
            newErrors.motivo = 'Motivo é obrigatório e deve ter no mínimo 20 caracteres';
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
            const result = await justificativasService.createJustificativa({
                colaboradorId: user.id,
                colaboradorNome: user.name,
                tipo: formData.tipo,
                dataEvento: formData.dataEvento,
                horario: formData.horario || null,
                motivo: formData.motivo.trim(),
                anexo: formData.anexo ? {
                    name: formData.anexo.name,
                    url: URL.createObjectURL(formData.anexo),
                    type: formData.anexo.type.includes('pdf') ? 'pdf' : 'image'
                } : null
            });

            if (result.success) {
                toast.success('Solicitação enviada com sucesso!', {
                    icon: '✅',
                    style: {
                        background: '#10B981',
                        color: '#fff'
                    }
                });

                // Reset form
                setFormData({
                    tipo: '',
                    dataEvento: '',
                    horario: '',
                    motivo: '',
                    anexo: null
                });
                setErrors({});

                onSuccess?.();
                onClose();
            } else {
                toast.error(result.error || 'Erro ao enviar solicitação', {
                    icon: '❌',
                    style: {
                        background: '#EF4444',
                        color: '#fff'
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao criar justificativa:', error);
            toast.error('Erro ao enviar solicitação', {
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

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-600 rounded-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Nova Justificativa</h3>
                                <p className="text-sm text-gray-400">Preencha os dados da solicitação</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Tipo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Tipo de Justificativa <span className="text-red-400">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'ausencia' }))}
                                    className={`p-4 rounded-lg border-2 transition-all ${formData.tipo === 'ausencia'
                                            ? 'border-yellow-500 bg-yellow-900/20'
                                            : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2 text-white">
                                        <FileText className="w-5 h-5" />
                                        <span className="font-medium">Ausência</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'atraso' }))}
                                    className={`p-4 rounded-lg border-2 transition-all ${formData.tipo === 'atraso'
                                            ? 'border-yellow-500 bg-yellow-900/20'
                                            : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2 text-white">
                                        <Clock className="w-5 h-5" />
                                        <span className="font-medium">Atraso</span>
                                    </div>
                                </button>
                            </div>
                            {errors.tipo && (
                                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{errors.tipo}</span>
                                </p>
                            )}
                        </div>

                        {/* Data */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Data do Evento <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    name="dataEvento"
                                    value={formData.dataEvento}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            {errors.dataEvento && (
                                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{errors.dataEvento}</span>
                                </p>
                            )}
                        </div>

                        {/* Horário (opcional para ausência) */}
                        {formData.tipo === 'atraso' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Horário <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="time"
                                        name="horario"
                                        value={formData.horario}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                                {errors.horario && (
                                    <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.horario}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Motivo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Motivo Detalhado <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                name="motivo"
                                value={formData.motivo}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Descreva detalhadamente o motivo da justificativa..."
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 resize-none"
                                maxLength={500}
                            />
                            <div className="mt-2 flex items-center justify-between">
                                {errors.motivo && (
                                    <p className="text-sm text-red-400 flex items-center space-x-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.motivo}</span>
                                    </p>
                                )}
                                <p className="text-sm text-gray-400 ml-auto">
                                    {formData.motivo.length}/500 caracteres
                                </p>
                            </div>
                        </div>

                        {/* Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Anexo (Opcional)
                            </label>
                            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-300 font-medium mb-1">
                                        Clique para anexar ou arraste o arquivo
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        PDF, JPG ou PNG (máx. 5MB)
                                    </p>
                                </label>
                                {formData.anexo && (
                                    <div className="mt-4 p-3 bg-gray-700 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-white">
                                            <FileText className="w-5 h-5" />
                                            <span className="text-sm">{formData.anexo.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, anexo: null }))}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <span>Enviar Solicitação</span>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NovaJustificativaModal;


