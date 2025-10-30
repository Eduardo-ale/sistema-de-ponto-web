/**
 * Central de Notificações Completa
 * Painel lateral com filtros, categorias e ações contextuais
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Bell,
    CheckCircle,
    AlertTriangle,
    Info,
    Clock,
    Trash2,
    Calendar,
    Search,
    Filter,
    User,
    Mail,
    FileText,
    TrendingUp,
    Settings,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCentralNotificacoes } from '../../hooks/useCentralNotificacoes';
import { useAuth } from '../../contexts/AuthContext';

const CentralNotificacoes = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const {
        notificacoes,
        naoLidas,
        loading,
        filtroTipo,
        filtroStatus,
        busca,
        setFiltroTipo,
        setFiltroStatus,
        setBusca,
        marcarComoLida,
        marcarTodasComoLidas,
        deletarNotificacao,
        recarregar,
        agruparPorData
    } = useCentralNotificacoes(user?.id);

    const [animandoIds, setAnimandoIds] = useState(new Set());

    // Obter ícone por tipo
    const getIconByType = (tipo) => {
        switch (tipo) {
            case 'escala':
                return <Calendar className="w-5 h-5" />;
            case 'justificativa':
                return <FileText className="w-5 h-5" />;
            case 'horas_extras':
                return <TrendingUp className="w-5 h-5" />;
            case 'sistema':
                return <Settings className="w-5 h-5" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    // Obter cor por tipo
    const getColorByType = (tipo) => {
        switch (tipo) {
            case 'escala':
                return 'text-blue-500 bg-blue-500/10';
            case 'justificativa':
                return 'text-purple-500 bg-purple-500/10';
            case 'horas_extras':
                return 'text-orange-500 bg-orange-500/10';
            case 'sistema':
                return 'text-gray-500 bg-gray-500/10';
            default:
                return 'text-gray-500 bg-gray-500/10';
        }
    };

    // Formatar data relativa
    const formatarDataRelativa = (dataISO) => {
        const data = new Date(dataISO);
        const agora = new Date();
        const diffMs = agora - data;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins} min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;
        return data.toLocaleDateString('pt-BR');
    };

    // Agrupar notificações por data
    const grupos = useMemo(() => agruparPorData(), [agruparPorData]);

    // Filtrar por busca
    const notificacoesFiltradas = useMemo(() => {
        if (!busca) return notificacoes;
        const buscaLower = busca.toLowerCase();
        return notificacoes.filter(n =>
            n.titulo?.toLowerCase().includes(buscaLower) ||
            n.mensagem?.toLowerCase().includes(buscaLower)
        );
    }, [notificacoes, busca]);

    // Renderizar grupo de notificações
    const renderGrupo = (titulo, notificacoesGrupo) => {
        if (notificacoesGrupo.length === 0) return null;

        return (
            <div key={titulo} className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-2">
                    {titulo}
                </h3>
                <div className="space-y-2">
                    {notificacoesGrupo.map((notificacao, index) => {
                        const isNew = notificacao.status === 'nao_lida';
                        const estaAnimando = animandoIds.has(notificacao.id);

                        return (
                            <motion.div
                                key={notificacao.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className={`
                                    relative p-4 rounded-lg border transition-all duration-200 cursor-pointer
                                    ${isNew
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                    }
                                    hover:shadow-md
                                `}
                                onClick={() => {
                                    if (!isNew) return;
                                    marcarComoLida(notificacao.id);
                                    setAnimandoIds(prev => new Set([...prev, notificacao.id]));
                                    setTimeout(() => {
                                        setAnimandoIds(prev => {
                                            const novo = new Set(prev);
                                            novo.delete(notificacao.id);
                                            return novo;
                                        });
                                    }, 500);
                                }}
                            >
                                <div className="flex items-start space-x-3">
                                    {/* Ícone */}
                                    <div className={`flex-shrink-0 p-2 rounded-lg ${getColorByType(notificacao.tipo)}`}>
                                        {getIconByType(notificacao.tipo)}
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-semibold mb-1 ${isNew ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {notificacao.titulo}
                                                </h4>
                                                <p className={`text-sm ${isNew ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {notificacao.mensagem}
                                                </p>
                                            </div>
                                            {isNew && !estaAnimando && (
                                                <div className="flex-shrink-0 ml-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info adicional */}
                                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center space-x-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatarDataRelativa(notificacao.data_criacao)}</span>
                                            </div>
                                            {notificacao.enviada_por_email && (
                                                <div className="flex items-center space-x-1">
                                                    <Mail className="w-3 h-3" />
                                                    <span>E-mail enviado</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Ações */}
                                        {notificacao.acoes && notificacao.acoes.length > 0 && (
                                            <div className="flex items-center space-x-2 mt-3">
                                                {notificacao.acoes.map((acao, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAcao(acao, notificacao);
                                                        }}
                                                        className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        {acao.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Link de ação */}
                                        {notificacao.link_acao && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (notificacao.link_acao) {
                                                        window.location.href = notificacao.link_acao;
                                                    }
                                                }}
                                                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                                            >
                                                <span>Ver detalhes</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Botão de deletar */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deletarNotificacao(notificacao.id);
                                            toast.success('Notificação removida');
                                        }}
                                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Handler de ações contextuais
    const handleAcao = async (acao, notificacao) => {
        try {
            // Em produção, estas ações seriam implementadas com chamadas de API
            switch (acao.acao) {
                case 'aprovar_justificativa':
                case 'aprovar_horas_extras':
                    toast.success(`Ação "${acao.label}" será executada`);
                    // TODO: Implementar lógica de aprovação
                    break;
                case 'recusar_justificativa':
                case 'recusar_horas_extras':
                    toast.error(`Ação "${acao.label}" será executada`);
                    // TODO: Implementar lógica de recusa
                    break;
                default:
                    toast.info(`Ação "${acao.label}" acionada`);
            }

            // Recarregar notificações após ação
            setTimeout(() => {
                recarregar();
            }, 1000);
        } catch (error) {
            console.error('Erro ao executar ação:', error);
            toast.error('Erro ao executar ação');
        }
    };

    // Filtrar notificações por busca
    const notificacoesRender = notificacoesFiltradas;

    // Reagrupar após filtros
    const gruposFiltrados = useMemo(() => {
        const grupos = {
            hoje: [],
            ontem: [],
            estaSemana: [],
            maisAntigas: []
        };

        const agora = new Date();
        const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        const ontem = new Date(hoje);
        ontem.setDate(ontem.getDate() - 1);
        const semanaPassada = new Date(hoje);
        semanaPassada.setDate(semanaPassada.getDate() - 7);

        notificacoesRender.forEach(notif => {
            const dataNotif = new Date(notif.data_criacao);

            if (dataNotif >= hoje) {
                grupos.hoje.push(notif);
            } else if (dataNotif >= ontem) {
                grupos.ontem.push(notif);
            } else if (dataNotif >= semanaPassada) {
                grupos.estaSemana.push(notif);
            } else {
                grupos.maisAntigas.push(notif);
            }
        });

        return grupos;
    }, [notificacoesRender]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <>
                {/* Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                />

                {/* Painel */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 border-l border-gray-200 dark:border-gray-700 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Central de Notificações
                                </h2>
                                {naoLidas > 0 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {naoLidas} não lida{naoLidas > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Filtros */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        {/* Busca */}
                        <div className="mb-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Buscar notificações..."
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Filtros rápidos */}
                        <div className="flex flex-wrap gap-2">
                            {/* Filtro por tipo */}
                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                className="flex-1 min-w-[120px] px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="todas">Todos os Tipos</option>
                                <option value="sistema">Sistema</option>
                                <option value="escala">Escala</option>
                                <option value="justificativa">Justificativa</option>
                                <option value="horas_extras">Horas Extras</option>
                            </select>

                            {/* Filtro por status */}
                            <select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                                className="flex-1 min-w-[120px] px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="todas">Todas</option>
                                <option value="nao_lidas">Não Lidas</option>
                                <option value="lidas">Lidas</option>
                            </select>
                        </div>

                        {/* Ações rápidas */}
                        <div className="flex items-center space-x-2 mt-3">
                            {naoLidas > 0 && (
                                <button
                                    onClick={() => {
                                        marcarTodasComoLidas();
                                        toast.success('Todas as notificações foram marcadas como lidas');
                                    }}
                                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Marcar Todas como Lidas</span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (window.confirm('Deseja realmente limpar todas as notificações?')) {
                                        // TODO: Implementar limpeza de todas as notificações
                                        toast.success('Notificações limpas');
                                    }
                                }}
                                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Limpar</span>
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : notificacoesRender.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <Bell className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Nenhuma notificação
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Você está em dia! ✨
                                </p>
                            </div>
                        ) : (
                            <>
                                {gruposFiltrados.hoje.length > 0 && renderGrupo('Hoje', gruposFiltrados.hoje)}
                                {gruposFiltrados.ontem.length > 0 && renderGrupo('Ontem', gruposFiltrados.ontem)}
                                {gruposFiltrados.estaSemana.length > 0 && renderGrupo('Esta Semana', gruposFiltrados.estaSemana)}
                                {gruposFiltrados.maisAntigas.length > 0 && renderGrupo('Mais Antigas', gruposFiltrados.maisAntigas)}
                            </>
                        )}
                    </div>
                </motion.div>
            </>
        </AnimatePresence>
    );
};

export default CentralNotificacoes;

