/**
 * Serviço consolidado de auditoria - agrega logs de múltiplas fontes
 */

class LocalStorageService {
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

class AuditoriaService {
    constructor() {
        this.EMAIL_LOGS_KEY = 'emailLogs';
        this.USER_CREATION_LOGS_KEY = 'userCreationLogs';
        this.USER_DELETION_LOGS_KEY = 'userDeletionLogs';
        this.LIMITES_LOGS_KEY = 'logs_limites_extras';
        this.HISTORICO_CORRECOES_KEY = 'historicoCorrecoes';
        this.PASSWORD_AUDIT_KEY = 'passwordResetAudit';
    }

    /**
     * Busca logs de login/logout
     */
    async getLogsLoginLogout(filtros = {}) {
        try {
            // Em um sistema real, isso viria de uma API de autenticação
            // Por enquanto, vamos simular ou buscar de localStorage se existir
            const logs = LocalStorageService.load('loginLogoutLogs') || [];

            return this.aplicarFiltros(logs, filtros);
        } catch (error) {
            console.error('Erro ao buscar logs de login/logout:', error);
            return [];
        }
    }

    /**
     * Busca histórico de edições em registros de ponto
     */
    async getLogsEdicoesPonto(filtros = {}) {
        try {
            const historico = LocalStorageService.load(this.HISTORICO_CORRECOES_KEY) || [];

            // Converter formato para formato unificado de auditoria
            const logs = historico.map(item => ({
                id: item.id || Date.now(),
                usuario_id: item.responsavelId,
                usuario_nome: item.responsavelNome || item.responsavelEmail,
                tipo_acao: 'edicao_registro',
                descricao: `Correção de marcação de ponto - ${item.motivo || 'Sem motivo'}`,
                entidade_afetada: item.marcacaoId || 'N/A',
                data_hora: item.dataCorrecao || item.timestamp || new Date().toISOString(),
                ip_origem: item.ipOrigem || 'N/A',
                detalhes_json: {
                    marcacaoAnterior: item.dadosAnteriores,
                    marcacaoNova: item.dadosNovos,
                    motivo: item.motivo,
                    colaborador: item.colaborador
                },
                departamento: item.departamento
            }));

            return this.aplicarFiltros(logs, filtros);
        } catch (error) {
            console.error('Erro ao buscar logs de edições de ponto:', error);
            return [];
        }
    }

    /**
     * Busca ações de administração (redefinição de senhas, alteração de usuários, etc)
     */
    async getLogsAdministracao(filtros = {}) {
        try {
            const todosLogs = [];

            // Logs de criação de usuários
            const creationLogs = LocalStorageService.load(this.USER_CREATION_LOGS_KEY) || [];
            creationLogs.forEach(log => {
                todosLogs.push({
                    id: log.id || Date.now(),
                    usuario_id: log.createdBy || 'Sistema',
                    usuario_nome: log.createdByName || 'Sistema',
                    tipo_acao: 'criacao_usuario',
                    descricao: `Usuário criado: ${log.userName} (${log.userEmail})`,
                    entidade_afetada: log.userId || 'N/A',
                    data_hora: log.timestamp || new Date().toISOString(),
                    ip_origem: 'N/A',
                    detalhes_json: {
                        usuarioId: log.userId,
                        userName: log.userName,
                        userEmail: log.userEmail,
                        status: log.status
                    }
                });
            });

            // Logs de exclusão de usuários
            const deletionLogs = LocalStorageService.load(this.USER_DELETION_LOGS_KEY) || [];
            deletionLogs.forEach(log => {
                todosLogs.push({
                    id: log.id || Date.now(),
                    usuario_id: log.deletedBy || 'Sistema',
                    usuario_nome: log.deletedByName || 'Sistema',
                    tipo_acao: 'exclusao_usuario',
                    descricao: `Usuário excluído: ${log.userName} (${log.userEmail}) - Motivo: ${log.reason || 'Não informado'}`,
                    entidade_afetada: log.userId || 'N/A',
                    data_hora: log.timestamp || new Date().toISOString(),
                    ip_origem: 'N/A',
                    detalhes_json: {
                        usuarioId: log.userId,
                        userName: log.userName,
                        userEmail: log.userEmail,
                        reason: log.reason
                    }
                });
            });

            // Logs de redefinição de senhas
            const passwordLogs = LocalStorageService.load(this.PASSWORD_AUDIT_KEY) || [];
            passwordLogs.forEach(log => {
                todosLogs.push({
                    id: log.id || Date.now(),
                    usuario_id: log.performedByUserId || log.performedBy || 'Sistema',
                    usuario_nome: log.performedBy || 'Sistema',
                    tipo_acao: 'redefinicao_senha',
                    descricao: `Senha redefinida para: ${log.userName || log.userEmail}`,
                    entidade_afetada: log.userId || 'N/A',
                    data_hora: log.timestamp || new Date().toISOString(),
                    ip_origem: log.ipAddress || 'N/A',
                    detalhes_json: {
                        userId: log.userId,
                        userName: log.userName,
                        userEmail: log.userEmail,
                        reason: log.details?.reason
                    }
                });
            });

            // Logs de alteração de limites de horas extras
            const limitesLogs = LocalStorageService.load(this.LIMITES_LOGS_KEY) || [];
            limitesLogs.forEach(log => {
                todosLogs.push({
                    id: log.id || Date.now(),
                    usuario_id: log.usuarioId || 'Sistema',
                    usuario_nome: 'Administrador',
                    tipo_acao: 'alteracao_limite',
                    descricao: `Limites de horas extras alterados para ${log.departamento}`,
                    entidade_afetada: log.departamento || 'N/A',
                    data_hora: log.dataHora || new Date().toISOString(),
                    ip_origem: 'N/A',
                    detalhes_json: {
                        departamento: log.departamento,
                        valoresAnteriores: log.valoresAnteriores,
                        valoresNovos: log.valoresNovos,
                        acao: log.acao
                    },
                    departamento: log.departamento
                });
            });

            // Logs de aprovação de justificativas (se existirem)
            const justificativasLogs = LocalStorageService.load('justificativasLogs') || [];
            justificativasLogs.forEach(log => {
                todosLogs.push({
                    id: log.id || Date.now(),
                    usuario_id: log.aprovadoPor || 'Sistema',
                    usuario_nome: log.aprovadoPorNome || 'Sistema',
                    tipo_acao: 'aprovacao_justificativa',
                    descricao: `Justificativa ${log.status === 'aprovada' ? 'aprovada' : 'rejeitada'}: ${log.descricao || ''}`,
                    entidade_afetada: log.justificativaId || 'N/A',
                    data_hora: log.dataAprovacao || log.timestamp || new Date().toISOString(),
                    ip_origem: 'N/A',
                    detalhes_json: log
                });
            });

            return this.aplicarFiltros(todosLogs, filtros);
        } catch (error) {
            console.error('Erro ao buscar logs de administração:', error);
            return [];
        }
    }

