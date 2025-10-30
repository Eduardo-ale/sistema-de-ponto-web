import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, AlertCircle, CheckCircle, Loader2, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import correcaoMarcacoesService from '../../services/correcaoMarcacoesService';

const CorrecaoMarcacaoModal = ({ isOpen, onClose, marcacao, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [novaEntrada, setNovaEntrada] = useState('');
    const [novaSaida, setNovaSaida] = useState('');
    const [motivo, setMotivo] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (marcacao) {
            setNovaEntrada(marcacao.entrada);
            setNovaSaida(marcacao.saida);
            setMotivo('');
            setErrors({});
        }
    }, [marcacao]);

    const validateForm = () => {
        const newErrors = {};

        // Validar motivo
        if (!motivo.trim()) {
            newErrors.motivo = 'Motivo da correção é obrigatório';
        } else if (motivo.trim().length < 10) {
            newErrors.motivo = 'Motivo deve ter no mínimo 10 caracteres';
        }

        // Validar se houve alteração
        if (novaEntrada === marcacao.entrada && novaSaida === marcacao.saida) {
            newErrors.geral = 'Ao menos um horário deve ser alterado';
        }

        // Validar horário de saída não pode ser antes da entrada
        if (novaEntrada && novaSaida) {
            const entrada = new Date(`2000-01-01 ${novaEntrada}`);
            const saida = new Date(`2000-01-01 ${novaSaida}`);

            if (saida < entrada) {
                newErrors.horario = 'Horário de saída não pode ser anterior ao horário de entrada';
            }
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

        setLoading(true);

        try {
            // Obter usuário logado (simulado para demonstração)
            const usuario = JSON.parse(localStorage.getItem('user')) || { id: 'admin-1', name: 'Admin Sistema' };

            const result = await correcaoMarcacoesService.corrigirMarcacao(
                marcacao.id,
                {
                    novaEntrada: novaEntrada !== marcacao.entrada ? novaEntrada : null,
                    novaSaida: novaSaida !== marcacao.saida ? novaSaida : null,
                    motivo: motivo.trim()
                },
                usuario
            );

            if (result.success) {
                toast.success('Correção salva com sucesso!', {
                    icon: '✅',
                    style: {
                        background: '#10B981',
                        color: '#fff'
                    }
                });

                if (onSuccess) {
                    onSuccess();
                }

                onClose();
            } else {
                toast.error(result.error || 'Falha ao salvar correção', {
                    icon: '❌',
                    style: {
                        background: '#EF4444',
                        color: '#fff'
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao salvar correção:', error);
            toast.error('Erro interno ao salvar correção', {
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

    if (!isOpen || !marcacao) return null;

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
                    className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Edit3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Corrigir Marcação</h3>
                                <p className="text-sm text-gray-400">Ajuste os horários e informe o motivo</p>
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

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Erro geral */}
                        {errors.geral && (
                            <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400">{errors.geral}</p>
                            </div>
                        )}

                        {/* Informações do Colaborador */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <User className="w-5 h-5" />
                                <span className="text-sm font-medium">Informações do Colaborador</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Nome</p>
                                    <p className="text-white font-medium">{marcacao.colaborador}</p>
                                </div>
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Data</p>
                                    <p className="text-white font-medium">
                                        {new Date(marcacao.data).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Horários */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <Clock className="w-5 h-5" />
                                <span className="text-sm font-medium">Horários de Trabalho</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Entrada */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Horário de Entrada
                                    </label>
                                    <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                                        <p className="text-xs text-gray-400 mb-2">Original</p>
                                        <p className="text-gray-300 font-mono">{marcacao.entrada}</p>
                                    </div>
                                    <input
                                        type="time"
                                        value={novaEntrada}
                                        onChange={(e) => setNovaEntrada(e.target.value)}
                                        disabled={loading}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white font-mono"
                                    />
                                </div>

                                {/* Saída */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Horário de Saída
                                    </label>
                                    <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                                        <p className="text-xs text-gray-400 mb-2">Original</p>
                                        <p className="text-gray-300 font-mono">{marcacao.saida}</p>
                                    </div>
                                    <input
                                        type="time"
                                        value={novaSaida}
                                        onChange={(e) => setNovaSaida(e.target.value)}
                                        disabled={loading}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white font-mono"
                                    />
                                </div>
                            </div>

                            {/* Erro de horário */}
                            {errors.horario && (
                                <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg flex items-center space-x-2">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    <p className="text-sm text-red-400">{errors.horario}</p>
                                </div>
                            )}
                        </div>

                        {/* Motivo */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Motivo da Correção <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                placeholder="Descreva detalhadamente o motivo da correção..."
                                rows="4"
                                disabled={loading}
                                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:outline-none text-white placeholder-gray-400 resize-none ${errors.motivo ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                                    }`}
                            />
                            {errors.motivo && (
                                <p className="text-sm text-red-400">{errors.motivo}</p>
                            )}
                            <p className="text-xs text-gray-400">
                                {motivo.length} / 10 caracteres mínimos
                            </p>
                        </div>

                        {/* Footer */}
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
                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Salvando...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Salvar Correção</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CorrecaoMarcacaoModal;

