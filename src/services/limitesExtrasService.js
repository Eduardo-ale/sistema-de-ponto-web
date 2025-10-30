/**
 * Serviço para gerenciar limites configuráveis de horas extras por departamento
 */

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

class LimitesExtrasService {
    constructor() {
        this.LIMITES_KEY = 'limites_horas_extras';
        this.LOGS_LIMITES_KEY = 'logs_limites_extras';

        // Valores padrão: 2h diário, 40h mensal
        this.LIMITE_DIARIO_PADRAO = 2;
        this.LIMITE_MENSAL_PADRAO = 40;

        // Departamentos padrão do sistema
        this.DEPARTAMENTOS = [
            'Administração',
            'Recursos Humanos',
            'TI',
            'Financeiro',
            'Vendas',
            'Marketing',
            'Operações',
            'Fisioterapia',
            'Enfermagem',
            'Medicina'
        ];
    }

    /**
     * Buscar todos os limites configurados
     */
    async getAllLimites() {
        try {
            const limites = LocalStorageService.load(this.LIMITES_KEY) || [];
            return limites;
        } catch (error) {
            console.error('Erro ao buscar limites:', error);
            return [];
        }
    }

    /**
     * Buscar limite específico por departamento
     */
    async getLimitePorDepartamento(departamento) {
        try {
            const limites = await this.getAllLimites();
            const limite = limites.find(l => l.departamento === departamento);

            if (limite) {
                return limite;
            }

            // Retornar valor padrão se não encontrado
            return {
                id: null,
                departamento,
                limiteDiario: this.LIMITE_DIARIO_PADRAO,
                limiteMensal: this.LIMITE_MENSAL_PADRAO,
                atualizadoPor: null,
                atualizadoEm: null
            };
        } catch (error) {
            console.error('Erro ao buscar limite:', error);
            return {
                departamento,
                limiteDiario: this.LIMITE_DIARIO_PADRAO,
                limiteMensal: this.LIMITE_MENSAL_PADRAO
            };
        }
    }

