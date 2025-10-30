/**
 * Modal para configuração de limites de horas extras por departamento
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Save,
    X,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    TrendingUp,
    Calendar,
    User
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import limitesExtrasService from '../../services/limitesExtrasService';
import { validarLimiteDiario, validarLimiteMensal, formatarData } from '../../utils/limitesExtrasUtils';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmActionModal from './ConfirmActionModal';

const LimitesExtrasModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [departamento, setDepartamento] = useState('');
    const [limiteDiario, setLimiteDiario] = useState('');
    const [limiteMensal, setLimiteMensal] = useState('');
    const [limites, setLimites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [histórico, setHistorico] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [pendingLimite, setPendingLimite] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const departamentos = limitesExtrasService.getDepartamentos();

    useEffect(() => {
        if (isOpen) {
            loadLimites();
            loadHistorico();
            // Limpar mensagens ao abrir o modal
            setSaveMessage('');
            setSaveSuccess(false);
        }
    }, [isOpen]);

    const loadLimites = async () => {
        try {
            setLoading(true);
            const dados = await limitesExtrasService.getAllLimites();
            setLimites(dados);
        } catch (error) {
            console.error('Erro ao carregar limites:', error);
            toast.error('Erro ao carregar limites');
        } finally {
            setLoading(false);
        }
    };

    const loadHistorico = async () => {
        try {
            const logs = await limitesExtrasService.getHistorico();
            setHistorico(logs.slice(0, 10)); // Últimos 10 registros
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        }
    };

    const validarFormulario = () => {
        const novosErros = {};

        if (!departamento) {
            novosErros.departamento = 'Selecione um departamento';
        }

        const validacaoDiario = validarLimiteDiario(limiteDiario);
        if (!validacaoDiario.valido) {
            novosErros.limiteDiario = validacaoDiario.erro;
        }

        const validacaoMensal = validarLimiteMensal(limiteMensal);
        if (!validacaoMensal.valido) {
            novosErros.limiteMensal = validacaoMensal.erro;
        }

        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = () => {
        if (!validarFormulario()) {
            toast.error('Corrija os erros antes de salvar');
            return;
        }

        const novoLimite = {
            departamento,
            limiteDiario: Number(limiteDiario),
            limiteMensal: Number(limiteMensal)
        };

        // Verificar se já existe limite para o departamento
        const limiteExistente = limites.find(l => l.departamento === departamento);

        if (limiteExistente) {
            // Criar mensagem personalizada com valores atuais vs novos
            const mensagem = `Você está alterando os limites de horas extras para o departamento **${departamento}**.\n\n` +
                `**Valores atuais:**\n` +
                `• Diário: ${limiteExistente.limiteDiario}h\n` +
                `• Mensal: ${limiteExistente.limiteMensal}h\n\n` +
                `**Novos valores:**\n` +
                `• Diário: ${novoLimite.limiteDiario}h\n` +
                `• Mensal: ${novoLimite.limiteMensal}h\n\n` +
                `Esta alteração será aplicada **imediatamente** a todos os colaboradores deste departamento. Os cálculos de horas extras serão recalculados automaticamente.`;

            setPendingLimite(novoLimite);
            setConfirmMessage(mensagem);
            setConfirmAction('salvar');
            setShowConfirmModal(true);
        } else {
            // Novo limite - salvar diretamente sem confirmação
            executarSalvamento(novoLimite);
        }
    };

    const executarSalvamento = async (limiteData) => {
        setIsSaving(true);

        // Verificar ANTES de salvar se é atualização ou criação
        const limiteExistente = limites.find(l => l.departamento === limiteData.departamento);
        const isAtualizacao = !!limiteExistente;

        try {
            const resultado = await limitesExtrasService.salvarLimite(
                limiteData,
                user?.id || user?.email || 'Admin',
                user?.name || user?.nome || 'Administrador'
            );

            if (resultado.success) {
                const mensagemSucesso = isAtualizacao
                    ? `Limites do departamento ${limiteData.departamento} atualizados com sucesso!`
                    : `Limites do departamento ${limiteData.departamento} configurados com sucesso!`;

                setSaveMessage(mensagemSucesso);
                setSaveSuccess(true);

                // Mostrar toast com estilo explícito
                toast.success(mensagemSucesso, {
                    icon: '✅',
                    duration: 5000,
                    style: {
                        background: '#10b981',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '12px 16px',
                        borderRadius: '0.5rem',
                        zIndex: 99999
                    }
                });

                // Limpar formulário
                setDepartamento('');
                setLimiteDiario('');
                setLimiteMensal('');
                setErrors({});
                setPendingLimite(null);

                // Recarregar limites
                await loadLimites();
                await loadHistorico();

                // Disparar evento para atualizar cálculos
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('limitesAtualizados', {
                        bubbles: false,
                        cancelable: false
                    }));
                }

                // Ocultar mensagem de sucesso após 4 segundos
                setTimeout(() => {
                    setSaveSuccess(false);
                    setSaveMessage('');
                }, 4000);
            } else {
                const mensagemErro = resultado.error || 'Erro ao salvar limite';
                setSaveMessage(mensagemErro);
                setSaveSuccess(false);

                toast.error(mensagemErro, {
                    duration: 5000,
                    style: {
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '12px 16px',
                        borderRadius: '0.5rem',
                        zIndex: 99999
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao salvar limite:', error);
            const mensagemErro = 'Erro ao salvar configuração. Tente novamente.';
            setSaveMessage(mensagemErro);
            setSaveSuccess(false);

            toast.error(mensagemErro, {
                duration: 5000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '12px 16px',
                    borderRadius: '0.5rem',
                    zIndex: 99999
                }
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmAction = async () => {
        setShowConfirmModal(false);

        if (confirmAction === 'salvar' && pendingLimite) {
            await executarSalvamento(pendingLimite);
        } else if (confirmAction === 'redefinir') {
            await executarRedefinir();
        }

        setConfirmAction(null);
        setPendingLimite(null);
    };

    const handleRedefinir = () => {
        if (!departamento) {
            toast.error('Selecione um departamento para redefinir');
            return;
        }

        const limiteAtual = limites.find(l => l.departamento === departamento);

        if (!limiteAtual) {
            toast.error('Nenhum limite configurado para este departamento');
            return;
        }

        // Criar mensagem personalizada
        const mensagem = `Você está redefinindo os limites do departamento **${departamento}** para os valores padrão.\n\n` +
            `**Configuração atual será perdida:**\n` +
            `• Diário: ${limiteAtual.limiteDiario}h → **2h**\n` +
            `• Mensal: ${limiteAtual.limiteMensal}h → **40h**\n\n` +
            `Esta ação não pode ser desfeita. Todos os colaboradores deste departamento passarão a usar os limites padrão do sistema.`;

        setConfirmMessage(mensagem);
        setConfirmAction('redefinir');
        setShowConfirmModal(true);
    };

    const executarRedefinir = async () => {
        try {
            const resultado = await limitesExtrasService.redefinirLimite(
                departamento,
                user?.id || user?.email || 'Admin',
                user?.name || user?.nome || 'Administrador'
            );

            if (resultado.success) {
                toast.success('Limite redefinido com sucesso!', {
                    icon: '🔄',
                    duration: 4000
                });

                setDepartamento('');
                setLimiteDiario('');
                setLimiteMensal('');
                await loadLimites();
                await loadHistorico();

                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('limitesAtualizados', {
                        bubbles: false,
                        cancelable: false
                    }));
                }
            } else {
                toast.error(resultado.error || 'Erro ao redefinir limite', {
                    duration: 4000
                });
            }
        } catch (error) {
            console.error('Erro ao redefinir limite:', error);
            toast.error('Erro ao redefinir configuração', {
                duration: 4000
            });
        }
    };

    const handleEditar = (limite) => {
        setDepartamento(limite.departamento);
        setLimiteDiario(limite.limiteDiario.toString());
        setLimiteMensal(limite.limiteMensal.toString());
        setErrors({});
    };

    const getLimiteDepartamento = (departamentoNome) => {
        return limites.find(l => l.departamento === departamentoNome);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                                <Settings className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Limites de Horas Extras
                                </h2>
                                <p className="text-sm text-gray-400">
                                    Configure limites diários e mensais por departamento
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Formulário */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                                        <Clock className="w-5 h-5 text-orange-500" />
                                        <span>Configurar Limite</span>
                                    </h3>

                                    {/* Mensagem de Sucesso/Erro */}
                                    {saveMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className={`mb-4 p-4 rounded-lg border-2 ${saveSuccess
                                                ? 'bg-green-900/30 border-green-500 text-green-300'
                                                : 'bg-red-900/30 border-red-500 text-red-300'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                {saveSuccess ? (
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                                )}
                                                <p className="font-medium text-sm">{saveMessage}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="space-y-4">
                                        {/* Departamento */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Departamento *
                                            </label>
                                            <select
                                                value={departamento}
                                                onChange={(e) => {
                                                    setDepartamento(e.target.value);
                                                    const limite = getLimiteDepartamento(e.target.value);
                                                    if (limite) {
                                                        setLimiteDiario(limite.limiteDiario.toString());
                                                        setLimiteMensal(limite.limiteMensal.toString());
                                                    } else {
                                                        setLimiteDiario('');
                                                        setLimiteMensal('');
                                                    }
                                                    setErrors({});
                                                }}
                                                className={`w-full px-3 py-2 bg-gray-800 border ${errors.departamento ? 'border-red-500' : 'border-gray-600'
                                                    } rounded-lg text-white focus:border-orange-500 focus:outline-none`}
                                            >
                                                <option value="">Selecione um departamento</option>
                                                {departamentos.map((dept) => (
                                                    <option key={dept} value={dept}>
                                                        {dept}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.departamento && (
                                                <p className="mt-1 text-sm text-red-400">{errors.departamento}</p>
                                            )}
                                        </div>

                                        {/* Limite Diário */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Limite Diário (horas) *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="24"
                                                step="0.5"
                                                value={limiteDiario}
                                                onChange={(e) => {
                                                    setLimiteDiario(e.target.value);
                                                    setErrors(prev => ({ ...prev, limiteDiario: null }));
                                                }}
                                                className={`w-full px-3 py-2 bg-gray-800 border ${errors.limiteDiario ? 'border-red-500' : 'border-gray-600'
                                                    } rounded-lg text-white focus:border-orange-500 focus:outline-none`}
                                                placeholder="Ex: 2"
                                            />
                                            {errors.limiteDiario && (
                                                <p className="mt-1 text-sm text-red-400">{errors.limiteDiario}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">
                                                Máximo: 24 horas
                                            </p>
                                        </div>

                                        {/* Limite Mensal */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Limite Mensal (horas) *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="720"
                                                step="1"
                                                value={limiteMensal}
                                                onChange={(e) => {
                                                    setLimiteMensal(e.target.value);
                                                    setErrors(prev => ({ ...prev, limiteMensal: null }));
                                                }}
                                                className={`w-full px-3 py-2 bg-gray-800 border ${errors.limiteMensal ? 'border-red-500' : 'border-gray-600'
                                                    } rounded-lg text-white focus:border-orange-500 focus:outline-none`}
                                                placeholder="Ex: 40"
                                            />
                                            {errors.limiteMensal && (
                                                <p className="mt-1 text-sm text-red-400">{errors.limiteMensal}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">
                                                Máximo: 720 horas
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex space-x-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSalvar}
                                        disabled={isSaving}
                                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-5 h-5" />
                                        <span>{isSaving ? 'Salvando...' : 'Salvar Configuração'}</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleRedefinir}
                                        disabled={!departamento || isSaving}
                                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        <span>Redefinir</span>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Tabela de Limites */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                        <span>Limites Configurados</span>
                                    </h3>

                                    {loading ? (
                                        <div className="text-center py-8 text-gray-400">Carregando...</div>
                                    ) : limites.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                                            <p>Nenhum limite configurado</p>
                                            <p className="text-xs mt-1">Use os valores padrão: 2h diário / 40h mensal</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-700">
                                                        <th className="text-left py-3 px-4 text-gray-300 font-semibold">Departamento</th>
                                                        <th className="text-center py-3 px-4 text-gray-300 font-semibold">Diário</th>
                                                        <th className="text-center py-3 px-4 text-gray-300 font-semibold">Mensal</th>
                                                        <th className="text-center py-3 px-4 text-gray-300 font-semibold">Atualizado</th>
                                                        <th className="text-center py-3 px-4 text-gray-300 font-semibold">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {limites.map((limite) => (
                                                        <tr
                                                            key={limite.id || `limite-${limite.departamento}`}
                                                            className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                                                        >
                                                            <td className="py-3 px-4 text-white font-medium">
                                                                {limite.departamento}
                                                            </td>
                                                            <td className="py-3 px-4 text-center text-orange-400 font-semibold">
                                                                {limite.limiteDiario}h
                                                            </td>
                                                            <td className="py-3 px-4 text-center text-green-400 font-semibold">
                                                                {limite.limiteMensal}h
                                                            </td>
                                                            <td className="py-3 px-4 text-center text-gray-400 text-xs">
                                                                <div>{formatarData(limite.atualizadoEm)}</div>
                                                                <div className="text-gray-500 mt-1">
                                                                    por {limite.atualizadoPor}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <button
                                                                    onClick={() => handleEditar(limite)}
                                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs transition-colors"
                                                                >
                                                                    Editar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Histórico */}
                                {histórico.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                                            <Calendar className="w-5 h-5 text-blue-500" />
                                            <span>Últimas Alterações</span>
                                        </h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {histórico.map((log, index) => (
                                                <div
                                                    key={`${log.id}-${log.departamento}-${log.dataHora}-${index}`}
                                                    className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <div className={`w-2 h-2 rounded-full ${log.acao === 'criado' ? 'bg-green-500' :
                                                                log.acao === 'atualizado' ? 'bg-blue-500' :
                                                                    'bg-red-500'
                                                                }`} />
                                                            <span className="text-white text-sm font-medium">
                                                                {log.departamento}
                                                            </span>
                                                            <span className="text-gray-400 text-xs">
                                                                {log.acao === 'criado' ? 'Criado' :
                                                                    log.acao === 'atualizado' ? 'Atualizado' :
                                                                        'Removido'}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-500 text-xs">
                                                            {formatarData(log.dataHora)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Modal de Confirmação */}
            <ConfirmActionModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                    setPendingLimite(null);
                }}
                onConfirm={handleConfirmAction}
                title={confirmAction === 'salvar' ? 'Confirmar Alteração de Limites' : 'Confirmar Redefinição de Limites'}
                message={confirmMessage.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                        const text = line.replace(/\*\*/g, '');
                        return (
                            <React.Fragment key={index}>
                                <p className="font-semibold text-white text-lg mb-2">
                                    {text}
                                </p>
                            </React.Fragment>
                        );
                    } else if (line.startsWith('•')) {
                        return (
                            <p key={index} className="text-gray-300 ml-4 mb-1">
                                {line}
                            </p>
                        );
                    } else if (line.trim() === '') {
                        return <br key={index} />;
                    } else {
                        return (
                            <p key={index} className="text-gray-300 mb-2">
                                {line}
                            </p>
                        );
                    }
                })}
                confirmText={confirmAction === 'salvar' ? 'Confirmar e Salvar' : 'Confirmar e Redefinir'}
                cancelText="Cancelar"
                confirmColor="orange"
                icon={AlertCircle}
                loading={isSaving}
            />

            {/* Toaster específico para este modal - sobrescreve configuração global */}
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1f2937',
                        color: '#fff',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        padding: '12px 16px',
                        fontSize: '14px',
                        zIndex: 9999
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff'
                        },
                        style: {
                            background: '#10b981',
                            color: '#fff',
                            fontWeight: '500'
                        }
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff'
                        },
                        style: {
                            background: '#ef4444',
                            color: '#fff',
                            fontWeight: '500'
                        }
                    }
                }}
            />
        </AnimatePresence>
    );
};

export default LimitesExtrasModal;

