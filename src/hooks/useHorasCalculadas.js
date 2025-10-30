/**
 * Hook customizado para gerenciar cálculos de horas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import horasService from '../services/horasService';

/**
 * Hook para buscar horas calculadas de um usuário
 */
export function useHorasUsuario(usuarioId, periodo = 'mes', dataReferencia = null, dataFim = null, mesAno = null) {
    const [horas, setHoras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estabilizar dataReferencia - usar timestamp para comparação
    const dataRefTimestamp = dataReferencia ? dataReferencia.getTime() : new Date().getTime();
    const dataFimTimestamp = dataFim ? (typeof dataFim === 'string' ? new Date(dataFim).getTime() : dataFim.getTime()) : null;

    // Ref para comparar dados anteriores e evitar atualizações desnecessárias
    const dadosAnterioresRef = useRef(null);

    const loadHoras = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Recriar Date apenas quando necessário
            const dataRef = dataReferencia || new Date();
            const dataFimObj = dataFim ? (typeof dataFim === 'string' ? new Date(dataFim) : dataFim) : null;

            // Se não há usuarioId, buscar todos os cálculos
            const calculos = usuarioId
                ? await horasService.getCalculosUsuario(usuarioId, periodo, dataRef)
                : await horasService.getTodosCalculos(periodo, dataRef, dataFimObj, mesAno);

            // Comparar com dados anteriores para evitar atualizações desnecessárias
            const dadosAtualizadosJson = JSON.stringify(calculos);
            if (dadosAnterioresRef.current === dadosAtualizadosJson) {
                // Dados idênticos, não atualizar estado
                setLoading(false);
                return;
            }

            dadosAnterioresRef.current = dadosAtualizadosJson;
            setHoras(calculos);
        } catch (err) {
            console.warn('Aviso ao carregar horas:', err.message);
            setError(null); // Não definir erro para não quebrar UI
            setHoras([]);
        } finally {
            setLoading(false);
        }
    }, [usuarioId, periodo, dataRefTimestamp, dataFimTimestamp, mesAno]);

    useEffect(() => {
        loadHoras();
    }, [usuarioId, periodo, dataRefTimestamp, dataFimTimestamp, mesAno, loadHoras]);

    // Usar ref para manter loadHoras atualizado sem causar recriação de listeners
    const loadHorasRef = useRef(loadHoras);

    useEffect(() => {
        loadHorasRef.current = loadHoras;
    }, [loadHoras]);

    // Event listeners separados para evitar recriação constante (com throttling muito agressivo)
    useEffect(() => {
        let isMounted = true;
        let timeoutId;
        let lastCallTime = 0;
        const THROTTLE_DELAY = 10000; // 10 segundos entre atualizações (aumentado para evitar atualizações constantes)
        const DEBOUNCE_DELAY = 3000; // 3 segundos de debounce

        // Ouvir eventos de atualização com throttling muito agressivo
        const handleAtualizacao = () => {
            const now = Date.now();
            // Throttle: só atualizar se passou pelo menos 10 segundos desde última atualização
            if (now - lastCallTime < THROTTLE_DELAY) {
                return; // Ignorar se muito recente
            }
            lastCallTime = now;

            if (!isMounted) return;

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (isMounted && loadHorasRef.current) {
                    loadHorasRef.current().catch(() => { });
                }
            }, DEBOUNCE_DELAY);
        };

        const handleMarcacoesAtualizadas = handleAtualizacao;
        const handleCalculosAtualizados = handleAtualizacao;

        window.addEventListener('marcacoesAtualizadas', handleMarcacoesAtualizadas, { passive: true });
        window.addEventListener('calculosAtualizados', handleCalculosAtualizados, { passive: true });

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            window.removeEventListener('marcacoesAtualizadas', handleMarcacoesAtualizadas);
            window.removeEventListener('calculosAtualizados', handleCalculosAtualizados);
        };
    }, []); // Listeners apenas uma vez - não recriar

    return {
        horas,
        loading,
        error,
        refetch: loadHoras
    };
}

/**
 * Hook para calcular horas de uma marcação
 */
