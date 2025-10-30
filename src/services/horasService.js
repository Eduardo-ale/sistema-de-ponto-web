/**
 * Serviço para cálculo automático de horas trabalhadas, extras, banco de horas e saldo
 */

import {
    calcularHorasTrabalhadas,
    calcularHorasExtrasDetalhadas,
    calcularBancoHoras,
    verificarAtraso,
    isFeriado,
    isFinalSemana,
    formatarHoras,
    obterPeriodo,
    validarHorario,
    validarData
} from '../utils/calculoHorasUtils';
import horasConfig from '../config/horasConfig';

class LocalStorageService {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    }

    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return null;
        }
    }
}

class HorasService {
    constructor() {
        this.HORAS_CALCULADAS_KEY = 'horas_calculadas';
        this.LOGS_CALCULO_KEY = 'logs_calculo';
        this.FERIADOS_KEY = 'feriados_customizados';
    }

    /**
     * Buscar dados do colaborador (mock ou do sistema)
     */
    async getColaboradorDados(colaboradorEmail, colaboradorNome) {
        try {
            // Buscar no localStorage de usuários
            const users = LocalStorageService.load('users') || [];
            const colaborador = users.find(
                u => u.email === colaboradorEmail || u.name === colaboradorNome || u.nome === colaboradorNome
            );

            if (colaborador) {
                return {
                    jornadaDiaria: this.calcularJornadaDiaria(colaborador),
                    jornadaSemanal: horasConfig.JORNADA_SEMANAL_PADRAO,
                    horaEntrada: colaborador.workStartTime || '08:00',
                    horaSaida: colaborador.workEndTime || '17:00'
                };
            }

            // Valores padrão
            return {
                jornadaDiaria: horasConfig.JORNADA_DIARIA_PADRAO,
                jornadaSemanal: horasConfig.JORNADA_SEMANAL_PADRAO,
                horaEntrada: '08:00',
                horaSaida: '17:00'
            };
        } catch (error) {
            console.error('Erro ao buscar dados do colaborador:', error);
            return {
                jornadaDiaria: horasConfig.JORNADA_DIARIA_PADRAO,
                jornadaSemanal: horasConfig.JORNADA_SEMANAL_PADRAO,
                horaEntrada: '08:00',
                horaSaida: '17:00'
            };
        }
    }

    /**
     * Calcula jornada diária baseada nos horários do colaborador
     */
    calcularJornadaDiaria(colaborador) {
        if (!colaborador || !colaborador.workStartTime || !colaborador.workEndTime) {
            return horasConfig.JORNADA_DIARIA_PADRAO;
        }

        const entrada = colaborador.workStartTime;
        const saida = colaborador.workEndTime;

        // Assumir 1 hora de intervalo padrão
        const horas = calcularHorasTrabalhadas(entrada, saida, '12:00', '13:00');
        return Math.max(horas, horasConfig.JORNADA_DIARIA_PADRAO);
    }

    /**
     * Busca departamento do colaborador
     */
    async getDepartamentoColaborador(colaboradorEmail, colaboradorNome) {
        try {
            const users = LocalStorageService.load('users') || [];
            const colaborador = users.find(
                u => u.email === colaboradorEmail || u.name === colaboradorNome || u.nome === colaboradorNome
            );

            if (colaborador && colaborador.department) {
                return colaborador.department;
            }

            // Verificar se há departamento na marcação
            return null;
        } catch (error) {
            console.error('Erro ao buscar departamento:', error);
            return null;
        }
    }

