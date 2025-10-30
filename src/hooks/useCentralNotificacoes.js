/**
 * Hook customizado para gerenciar Central de Notificações
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import notificacoesService from '../services/notificacoesService';

export function useCentralNotificacoes(usuarioId) {
    const [notificacoes, setNotificacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState('todas');
    const [filtroStatus, setFiltroStatus] = useState('todas');
    const [busca, setBusca] = useState('');

    // Ref para evitar múltiplas atualizações simultâneas
    const atualizandoRef = useRef(false);

    // Carregar notificações
    const carregarNotificacoes = useCallback(async () => {
        if (!usuarioId || atualizandoRef.current) return;

        try {
            atualizandoRef.current = true;
            setLoading(true);

            const filtros = {
                usuario_id: usuarioId,
                busca: busca || undefined
            };

            if (filtroTipo !== 'todas') {
                filtros.tipo = filtroTipo;
            }

            if (filtroStatus !== 'todas') {
                filtros.status = filtroStatus;
            }

            const dados = notificacoesService.buscarNotificacoes(filtros);
            setNotificacoes(dados);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
            setNotificacoes([]);
        } finally {
            setLoading(false);
            atualizandoRef.current = false;
        }
    }, [usuarioId, filtroTipo, filtroStatus, busca]);

    // Carregar inicialmente e quando filtros mudarem (com debounce)
    useEffect(() => {
        if (!usuarioId) return;

        let timeoutId;

        const loadWithDebounce = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                carregarNotificacoes();
            }, 500); // Debounce de 500ms
        };

        loadWithDebounce();

        return () => {
            clearTimeout(timeoutId);
        };
    }, [usuarioId, filtroTipo, filtroStatus, busca]); // Remover carregarNotificacoes das dependências

    // Escutar eventos de nova notificação (com throttling e debounce)
    useEffect(() => {
        if (!usuarioId) return;

        let lastCallTime = 0;
        let timeoutId = null;
        const THROTTLE_DELAY = 2000; // 2 segundos entre atualizações
        const DEBOUNCE_DELAY = 1000; // 1 segundo de debounce

        const handleAtualizacao = () => {
            const now = Date.now();
            // Throttle: ignorar se muito recente
            if (now - lastCallTime < THROTTLE_DELAY) {
                return;
            }
            lastCallTime = now;

            // Debounce: aguardar antes de executar
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (usuarioId) {
                    carregarNotificacoes();
                }
            }, DEBOUNCE_DELAY);
        };

        const handleNovaNotificacao = (event) => {
            const { notificacao } = event.detail;
            if (notificacao.usuario_destinatario_id === usuarioId ||
                String(notificacao.usuario_destinatario_id) === String(usuarioId)) {
                handleAtualizacao();
            }
        };

        const handleNotificacaoAtualizada = handleAtualizacao;
        const handleTodasNotificacoesLidas = (event) => {
            if (event.detail.usuarioId === usuarioId ||
                String(event.detail.usuarioId) === String(usuarioId)) {
                handleAtualizacao();
            }
        };
        const handleNotificacaoDeletada = handleAtualizacao;

        window.addEventListener('novaNotificacao', handleNovaNotificacao);
        window.addEventListener('notificacaoAtualizada', handleNotificacaoAtualizada);
        window.addEventListener('todasNotificacoesLidas', handleTodasNotificacoesLidas);
        window.addEventListener('notificacaoDeletada', handleNotificacaoDeletada);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('novaNotificacao', handleNovaNotificacao);
            window.removeEventListener('notificacaoAtualizada', handleNotificacaoAtualizada);
            window.removeEventListener('todasNotificacoesLidas', handleTodasNotificacoesLidas);
            window.removeEventListener('notificacaoDeletada', handleNotificacaoDeletada);
        };
    }, [usuarioId]); // Apenas usuarioId como dependência

    // Marcar como lida
    const marcarComoLida = useCallback(async (id) => {
        const resultado = notificacoesService.marcarComoLida(id, usuarioId);
        if (resultado.success) {
            await carregarNotificacoes();
        }
        return resultado;
    }, [usuarioId, carregarNotificacoes]);

    // Marcar todas como lidas
    const marcarTodasComoLidas = useCallback(async () => {
        const resultado = notificacoesService.marcarTodasComoLidas(usuarioId);
        if (resultado.success) {
            await carregarNotificacoes();
        }
        return resultado;
    }, [usuarioId, carregarNotificacoes]);

    // Deletar notificação
    const deletarNotificacao = useCallback(async (id) => {
        const resultado = notificacoesService.deletarNotificacao(id, usuarioId);
        if (resultado.success) {
            await carregarNotificacoes();
        }
        return resultado;
    }, [usuarioId, carregarNotificacoes]);

    // Obter contagem de não lidas
    const naoLidas = notificacoes.filter(n => n.status === 'nao_lida');

    // Agrupar por data
    const agruparPorData = useCallback(() => {
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

        notificacoes.forEach(notif => {
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
    }, [notificacoes]);

    return {
        notificacoes,
        naoLidas: naoLidas.length,
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
        recarregar: carregarNotificacoes,
        agruparPorData
    };
}

export default useCentralNotificacoes;