export function useCalcularHoras() {
    const [calculando, setCalculando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState(null);

    const calcular = useCallback(async (marcacao) => {
        try {
            setCalculando(true);
            setError(null);
            const resultado = await horasService.calcularHorasDia(marcacao);

            if (resultado.success) {
                setResultado(resultado.data);
                return resultado;
            } else {
                throw new Error(resultado.error || 'Erro ao calcular horas');
            }
        } catch (err) {
            console.error('Erro ao calcular horas:', err);
            setError(err.message);
            throw err;
        } finally {
            setCalculando(false);
        }
    }, []);

    return {
        calcular,
        calculando,
        resultado,
        error
    };
}

/**
 * Hook para buscar saldo do banco de horas
 */
export function useSaldoBancoHoras(usuarioId, periodo = 'mes') {
    const [saldo, setSaldo] = useState({
        saldo: 0,
        bancoPositivo: 0,
        bancoNegativo: 0,
        horasExtrasTotal: 0,
        horasTrabalhadasTotal: 0,
        diasTrabalhados: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadSaldo = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const saldoData = await horasService.calcularSaldo(usuarioId, periodo);
            setSaldo(saldoData);
        } catch (err) {
            console.error('Erro ao carregar saldo:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [usuarioId, periodo]);

    useEffect(() => {
        if (usuarioId) {
            loadSaldo();
        }
    }, [usuarioId, periodo, loadSaldo]);

    return {
        saldo,
        loading,
        error,
        refetch: loadSaldo
    };
}

/**
 * Hook para buscar totais agregados (Dashboard)
 */
export function useTotaisHoras(periodo = 'mes') {
    const [totais, setTotais] = useState({
        totalHoras: 0,
        totalExtras: 0,
        bancoHoras: { positivo: 0, negativo: 0, saldo: 0 },
        totalAtrasos: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadTotais = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const totaisData = await horasService.getTotaisAgregados(periodo);
            // Sempre definir totais, mesmo se vazio (o serviço retorna zeros)
            setTotais(totaisData || {
                totalHoras: 0,
                totalExtras: 0,
                bancoHoras: { positivo: 0, negativo: 0, saldo: 0 },
                totalAtrasos: 0
            });
        } catch (err) {
            // Erro silencioso - não quebra o Dashboard
            setError(null); // Não definir erro para não quebrar UI
            // Retornar valores padrão
            setTotais({
                totalHoras: 0,
                totalExtras: 0,
                bancoHoras: { positivo: 0, negativo: 0, saldo: 0 },
                totalAtrasos: 0
            });
        } finally {
            setLoading(false);
        }
    }, [periodo]);

    // Usar ref para manter loadTotais atualizado sem causar recriação de listeners
    const loadTotaisRef = useRef(loadTotais);

    useEffect(() => {
        loadTotaisRef.current = loadTotais;
    }, [loadTotais]);

    useEffect(() => {
        // Carregar inicialmente apenas
        loadTotais();

        // REMOVIDO: Intervalo automático - atualizar apenas sob demanda via eventos
        // const interval = setInterval(() => {
        //     if (loadTotaisRef.current) {
        //         loadTotaisRef.current();
        //     }
        // }, 300000);

        // Throttling muito agressivo para evitar múltiplas chamadas
        let timeoutId;
        let lastCallTime = 0;
        const THROTTLE_DELAY = 10000; // 10 segundos entre atualizações
        const DEBOUNCE_DELAY = 3000; // 3 segundos de debounce

        // Ouvir eventos de atualização com throttling muito agressivo
        const handleAtualizacao = () => {
            const now = Date.now();
            // Throttle: só atualizar se passou pelo menos 10 segundos
            if (now - lastCallTime < THROTTLE_DELAY) {
                return; // Ignorar se muito recente
            }
            lastCallTime = now;

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (loadTotaisRef.current) {
                    loadTotaisRef.current();
                }
            }, DEBOUNCE_DELAY);
        };

        window.addEventListener('marcacoesAtualizadas', handleAtualizacao, { passive: true });
        window.addEventListener('calculosAtualizados', handleAtualizacao, { passive: true });
        window.addEventListener('limitesAtualizados', handleAtualizacao, { passive: true });

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('marcacoesAtualizadas', handleAtualizacao);
            window.removeEventListener('calculosAtualizados', handleAtualizacao);
            window.removeEventListener('limitesAtualizados', handleAtualizacao);
        };
    }, [periodo]); // Apenas período nas dependências - usar ref para loadTotais

    return {
        totais,
        loading,
        error,
        refetch: loadTotais
    };
}

/**
 * Hook para recalcular período
 */
export function useRecalcularPeriodo() {
    const [recalculando, setRecalculando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState(null);

    const recalcular = useCallback(async (usuarioId, dataInicio, dataFim) => {
        try {
            setRecalculando(true);
            setError(null);
            const resultado = await horasService.recalcularPeriodo(usuarioId, dataInicio, dataFim);

            if (resultado.success) {
                setResultado(resultado);
                return resultado;
            } else {
                throw new Error(resultado.error || 'Erro ao recalcular período');
            }
        } catch (err) {
            console.error('Erro ao recalcular período:', err);
            setError(err.message);
            throw err;
        } finally {
            setRecalculando(false);
        }
    }, []);

    return {
        recalcular,
        recalculando,
        resultado,
        error
    };
}

/**
 * Hook para buscar logs de cálculo
 */
export function useLogsCalculo(marcacaoId = null) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const logsData = await horasService.getLogsCalculo(marcacaoId);
            setLogs(logsData);
        } catch (err) {
            console.error('Erro ao carregar logs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [marcacaoId]);

    useEffect(() => {
        loadLogs();
    }, [marcacaoId, loadLogs]);

    return {
        logs,
        loading,
        error,
        refetch: loadLogs
    };
}