    /**
     * Aplica limites de horas extras configurados
     */
    async aplicarLimitesHorasExtras(departamento, horasExtrasDia, data, usuarioId) {
        try {
            if (!departamento) {
                return {
                    limiteDiarioExcedido: false,
                    limiteMensalExcedido: false,
                    limiteDiario: null,
                    limiteMensal: null,
                    horasExtrasMensais: 0
                };
            }

            // Importar dinamicamente para evitar dependência circular
            const limitesExtrasService = (await import('./limitesExtrasService')).default;

            // Verificar limite diário
            const verificacaoDiario = await limitesExtrasService.verificarLimiteDiario(
                departamento,
                horasExtrasDia
            );

            // Calcular mês/ano da data
            const dataObj = new Date(data);
            const mes = dataObj.getMonth() + 1;
            const ano = dataObj.getFullYear();

            // Buscar horas extras mensais acumuladas
            const horasExtrasMensais = await limitesExtrasService.calcularHorasExtrasMensais(
                usuarioId,
                mes,
                ano
            );

            // Verificar limite mensal
            const verificacaoMensal = await limitesExtrasService.verificarLimiteMensal(
                departamento,
                horasExtrasMensais + horasExtrasDia // Total se adicionar as horas do dia
            );

            return {
                limiteDiarioExcedido: verificacaoDiario.excedido,
                limiteMensalExcedido: verificacaoMensal.excedido,
                limiteDiario: verificacaoDiario.limite,
                limiteMensal: verificacaoMensal.limite,
                horasExtrasMensais: horasExtrasMensais,
                horasDisponiveisMensal: verificacaoMensal.disponivel
            };
        } catch (error) {
            console.error('Erro ao aplicar limites:', error);
            return {
                limiteDiarioExcedido: false,
                limiteMensalExcedido: false,
                limiteDiario: null,
                limiteMensal: null,
                horasExtrasMensais: 0
            };
        }
    }

    /**
     * Calcula horas do dia para uma marcação
     */
    async calcularHorasDia(marcacao) {
        try {
            // Validação mais robusta - verificar se a marcação existe
            if (!marcacao) {
                return {
                    success: false,
                    error: 'Marcação não fornecida'
                };
            }

            // Verificar se entrada e saída existem e são válidas
            const entradaValida = marcacao.entrada && validarHorario(marcacao.entrada);
            const saidaValida = marcacao.saida && validarHorario(marcacao.saida);

            // Se não há entrada ou saída válida, não pode calcular
            if (!entradaValida || !saidaValida) {
                // Retornar erro silencioso ao invés de quebrar o sistema
                return {
                    success: false,
                    error: 'Marcação incompleta: entrada ou saída inválida',
                    dadosInvalidos: true
                };
            }

            // Buscar dados do colaborador
            const colaboradorDados = await this.getColaboradorDados(
                marcacao.email,
                marcacao.colaborador
            );

            // Buscar departamento do colaborador
            const colaboradorDepartamento = await this.getDepartamentoColaborador(
                marcacao.email,
                marcacao.colaborador
            );

            // Calcular horas trabalhadas
            const horasTrabalhadas = calcularHorasTrabalhadas(
                marcacao.entrada,
                marcacao.saida
            );

            // Verificar atraso
            const atraso = verificarAtraso(colaboradorDados.horaEntrada, marcacao.entrada);

            // Calcular horas extras
            let horasExtras = calcularHorasExtrasDetalhadas(
                marcacao.entrada,
                marcacao.saida,
                horasTrabalhadas,
                colaboradorDados.jornadaDiaria,
                marcacao.data
            );

            // Verificar e aplicar limites de horas extras
            const limitesAplicados = await this.aplicarLimitesHorasExtras(
                colaboradorDepartamento,
                horasExtras.total,
                marcacao.data,
                marcacao.email || marcacao.colaborador
            );

            // Se o limite foi excedido, truncar as horas extras
            if (limitesAplicados.limiteDiarioExcedido) {
                const fatorTruncamento = limitesAplicados.limiteDiario / horasExtras.total;
                horasExtras.total = limitesAplicados.limiteDiario;
                horasExtras.diurnas = Number((horasExtras.diurnas * fatorTruncamento).toFixed(2));
                horasExtras.noturnas = Number((horasExtras.noturnas * fatorTruncamento).toFixed(2));
                horasExtras.feriado = Number((horasExtras.feriado * fatorTruncamento).toFixed(2));
            }

            // Calcular banco de horas
            const bancoHoras = calcularBancoHoras(
                horasTrabalhadas,
                colaboradorDados.jornadaDiaria
            );

            // Verificar se é feriado ou final de semana
            const feriado = isFeriado(marcacao.data);
            const finalSemana = isFinalSemana(marcacao.data);

            const resultado = {
                marcacaoId: marcacao.id,
                usuarioId: marcacao.email || marcacao.colaborador,
                colaborador: marcacao.colaborador,
                data: marcacao.data,
                entrada: marcacao.entrada,
                saida: marcacao.saida,
                horasTrabalhadas: Number(horasTrabalhadas.toFixed(2)),
                jornadaContratual: colaboradorDados.jornadaDiaria,
                horasExtras: {
                    total: horasExtras.total,
                    diurnas: Number(horasExtras.diurnas.toFixed(2)),
                    noturnas: Number(horasExtras.noturnas.toFixed(2)),
                    feriado: Number(horasExtras.feriado.toFixed(2))
                },
                bancoHoras: {
                    positivo: Number(bancoHoras.positivo.toFixed(2)),
                    negativo: Number(bancoHoras.negativo.toFixed(2)),
                    saldo: Number(bancoHoras.saldo.toFixed(2))
                },
                atraso: {
                    atrasado: atraso.atrasado,
                    minutos: atraso.minutos
                },
                feriado,
                finalSemana,
                calculadoEm: new Date().toISOString(),
                limitesAplicados: {
                    limiteDiarioExcedido: limitesAplicados.limiteDiarioExcedido,
                    limiteMensalExcedido: limitesAplicados.limiteMensalExcedido,
                    limiteDiario: limitesAplicados.limiteDiario,
                    limiteMensal: limitesAplicados.limiteMensal,
                    horasExtrasMensais: limitesAplicados.horasExtrasMensais,
                    horasDisponiveisMensal: limitesAplicados.horasDisponiveisMensal,
                    departamento: colaboradorDepartamento
                }
            };

            // Salvar cálculo
            await this.salvarCalculo(resultado);

            // Log do cálculo
            await this.logCalculo({
                tipo: 'calculo_automatico',
                marcacaoId: marcacao.id,
                usuarioId: resultado.usuarioId,
                data: marcacao.data,
                detalhes: `Horas calculadas: ${formatarHoras(horasTrabalhadas)}`
            });

            return {
                success: true,
                data: resultado
            };
        } catch (error) {
            // Não logar erro se for apenas dados inválidos (comum quando não há marcações completas)
            if (error.message !== 'Dados de marcação inválidos') {
                console.error('Erro ao calcular horas do dia:', error);
            }
            return {
                success: false,
                error: error.message,
                dadosInvalidos: true
            };
        }
    }

