/**
 * Utilitários para validação e verificação de limites de horas extras
 */

/**
 * Valida se um valor de limite diário é válido
 */
export function validarLimiteDiario(valor) {
    const num = Number(valor);

    if (isNaN(num)) {
        return {
            valido: false,
            erro: 'Valor deve ser um número'
        };
    }

    if (num < 0) {
        return {
            valido: false,
            erro: 'Valor não pode ser negativo'
        };
    }

    if (num > 24) {
        return {
            valido: false,
            erro: 'Limite diário máximo é 24 horas'
        };
    }

    return {
        valido: true,
        valor: num
    };
}

/**
 * Valida se um valor de limite mensal é válido
 */
export function validarLimiteMensal(valor) {
    const num = Number(valor);

    if (isNaN(num)) {
        return {
            valido: false,
            erro: 'Valor deve ser um número'
        };
    }

    if (num < 0) {
        return {
            valido: false,
            erro: 'Valor não pode ser negativo'
        };
    }

    if (num > 720) {
        return {
            valido: false,
            erro: 'Limite mensal máximo é 720 horas'
        };
    }

    return {
        valido: true,
        valor: num
    };
}

/**
 * Formata horas para exibição (ex: 2.5 → "2h 30min")
 */
export function formatarHorasExtras(horas) {
    if (typeof horas !== 'number' || isNaN(horas)) {
        return '0h';
    }

    const horasInt = Math.floor(horas);
    const minutos = Math.round((horas - horasInt) * 60);

    if (minutos === 0) {
        return `${horasInt}h`;
    }

    return `${horasInt}h ${minutos}min`;
}

/**
 * Calcula horas extras acumuladas no mês
 */
export async function calcularAcumuladoMensal(usuarioId, mes, ano) {
    try {
        const limitesExtrasService = (await import('../services/limitesExtrasService')).default;
        return await limitesExtrasService.calcularHorasExtrasMensais(usuarioId, mes, ano);
    } catch (error) {
        console.error('Erro ao calcular acumulado mensal:', error);
        return 0;
    }
}

/**
 * Verifica se o limite está próximo de ser atingido (80% do limite)
 */
export function verificarLimiteProximo(horasAtuais, limite, percentual = 0.8) {
    if (!limite || limite === 0) {
        return false;
    }

    const percentualUtilizado = horasAtuais / limite;
    return percentualUtilizado >= percentual;
}

/**
 * Obtém status do limite (ok, proximo, excedido)
 */
export function obterStatusLimite(horasAtuais, limite) {
    if (!limite || limite === 0) {
        return 'sem_limite';
    }

    if (horasAtuais >= limite) {
        return 'excedido';
    }

    if (verificarLimiteProximo(horasAtuais, limite)) {
        return 'proximo';
    }

    return 'ok';
}

/**
 * Formata data para exibição
 */
export function formatarData(dataISO) {
    if (!dataISO) {
        return '-';
    }

    try {
        const data = new Date(dataISO);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return '-';
    }
}

