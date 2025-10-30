/**
 * Configurações para o sistema de cálculo de horas
 */

// Tolerância de atraso em minutos (padrão: 5 minutos)
export const TOLERANCIA_ATRASO_MINUTOS = 5;

// Jornada contratual padrão em horas
export const JORNADA_DIARIA_PADRAO = 8; // 8 horas por dia
export const JORNADA_SEMANAL_PADRAO = 40; // 40 horas por semana

// Intervalo padrão de almoço em minutos
export const INTERVALO_ALMOCO_PADRAO = 60; // 1 hora

// Regras de horas extras
export const PERCENTUAL_EXTRA_DIURNA = 50; // 50% sobre horas normais
export const PERCENTUAL_EXTRA_NOTURNA = 20; // 20% adicional sobre extra diurna (total: 70%)
export const PERCENTUAL_EXTRA_FERIADO = 100; // 100% sobre horas normais

// Horários para classificação de horas extras
export const HORARIO_INICIO_DIURNO = 6; // 06:00
export const HORARIO_FIM_DIURNO = 22; // 22:00
export const HORARIO_INICIO_NOTURNO = 22; // 22:00
export const HORARIO_FIM_NOTURNO = 6; // 06:00 (do dia seguinte)

// Feriados nacionais (formato: MM-DD)
export const FERIADOS_NACIONAIS = [
    '01-01', // Ano Novo
    '02-20', // Carnaval (ajustar conforme ano)
    '02-21', // Carnaval (ajustar conforme ano)
    '04-21', // Tiradentes
    '05-01', // Dia do Trabalhador
    '09-07', // Independência
    '10-12', // Nossa Senhora Aparecida
    '11-02', // Finados
    '11-15', // Proclamação da República
    '11-20', // Dia da Consciência Negra (alguns estados)
    '12-25', // Natal
    '12-31'  // Réveillon
];

// Dias da semana (0 = Domingo, 6 = Sábado)
export const FINAIS_DE_SEMANA = [0, 6]; // Domingo e Sábado

// Configurações de exibição
export const FORMATO_HORA = 'HH:mm';
export const FORMATO_DATA = 'YYYY-MM-DD';
export const FORMATO_DATA_EXIBICAO = 'DD/MM/YYYY';

// Configurações de período para cálculos
export const PERIODOS = {
    DIA: 'dia',
    SEMANA: 'semana',
    MES: 'mes',
    PERIODO_CUSTOMIZADO: 'custom'
};

// Configuração de cache (em minutos)
export const CACHE_CALCULOS_MINUTOS = 5;

// Validações
export const MIN_HORAS_TRABALHADAS = 0;
export const MAX_HORAS_TRABALHADAS = 16; // Máximo de horas por dia (segurança)

export default {
    TOLERANCIA_ATRASO_MINUTOS,
    JORNADA_DIARIA_PADRAO,
    JORNADA_SEMANAL_PADRAO,
    INTERVALO_ALMOCO_PADRAO,
    PERCENTUAL_EXTRA_DIURNA,
    PERCENTUAL_EXTRA_NOTURNA,
    PERCENTUAL_EXTRA_FERIADO,
    HORARIO_INICIO_DIURNO,
    HORARIO_FIM_DIURNO,
    HORARIO_INICIO_NOTURNO,
    HORARIO_FIM_NOTURNO,
    FERIADOS_NACIONAIS,
    FINAIS_DE_SEMANA,
    FORMATO_HORA,
    FORMATO_DATA,
    FORMATO_DATA_EXIBICAO,
    PERIODOS,
    CACHE_CALCULOS_MINUTOS,
    MIN_HORAS_TRABALHADAS,
    MAX_HORAS_TRABALHADAS
};

