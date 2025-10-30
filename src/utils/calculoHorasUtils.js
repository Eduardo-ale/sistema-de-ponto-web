/**
 * Utilitários para cálculos de horas
 */

import horasConfig from '../config/horasConfig';

/**
 * Converte horário HH:mm para minutos desde meia-noite
 */
export function horaParaMinutos(hora) {
    if (!hora || typeof hora !== 'string') return 0;
    const [horas, minutos] = hora.split(':').map(Number);
    return (horas || 0) * 60 + (minutos || 0);
}

/**
 * Converte minutos desde meia-noite para formato HH:mm
 */
export function minutosParaHora(minutos) {
    if (typeof minutos !== 'number' || minutos < 0) return '00:00';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Converte horas decimais para formato HH:mm
 */
export function horasDecimaisParaHora(horasDecimais) {
    if (typeof horasDecimais !== 'number') return '00:00';
    const horas = Math.floor(horasDecimais);
    const minutos = Math.round((horasDecimais - horas) * 60);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

/**
 * Converte formato HH:mm para horas decimais
 */
export function horaParaHorasDecimais(hora) {
    const minutos = horaParaMinutos(hora);
    return minutos / 60;
}

/**
 * Calcula diferença entre dois horários em minutos
 */
export function diferencaMinutos(horaInicio, horaFim) {
    const inicio = horaParaMinutos(horaInicio);
    let fim = horaParaMinutos(horaFim);

    // Se o fim é menor que o início, assume que é do dia seguinte
    if (fim < inicio) {
        fim += 24 * 60; // Adiciona 24 horas
    }

    return fim - inicio;
}

/**
 * Calcula horas trabalhadas considerando intervalo
 */
export function calcularHorasTrabalhadas(entrada, saida, intervaloInicio = null, intervaloFim = null) {
    if (!entrada || !saida) return 0;

    const totalMinutos = diferencaMinutos(entrada, saida);

    // Subtrair intervalo de almoço se fornecido
    if (intervaloInicio && intervaloFim) {
        const intervaloMinutos = diferencaMinutos(intervaloInicio, intervaloFim);
        return Math.max(0, (totalMinutos - intervaloMinutos) / 60);
    }

    return totalMinutos / 60;
}

/**
 * Verifica se uma data é feriado
 */
export function isFeriado(data) {
    if (!data) return false;
    const date = new Date(data);
    const mesDia = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return horasConfig.FERIADOS_NACIONAIS.includes(mesDia);
}

/**
 * Verifica se é final de semana
 */
export function isFinalSemana(data) {
    if (!data) return false;
    const date = new Date(data);
    return horasConfig.FINAIS_DE_SEMANA.includes(date.getDay());
}

/**
 * Verifica se é feriado ou final de semana
 */
export function isDiaEspecial(data) {
    return isFeriado(data) || isFinalSemana(data);
}

/**
 * Classifica período do dia (diurno ou noturno)
 */
export function classificarPeriodo(hora) {
    if (!hora) return 'diurno';
    const minutos = horaParaMinutos(hora);
    const horaNumero = Math.floor(minutos / 60);

    // Diurno: 06h às 22h
    if (horaNumero >= horasConfig.HORARIO_INICIO_DIURNO && horaNumero < horasConfig.HORARIO_FIM_DIURNO) {
        return 'diurno';
    }

    // Noturno: 22h às 06h
    return 'noturno';
}

/**
 * Calcula horas extras diurnas e noturnas
 */
export function calcularHorasExtrasDetalhadas(entrada, saida, horasTrabalhadas, jornadaContratual, data) {
    const horasExtras = horasTrabalhadas - jornadaContratual;

    if (horasExtras <= 0) {
        return {
            total: 0,
            diurnas: 0,
            noturnas: 0,
            feriado: 0
        };
    }

    const isFeriadoData = isFeriado(data);
    const periodoEntrada = classificarPeriodo(entrada);
    const periodoSaida = classificarPeriodo(saida);

    // Se é feriado, todas as horas extras são de feriado (100%)
    if (isFeriadoData) {
        return {
            total: horasExtras,
            diurnas: 0,
            noturnas: 0,
            feriado: horasExtras
        };
    }

    // Calcular proporção diurna/noturna
    let horasDiurnas = 0;
    let horasNoturnas = 0;

    // Se entrada e saída estão no mesmo período
    if (periodoEntrada === periodoSaida) {
        if (periodoEntrada === 'diurno') {
            horasDiurnas = horasExtras;
        } else {
            horasNoturnas = horasExtras;
        }
    } else {
        // Período misto - calcular proporção
        const minutosEntrada = horaParaMinutos(entrada);
        const minutosSaida = horaParaMinutos(saida);

        // Calcular horas diurnas e noturnas baseado nos horários
        const inicioDiurno = horaParaMinutos(`${horasConfig.HORARIO_INICIO_DIURNO}:00`);
        const fimDiurno = horaParaMinutos(`${horasConfig.HORARIO_FIM_DIURNO}:00`);

        if (minutosEntrada < fimDiurno) {
            horasDiurnas = Math.min(horasExtras, (fimDiurno - Math.max(minutosEntrada, inicioDiurno)) / 60);
        }

        horasNoturnas = Math.max(0, horasExtras - horasDiurnas);
    }

    return {
        total: horasExtras,
        diurnas: horasDiurnas,
        noturnas: horasNoturnas,
        feriado: 0
    };
}

/**
 * Verifica atraso considerando tolerância
 */
export function verificarAtraso(entradaEsperada, entradaReal) {
    if (!entradaEsperada || !entradaReal) return { atrasado: false, minutos: 0 };

    const esperada = horaParaMinutos(entradaEsperada);
    const real = horaParaMinutos(entradaReal);
    const diferenca = real - esperada;

    const atrasado = diferenca > horasConfig.TOLERANCIA_ATRASO_MINUTOS;

    return {
        atrasado,
        minutos: Math.max(0, diferenca)
    };
}

/**
 * Calcula banco de horas
 */
export function calcularBancoHoras(horasTrabalhadas, jornadaContratual) {
    const diferenca = horasTrabalhadas - jornadaContratual;

    return {
        positivo: diferenca > 0 ? diferenca : 0,
        negativo: diferenca < 0 ? Math.abs(diferenca) : 0,
        saldo: diferenca
    };
}

/**
 * Formata horas para exibição
 */
export function formatarHoras(horas) {
    if (typeof horas !== 'number') return '0h 0min';
    const horasInt = Math.floor(horas);
    const minutosInt = Math.round((horas - horasInt) * 60);

    if (minutosInt === 0) {
        return `${horasInt}h`;
    }
    return `${horasInt}h ${minutosInt}min`;
}

/**
 * Valida horário
 */
export function validarHorario(horario) {
    if (!horario || typeof horario !== 'string') return false;
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(horario);
}

/**
 * Valida formato de data
 */
export function validarData(data) {
    if (!data) return false;
    const date = new Date(data);
    return date instanceof Date && !isNaN(date);
}

/**
 * Obtém início e fim do período
 */
export function obterPeriodo(periodo, dataReferencia = new Date()) {
    const hoje = new Date(dataReferencia);

    switch (periodo) {
        case 'hoje':
        case 'dia':
            const inicioHoje = new Date(hoje);
            inicioHoje.setHours(0, 0, 0, 0);
            const fimHoje = new Date(hoje);
            fimHoje.setHours(23, 59, 59, 999);
            return { inicio: inicioHoje, fim: fimHoje };

        case 'semana':
            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
            inicioSemana.setHours(0, 0, 0, 0);

            const fimSemana = new Date(inicioSemana);
            fimSemana.setDate(inicioSemana.getDate() + 6);
            fimSemana.setHours(23, 59, 59, 999);

            return { inicio: inicioSemana, fim: fimSemana };

        case 'mes':
            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            inicioMes.setHours(0, 0, 0, 0);

            const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            fimMes.setHours(23, 59, 59, 999);

            return { inicio: inicioMes, fim: fimMes };

        case '7dias':
            const fim7Dias = new Date(hoje);
            fim7Dias.setHours(23, 59, 59, 999);
            const inicio7Dias = new Date(fim7Dias);
            inicio7Dias.setDate(inicio7Dias.getDate() - 7);
            inicio7Dias.setHours(0, 0, 0, 0);
            return { inicio: inicio7Dias, fim: fim7Dias };

        case '30dias':
            const fim30Dias = new Date(hoje);
            fim30Dias.setHours(23, 59, 59, 999);
            const inicio30Dias = new Date(fim30Dias);
            inicio30Dias.setDate(inicio30Dias.getDate() - 30);
            inicio30Dias.setHours(0, 0, 0, 0);
            return { inicio: inicio30Dias, fim: fim30Dias };

        default:
            const inicioDefault = new Date(hoje);
            inicioDefault.setHours(0, 0, 0, 0);
            const fimDefault = new Date(hoje);
            fimDefault.setHours(23, 59, 59, 999);
            return { inicio: inicioDefault, fim: fimDefault };
    }
}

/**
 * Calcula dias úteis entre duas datas
 */
export function calcularDiasUteis(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) return 0;

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    let diasUteis = 0;

    for (let data = new Date(inicio); data <= fim; data.setDate(data.getDate() + 1)) {
        if (!isDiaEspecial(data)) {
            diasUteis++;
        }
    }

    return diasUteis;
}