    /**
     * Salvar ou atualizar limite
     */
    async salvarLimite(limite, usuarioId, usuarioNome) {
        try {
            const limites = await this.getAllLimites();

            // Buscar limite existente
            const index = limites.findIndex(l => l.departamento === limite.departamento);

            const limiteAtualizado = {
                id: index >= 0 ? limites[index].id : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                departamento: limite.departamento,
                limiteDiario: Number(limite.limiteDiario),
                limiteMensal: Number(limite.limiteMensal),
                atualizadoPor: usuarioNome || usuarioId || 'Sistema',
                atualizadoEm: new Date().toISOString()
            };

            // Valores anteriores para log
            const valoresAnteriores = index >= 0
                ? {
                    limiteDiario: limites[index].limiteDiario,
                    limiteMensal: limites[index].limiteMensal
                }
                : null;

            // Salvar ou atualizar
            if (index >= 0) {
                limites[index] = limiteAtualizado;
            } else {
                limites.push(limiteAtualizado);
            }

            LocalStorageService.save(this.LIMITES_KEY, limites);

            // Log da alteração
            await this.logAlteracao({
                departamento: limite.departamento,
                usuarioId,
                acao: index >= 0 ? 'atualizado' : 'criado',
                valoresAnteriores,
                valoresNovos: {
                    limiteDiario: limiteAtualizado.limiteDiario,
                    limiteMensal: limiteAtualizado.limiteMensal
                }
            });

            return {
                success: true,
                data: limiteAtualizado
            };
        } catch (error) {
            console.error('Erro ao salvar limite:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Remover limite (retorna ao padrão)
     */
    async removerLimite(departamento, usuarioId) {
        try {
            const limites = await this.getAllLimites();
            const index = limites.findIndex(l => l.departamento === departamento);

            if (index >= 0) {
                const limiteRemovido = limites[index];

                // Remover do array
                limites.splice(index, 1);
                LocalStorageService.save(this.LIMITES_KEY, limites);

                // Log da remoção
                await this.logAlteracao({
                    departamento,
                    usuarioId,
                    acao: 'removido',
                    valoresAnteriores: {
                        limiteDiario: limiteRemovido.limiteDiario,
                        limiteMensal: limiteRemovido.limiteMensal
                    },
                    valoresNovos: {
                        limiteDiario: this.LIMITE_DIARIO_PADRAO,
                        limiteMensal: this.LIMITE_MENSAL_PADRAO
                    }
                });

                return {
                    success: true,
                    message: 'Limite removido, será usado o padrão'
                };
            }

            return {
                success: false,
                error: 'Limite não encontrado'
            };
        } catch (error) {
            console.error('Erro ao remover limite:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Redefinir limite ao padrão
     */
    async redefinirLimite(departamento, usuarioId, usuarioNome) {
        return await this.removerLimite(departamento, usuarioId);
    }

    /**
     * Log de alterações
     */
    async logAlteracao(logData) {
        try {
            const logs = LocalStorageService.load(this.LOGS_LIMITES_KEY) || [];

            const log = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                departamento: logData.departamento,
                usuarioId: logData.usuarioId || 'Sistema',
                acao: logData.acao,
                valoresAnteriores: logData.valoresAnteriores,
                valoresNovos: logData.valoresNovos,
                dataHora: new Date().toISOString()
            };

            logs.push(log);

            // Manter apenas os últimos 1000 logs
            if (logs.length > 1000) {
                logs.splice(0, logs.length - 1000);
            }

            LocalStorageService.save(this.LOGS_LIMITES_KEY, logs);

            return { success: true };
        } catch (error) {
            console.error('Erro ao salvar log:', error);
            return { success: false };
        }
    }

    /**
     * Buscar histórico de alterações
     */
    async getHistorico(departamento = null) {
        try {
            const logs = LocalStorageService.load(this.LOGS_LIMITES_KEY) || [];

            if (departamento) {
                return logs.filter(log => log.departamento === departamento);
            }

            return logs.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            return [];
        }
    }

    /**
     * Verificar se horas extras excedem limite diário
     */
    async verificarLimiteDiario(departamento, horasExtrasDia) {
        try {
            const limite = await this.getLimitePorDepartamento(departamento);

            return {
                excedido: horasExtrasDia > limite.limiteDiario,
                limite: limite.limiteDiario,
                horasExtras: horasExtrasDia,
                truncado: Math.min(horasExtrasDia, limite.limiteDiario)
            };
        } catch (error) {
            console.error('Erro ao verificar limite diário:', error);
            return {
                excedido: false,
                limite: this.LIMITE_DIARIO_PADRAO,
                horasExtras: horasExtrasDia,
                truncado: horasExtrasDia
            };
        }
    }

    /**
     * Verificar se horas extras mensais excedem limite
     */
    async verificarLimiteMensal(departamento, horasExtrasMes) {
        try {
            const limite = await this.getLimitePorDepartamento(departamento);

            return {
                excedido: horasExtrasMes > limite.limiteMensal,
                limite: limite.limiteMensal,
                horasExtras: horasExtrasMes,
                disponivel: Math.max(0, limite.limiteMensal - horasExtrasMes)
            };
        } catch (error) {
            console.error('Erro ao verificar limite mensal:', error);
            return {
                excedido: false,
                limite: this.LIMITE_MENSAL_PADRAO,
                horasExtras: horasExtrasMes,
                disponivel: horasExtrasMes
            };
        }
    }

    /**
     * Obter departamentos disponíveis
     */
    getDepartamentos() {
        return this.DEPARTAMENTOS;
    }

    /**
     * Calcular horas extras acumuladas no mês para um usuário
     */
    async calcularHorasExtrasMensais(usuarioId, mes, ano) {
        try {
            // Importar dinamicamente para evitar dependência circular
            const horasService = (await import('./horasService')).default;

            // Criar data de referência para o mês específico
            const dataReferencia = new Date(ano, mes - 1, 15); // Meio do mês
            const calculos = await horasService.getCalculosUsuario(usuarioId, 'mes', dataReferencia);

            // Filtrar pelo mês/ano específico
            const inicioMes = new Date(ano, mes - 1, 1);
            const fimMes = new Date(ano, mes, 0, 23, 59, 59);

            const calculosDoMes = calculos.filter(calc => {
                if (!calc || !calc.data) return false;
                try {
                    const dataCalc = new Date(calc.data);
                    return !isNaN(dataCalc.getTime()) && dataCalc >= inicioMes && dataCalc <= fimMes;
                } catch (e) {
                    return false;
                }
            });

            // Somar todas as horas extras do mês
            const totalExtras = calculosDoMes.reduce((acc, calc) => {
                const horas = calc.horasExtras?.total || 0;
                return acc + (typeof horas === 'number' ? horas : 0);
            }, 0);

            return totalExtras;
        } catch (error) {
            console.error('Erro ao calcular horas extras mensais:', error);
            return 0;
        }
    }
}

const limitesExtrasService = new LimitesExtrasService();
export default limitesExtrasService;

