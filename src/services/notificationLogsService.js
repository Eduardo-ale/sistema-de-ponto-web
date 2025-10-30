/**
 * Serviço de logs de auditoria para notificações
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

class NotificationLogsService {
    constructor() {
        this.LOGS_KEY = 'logs_notificacoes';
        this.MAX_LOGS = 10000; // Manter últimos 10000 logs
        this.DIAS_RETENCAO = 365; // Manter logs por 1 ano
    }

    /**
     * Registrar log de evento de notificação
     */
    registrarLog(evento) {
        try {
            const log = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                usuario_id: evento.usuario_id || 'Sistema',
                tipo_evento: evento.tipo_evento || 'notificacao',
                acao_realizada: evento.acao_realizada || 'enviar',
                data_hora: new Date().toISOString(),
                resultado: evento.resultado || 'sucesso',
                detalhes: evento.detalhes || {},
                notificacao_id: evento.notificacao_id || null,
                email_enviado: evento.email_enviado || false
            };

            const logs = this.buscarLogs();
            logs.unshift(log);

            // Manter apenas os últimos MAX_LOGS
            if (logs.length > this.MAX_LOGS) {
                logs.splice(this.MAX_LOGS);
            }

            LocalStorageService.save(this.LOGS_KEY, logs);

            return { success: true, logId: log.id };
        } catch (error) {
            console.error('Erro ao registrar log:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar logs com filtros
     */
    buscarLogs(filtros = {}) {
        try {
            let logs = LocalStorageService.load(this.LOGS_KEY) || [];

            // Filtrar por usuário
            if (filtros.usuario_id) {
                logs = logs.filter(l =>
                    l.usuario_id === filtros.usuario_id ||
                    String(l.usuario_id) === String(filtros.usuario_id)
                );
            }

            // Filtrar por tipo de evento
            if (filtros.tipo_evento) {
                logs = logs.filter(l => l.tipo_evento === filtros.tipo_evento);
            }

            // Filtrar por resultado
            if (filtros.resultado) {
                logs = logs.filter(l => l.resultado === filtros.resultado);
            }

            // Filtrar por período
            if (filtros.dataInicio) {
                const inicio = new Date(filtros.dataInicio);
                inicio.setHours(0, 0, 0, 0);
                logs = logs.filter(l => {
                    const data = new Date(l.data_hora);
                    return data >= inicio;
                });
            }

            if (filtros.dataFim) {
                const fim = new Date(filtros.dataFim);
                fim.setHours(23, 59, 59, 999);
                logs = logs.filter(l => {
                    const data = new Date(l.data_hora);
                    return data <= fim;
                });
            }

            // Ordenar por data (mais recente primeiro)
            logs.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));

            return logs;
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
            return [];
        }
    }

    /**
     * Limpar logs antigos (mais de 1 ano)
     */
    limparLogsAntigos() {
        try {
            const logs = LocalStorageService.load(this.LOGS_KEY) || [];
            const agora = new Date();
            const limiteData = new Date(agora);
            limiteData.setDate(limiteData.getDate() - this.DIAS_RETENCAO);

            const logsRecentes = logs.filter(log => {
                const dataLog = new Date(log.data_hora);
                return dataLog >= limiteData;
            });

            if (logsRecentes.length !== logs.length) {
                LocalStorageService.save(this.LOGS_KEY, logsRecentes);
                return { success: true, removidos: logs.length - logsRecentes.length };
            }

            return { success: true, removidos: 0 };
        } catch (error) {
            console.error('Erro ao limpar logs antigos:', error);
            return { success: false, error: error.message };
        }
    }
}

const notificationLogsService = new NotificationLogsService();

// Limpar logs antigos periodicamente (a cada 7 dias) - apenas uma vez
if (typeof window !== 'undefined' && !window._notificationLogsCleanerStarted) {
    window._notificationLogsCleanerStarted = true;
    setInterval(() => {
        notificationLogsService.limparLogsAntigos();
    }, 7 * 24 * 60 * 60 * 1000);
}

export default notificationLogsService;