    /**
     * Busca todos os logs consolidados com filtros
     */
    async getAllLogs(filtros = {}) {
        try {
            const todosLogs = [];

            // Buscar logs de edições de ponto
            const edicoes = await this.getLogsEdicoesPonto(filtros);
            todosLogs.push(...edicoes);

            // Buscar logs de administração
            const administracao = await this.getLogsAdministracao(filtros);
            todosLogs.push(...administracao);

            // Buscar logs de login/logout
            const loginLogout = await this.getLogsLoginLogout(filtros);
            todosLogs.push(...loginLogout);

            // Ordenar por data/hora (mais recente primeiro)
            return todosLogs.sort((a, b) =>
                new Date(b.data_hora) - new Date(a.data_hora)
            );
        } catch (error) {
            console.error('Erro ao buscar todos os logs:', error);
            return [];
        }
    }

    /**
     * Aplica filtros aos logs
     */
    aplicarFiltros(logs, filtros) {
        let resultado = [...logs];

        // Filtrar por período
        if (filtros.dataInicio) {
            const inicio = new Date(filtros.dataInicio);
            inicio.setHours(0, 0, 0, 0);
            resultado = resultado.filter(log => {
                const dataLog = new Date(log.data_hora);
                return dataLog >= inicio;
            });
        }

        if (filtros.dataFim) {
            const fim = new Date(filtros.dataFim);
            fim.setHours(23, 59, 59, 999);
            resultado = resultado.filter(log => {
                const dataLog = new Date(log.data_hora);
                return dataLog <= fim;
            });
        }

        // Filtrar por usuário responsável
        if (filtros.usuario) {
            resultado = resultado.filter(log =>
                log.usuario_id?.toString().includes(filtros.usuario) ||
                log.usuario_nome?.toLowerCase().includes(filtros.usuario.toLowerCase())
            );
        }

        // Filtrar por tipo de ação
        if (filtros.tipoAcao && filtros.tipoAcao !== 'todos') {
            resultado = resultado.filter(log => log.tipo_acao === filtros.tipoAcao);
        }

        // Filtrar por departamento
        if (filtros.departamento) {
            resultado = resultado.filter(log =>
                log.departamento === filtros.departamento
            );
        }

        // Filtrar por busca de texto
        if (filtros.busca) {
            const buscaLower = filtros.busca.toLowerCase();
            resultado = resultado.filter(log =>
                log.descricao?.toLowerCase().includes(buscaLower) ||
                log.usuario_nome?.toLowerCase().includes(buscaLower) ||
                log.entidade_afetada?.toString().includes(buscaLower)
            );
        }

        return resultado;
    }

    /**
     * Registra log de exportação de relatório/auditoria
     */
    registrarExportacao(tipoExportacao, formato, filtros, usuarioId, usuarioNome) {
        try {
            const log = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                usuario_id: usuarioId || 'Sistema',
                usuario_nome: usuarioNome || 'Sistema',
                tipo_acao: 'exportacao_relatorio',
                descricao: `Exportação de ${tipoExportacao} em formato ${formato.toUpperCase()}`,
                entidade_afetada: tipoExportacao,
                data_hora: new Date().toISOString(),
                ip_origem: 'N/A',
                detalhes_json: {
                    tipoExportacao,
                    formato,
                    filtros
                }
            };

            const logs = LocalStorageService.load('auditoria_sistema') || [];
            logs.push(log);

            // Manter apenas os últimos 10000 logs
            if (logs.length > 10000) {
                logs.splice(0, logs.length - 10000);
            }

            localStorage.setItem('auditoria_sistema', JSON.stringify(logs));

            return { success: true, logId: log.id };
        } catch (error) {
            console.error('Erro ao registrar exportação:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtém tipos de ação disponíveis
     */
    getTiposAcao() {
        return [
            { value: 'todos', label: 'Todos' },
            { value: 'login', label: 'Login' },
            { value: 'logout', label: 'Logout' },
            { value: 'edicao_registro', label: 'Edição de Registro' },
            { value: 'aprovacao_justificativa', label: 'Aprovação de Justificativa' },
            { value: 'redefinicao_senha', label: 'Redefinição de Senha' },
            { value: 'criacao_usuario', label: 'Criação de Usuário' },
            { value: 'exclusao_usuario', label: 'Exclusão de Usuário' },
            { value: 'alteracao_limite', label: 'Alteração de Limite' },
            { value: 'exportacao_relatorio', label: 'Exportação de Relatório' }
        ];
    }
}

const auditoriaService = new AuditoriaService();
export default auditoriaService;