    /**
     * Salva ou atualiza cálculo de horas
     */
    async salvarCalculo(calculo) {
        try {
            const calculos = LocalStorageService.load(this.HORAS_CALCULADAS_KEY) || [];

            // Remover cálculo existente para a mesma marcação/data
            const index = calculos.findIndex(
                c => c.marcacaoId === calculo.marcacaoId ||
                    (c.usuarioId === calculo.usuarioId && c.data === calculo.data)
            );

            if (index >= 0) {
                calculos[index] = calculo;
            } else {
                calculos.push(calculo);
            }

            LocalStorageService.save(this.HORAS_CALCULADAS_KEY, calculos);

            // Disparar evento apenas se realmente mudou algo e com throttling muito agressivo
            // Usar flag para evitar múltiplos eventos em batch
            if (typeof window !== 'undefined') {
                const now = Date.now();
                const lastDispatch = window._lastCalculosDispatch || 0;
                const MIN_INTERVAL = 15000; // Mínimo 15 segundos entre eventos (aumentado)

                // Throttle: só disparar se passou tempo suficiente
                if (!window._calculosAtualizando && (now - lastDispatch >= MIN_INTERVAL)) {
                    window._calculosAtualizando = true;
                    window._lastCalculosDispatch = now;

                    // Debounce adicional de 3 segundos antes de disparar
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('calculosAtualizados', {
                            bubbles: false,
                            cancelable: false
                        }));

                        // Resetar flag após mais tempo para evitar spam
                        setTimeout(() => {
                            if (window._calculosAtualizando) {
                                window._calculosAtualizando = false;
                            }
                        }, 5000); // Aumentado para 5 segundos
                    }, 3000); // Aumentado para 3 segundos de debounce
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Erro ao salvar cálculo:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Busca cálculo por marcação ID
     */
    async getCalculoPorMarcacao(marcacaoId) {
        try {
            const calculos = LocalStorageService.load(this.HORAS_CALCULADAS_KEY) || [];
            return calculos.find(c => c.marcacaoId === marcacaoId) || null;
        } catch (error) {
            console.error('Erro ao buscar cálculo:', error);
            return null;
        }
    }

    /**
     * Busca cálculos por usuário e período
     */
    async getCalculosUsuario(usuarioId, periodo = 'mes', dataReferencia = new Date()) {
        try {
            const calculos = LocalStorageService.load(this.HORAS_CALCULADAS_KEY) || [];
            const { inicio, fim } = obterPeriodo(periodo, dataReferencia);

            return calculos.filter(c => {
                if (c.usuarioId !== usuarioId && c.colaborador !== usuarioId) return false;
                const dataCalculo = new Date(c.data);
                return dataCalculo >= inicio && dataCalculo <= fim;
            }).sort((a, b) => new Date(b.data) - new Date(a.data));
        } catch (error) {
            console.error('Erro ao buscar cálculos do usuário:', error);
            return [];
        }
    }

    /**
     * Busca todos os cálculos de um período (para gráficos do Dashboard)
     */
    async getTodosCalculos(periodo = 'mes', dataReferencia = new Date(), dataFim = null, mesAno = null) {
        try {
            const calculos = LocalStorageService.load(this.HORAS_CALCULADAS_KEY) || [];

            if (calculos.length === 0) {
                return [];
            }

            let inicio, fim;

            // Se houver período personalizado (data início e fim)
            if (dataFim && periodo === 'personalizado') {
                inicio = new Date(dataReferencia);
                inicio.setHours(0, 0, 0, 0);
                // dataFim pode ser string (do input date) ou Date
                fim = typeof dataFim === 'string' ? new Date(dataFim) : new Date(dataFim);
                fim.setHours(23, 59, 59, 999);
            }
            // Se houver mês específico
            else if (mesAno && periodo === 'mesEspecifico') {
                const [ano, mes] = mesAno.split('-');
                inicio = new Date(ano, parseInt(mes) - 1, 1);
                inicio.setHours(0, 0, 0, 0);
                fim = new Date(ano, parseInt(mes), 0); // Último dia do mês
                fim.setHours(23, 59, 59, 999);
            }
            // Casos especiais: 7dias, 30dias
            else if (periodo === '7dias' || periodo === '30dias') {
                const dias = periodo === '7dias' ? 7 : 30;
                fim = new Date(dataReferencia);
                fim.setHours(23, 59, 59, 999);
                inicio = new Date(fim);
                inicio.setDate(inicio.getDate() - dias);
                inicio.setHours(0, 0, 0, 0);
            }
            // Usar período padrão
            else {
                const periodoInfo = obterPeriodo(periodo, dataReferencia);
                inicio = periodoInfo.inicio;
                fim = periodoInfo.fim;
            }

            // Filtrar por período e validar dados
            let calculosFiltrados = calculos.filter(c => {
                if (!c || !c.data) return false;
                try {
                    const dataCalculo = new Date(c.data);
                    return !isNaN(dataCalculo.getTime()) && dataCalculo >= inicio && dataCalculo <= fim;
                } catch (e) {
                    return false;
                }
            });

            // Se não há cálculos no período, mas há cálculos disponíveis,
            // usar todos os cálculos válidos como fallback (para gráficos de teste)
            if (calculosFiltrados.length === 0 && calculos.length > 0 && periodo !== 'personalizado' && periodo !== 'mesEspecifico') {
                calculosFiltrados = calculos.filter(c => {
                    if (!c || !c.data || typeof c.horasTrabalhadas !== 'number') return false;
                    try {
                        const dataCalculo = new Date(c.data);
                        return !isNaN(dataCalculo.getTime());
                    } catch (e) {
                        return false;
                    }
                });
            }

            return calculosFiltrados.sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordenar por data crescente para gráficos
        } catch (error) {
            console.error('Erro ao buscar todos os cálculos:', error);
            return [];
        }
    }

    /**
     * Calcula saldo acumulado
     */
    async calcularSaldo(usuarioId, periodo = 'mes', dataReferencia = new Date()) {
        try {
            const calculos = await this.getCalculosUsuario(usuarioId, periodo, dataReferencia);

            if (calculos.length === 0) {
                return {
                    saldo: 0,
                    bancoPositivo: 0,
                    bancoNegativo: 0,
                    horasExtrasTotal: 0,
                    horasTrabalhadasTotal: 0,
                    diasTrabalhados: 0
                };
            }

            const totais = calculos.reduce((acc, calc) => {
                acc.bancoPositivo += calc.bancoHoras.positivo;
                acc.bancoNegativo += calc.bancoHoras.negativo;
                acc.horasExtrasTotal += calc.horasExtras.total;
                acc.horasTrabalhadasTotal += calc.horasTrabalhadas;
                acc.diasTrabalhados += 1;
                return acc;
            }, {
                bancoPositivo: 0,
                bancoNegativo: 0,
                horasExtrasTotal: 0,
                horasTrabalhadasTotal: 0,
                diasTrabalhados: 0
            });

            const saldo = totais.bancoPositivo - totais.bancoNegativo;

            return {
                saldo: Number(saldo.toFixed(2)),
                bancoPositivo: Number(totais.bancoPositivo.toFixed(2)),
                bancoNegativo: Number(totais.bancoNegativo.toFixed(2)),
                horasExtrasTotal: Number(totais.horasExtrasTotal.toFixed(2)),
                horasTrabalhadasTotal: Number(totais.horasTrabalhadasTotal.toFixed(2)),
                diasTrabalhados: totais.diasTrabalhados
            };
        } catch (error) {
            console.error('Erro ao calcular saldo:', error);
            return {
                saldo: 0,
                bancoPositivo: 0,
                bancoNegativo: 0,
                horasExtrasTotal: 0,
                horasTrabalhadasTotal: 0,
                diasTrabalhados: 0
            };
        }
    }

    /**
     * Recalcula período após correções
     */
    async recalcularPeriodo(usuarioId, dataInicio, dataFim) {
        try {
            // Buscar marcações do período
            const { default: correcaoService } = await import('./correcaoMarcacoesService');
            const marcacoes = await correcaoService.getMarcacoes();

            const marcacoesFiltradas = marcacoes.filter(m => {
                if (m.email !== usuarioId && m.colaborador !== usuarioId) return false;
                const data = new Date(m.data);
                return data >= new Date(dataInicio) && data <= new Date(dataFim);
            });

            const calculos = [];
            for (const marcacao of marcacoesFiltradas) {
                const resultado = await this.calcularHorasDia(marcacao);
                if (resultado.success) {
                    calculos.push(resultado.data);
                }
            }

            // Log do recálculo
            await this.logCalculo({
                tipo: 'recalculo_periodo',
                usuarioId,
                dataInicio,
                dataFim,
                detalhes: `Recálculo automático para ${calculos.length} marcações`
            });

            return {
                success: true,
                data: calculos,
                total: calculos.length
            };
        } catch (error) {
            console.error('Erro ao recalcular período:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Busca totais agregados (para Dashboard)
     */
    async getTotaisAgregados(periodo = 'mes') {
        try {
            const calculos = LocalStorageService.load(this.HORAS_CALCULADAS_KEY) || [];

            // Debug removido para reduzir console spam - manter apenas em caso de erro

            // Se não há cálculos, retornar zeros (evita erros)
            if (!calculos || calculos.length === 0) {
                return {
                    totalHoras: 0,
                    totalExtras: 0,
                    bancoHoras: { positivo: 0, negativo: 0, saldo: 0 },
                    totalAtrasos: 0
                };
            }

            const { inicio, fim } = obterPeriodo(periodo);

            // Filtrar apenas cálculos válidos dentro do período
            const calculosFiltrados = calculos.filter(c => {
                if (!c || !c.data) return false;
                try {
                    const dataCalculo = new Date(c.data);
                    return !isNaN(dataCalculo.getTime()) && dataCalculo >= inicio && dataCalculo <= fim;
                } catch (e) {
                    return false;
                }
            });

            // Se não há cálculos no período, mas há cálculos disponíveis
            // pode ser que as datas estejam fora do período do mês atual
            // Nesse caso, usar TODOS os cálculos disponíveis (sem filtro de período)
            if (calculosFiltrados.length === 0 && calculos.length > 0 && periodo !== 'personalizado' && periodo !== 'mesEspecifico') {
                // Usar todos os cálculos válidos (sem filtro de data) apenas como fallback
                calculosFiltrados.push(...calculos.filter(c => {
                    if (!c || typeof c.horasTrabalhadas !== 'number' ||
                        !c.horasExtras || !c.bancoHoras || !c.atraso) {
                        return false;
                    }
                    return true;
                }));
            }

            // Se ainda não há cálculos, retornar zeros
            if (calculosFiltrados.length === 0) {
                return {
                    totalHoras: 0,
                    totalExtras: 0,
                    bancoHoras: { positivo: 0, negativo: 0, saldo: 0 },
                    totalAtrasos: 0
                };
            }

            const totais = calculosFiltrados.reduce((acc, calc) => {
                // Validar que calc tem os dados necessários
                if (!calc || typeof calc.horasTrabalhadas !== 'number' ||
                    !calc.horasExtras || !calc.bancoHoras || !calc.atraso) {
                    return acc; // Pula cálculos incompletos
                }

                acc.totalHoras += calc.horasTrabalhadas || 0;
                acc.totalExtras += calc.horasExtras?.total || 0;
                acc.bancoPositivo += calc.bancoHoras?.positivo || 0;
                acc.bancoNegativo += calc.bancoHoras?.negativo || 0;
                acc.totalAtrasos += calc.atraso?.atrasado ? 1 : 0;
                return acc;
            }, {
                totalHoras: 0,
                totalExtras: 0,
                bancoPositivo: 0,
                bancoNegativo: 0,
                totalAtrasos: 0
            });

            const saldo = totais.bancoPositivo - totais.bancoNegativo;

            return {
                totalHoras: Number(totais.totalHoras.toFixed(2)),
                totalExtras: Number(totais.totalExtras.toFixed(2)),
                bancoHoras: {
                    positivo: Number(totais.bancoPositivo.toFixed(2)),
                    negativo: Number(totais.bancoNegativo.toFixed(2)),
                    saldo: Number(saldo.toFixed(2))
                },
                totalAtrasos: totais.totalAtrasos
            };
        } catch (error) {
            // Retornar valores padrão em caso de erro (não quebrar o Dashboard)
            console.warn('Aviso ao buscar totais agregados:', error.message);
            return {
                totalHoras: 0,
                totalExtras: 0,
                bancoHoras: { positivo: 0, negativo: 0, saldo: 0 },
                totalAtrasos: 0
            };
        }
    }

    /**
     * Log de cálculo (histórico)
     */
    async logCalculo(logData) {
        try {
            const logs = LocalStorageService.load(this.LOGS_CALCULO_KEY) || [];
            const novoLog = {
                id: Date.now(),
                ...logData,
                timestamp: new Date().toISOString()
            };
            logs.push(novoLog);
            LocalStorageService.save(this.LOGS_CALCULO_KEY, logs);
            return { success: true };
        } catch (error) {
            console.error('Erro ao salvar log:', error);
            return { success: false };
        }
    }

    /**
     * Busca logs de cálculo
     */
    async getLogsCalculo(marcacaoId = null) {
        try {
            const logs = LocalStorageService.load(this.LOGS_CALCULO_KEY) || [];
            if (marcacaoId) {
                return logs.filter(l => l.marcacaoId === marcacaoId);
            }
            return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
            return [];
        }
    }

    /**
     * Inicializa cálculos para marcações existentes
     */
    async inicializarCalculos() {
        try {
            const correcaoService = (await import('./correcaoMarcacoesService')).default;
            const marcacoes = await correcaoService.getMarcacoes();

            if (!marcacoes || marcacoes.length === 0) {
                // Não há marcações para calcular - isso é normal
                return { success: true, total: 0 };
            }

            let calculados = 0;
            let ignorados = 0;

            for (const marcacao of marcacoes) {
                // Verificar se marcação tem dados válidos antes de tentar calcular
                const entradaValida = marcacao.entrada && validarHorario(marcacao.entrada);
                const saidaValida = marcacao.saida && validarHorario(marcacao.saida);

                if (!entradaValida || !saidaValida) {
                    ignorados++;
                    continue; // Pula marcações inválidas
                }

                const resultado = await this.calcularHorasDia(marcacao);
                if (resultado.success) {
                    calculados++;
                }
            }

            if (calculados > 0) {
                // Log removido para reduzir console spam
            }
            return { success: true, total: calculados, ignorados };
        } catch (error) {
            console.warn('Aviso ao inicializar cálculos:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Criar instância única do serviço
const horasService = new HorasService();

// Inicializar cálculos ao carregar (apenas se ainda não existirem)
// Fazer de forma assíncrona e não bloqueante para não quebrar o Dashboard
if (typeof window !== 'undefined') {
    // Aguardar um pouco mais para garantir que a página carregou
    setTimeout(async () => {
        try {
            const calculos = LocalStorageService.load(horasService.HORAS_CALCULADAS_KEY);
            if (!calculos || calculos.length === 0) {
                // Executar inicialização sem bloquear o UI
                await horasService.inicializarCalculos();
            }
        } catch (error) {
            // Erro silencioso - não quebra o Dashboard se inicialização falhar
            console.warn('Aviso ao inicializar cálculos de horas:', error.message);
        }
    }, 2000); // Aumentado para 2 segundos para dar tempo da página carregar
}

export default horasService;

