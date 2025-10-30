/**
 * Serviço Avançado de E-mail com Template HTML Estilizado
 * Implementa envio automático de notificações com TailwindCSS
 */

// Serviço de armazenamento local
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

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
        }
    }
}

class AdvancedEmailService {
    constructor() {
        this.STORAGE_KEY = 'emailLogs';
        this.TEMPLATES_KEY = 'emailTemplates';
        this.AUDIT_KEY = 'passwordResetAudit';
        this.SENDER_EMAIL = 'no-reply@sistemaponto.com';
        this.SENDER_NAME = 'Sistema de Ponto - CORE RH';
    }

    /**
     * Envia notificação de redefinição de senha
     */
    async sendPasswordResetNotification(user, resetInfo) {
        try {
            console.log('📧 Enviando notificação de redefinição de senha...');

            // Simular delay de envio
            await new Promise(resolve => setTimeout(resolve, 1500));

            const emailLog = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                type: 'password_reset_notification',
                recipient: user.email,
                subject: 'Redefinição de Senha - Sistema de Ponto',
                status: 'sent',
                content: {
                    user: user.name,
                    resetBy: resetInfo.resetBy,
                    resetByUserId: resetInfo.resetByUserId,
                    timestamp: resetInfo.timestamp,
                    ipAddress: resetInfo.ipAddress
                }
            };

            // Salvar log
            this.saveEmailLog(emailLog);

            // Salvar auditoria
            this.saveAuditLog(user, resetInfo);

            console.log('✅ Notificação de redefinição enviada:', emailLog.id);

            return {
                success: true,
                messageId: emailLog.id,
                message: 'Notificação de redefinição enviada com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao enviar notificação:', error);

            const emailLog = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                type: 'password_reset_notification',
                recipient: user.email,
                subject: 'Redefinição de Senha - Sistema de Ponto',
                status: 'failed',
                error: error.message,
                content: {
                    user: user.name,
                    resetBy: resetInfo.resetBy,
                    resetByUserId: resetInfo.resetByUserId,
                    timestamp: resetInfo.timestamp,
                    ipAddress: resetInfo.ipAddress
                }
            };

            this.saveEmailLog(emailLog);

            return {
                success: false,
                error: error.message,
                message: 'Erro ao enviar notificação de redefinição'
            };
        }
    }

    /**
     * Gera template HTML estilizado para notificação de redefinição
     */
    generatePasswordResetTemplate(user, resetInfo) {
        return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Redefinição de Senha</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                    }
                    .content {
                        padding: 30px;
                    }
                    .info-box {
                        background-color: #f8f9fa;
                        border: 2px solid #e9ecef;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .info-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 0;
                        border-bottom: 1px solid #dee2e6;
                    }
                    .info-item:last-child {
                        border-bottom: none;
                    }
                    .info-label {
                        font-weight: 600;
                        color: #495057;
                    }
                    .info-value {
                        font-family: 'Courier New', monospace;
                        background-color: #ffffff;
                        padding: 4px 8px;
                        border-radius: 4px;
                        border: 1px solid #ced4da;
                        color: #212529;
                        font-size: 12px;
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        color: #6c757d;
                        font-size: 14px;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border: 1px solid #ffeaa7;
                        color: #856404;
                        padding: 15px;
                        border-radius: 6px;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Redefinição de Senha</h1>
                        <p>Sistema de Ponto - CORE RH</p>
                    </div>
                    
                    <div class="content">
                        <h2>Olá, ${user.name}!</h2>
                        
                        <p>Sua senha foi redefinida com sucesso pelo administrador do sistema.</p>
                        
                        <div class="info-box">
                            <h3>📋 Detalhes da Redefinição:</h3>
                            <div class="info-item">
                                <span class="info-label">Responsável:</span>
                                <span class="info-value">${resetInfo.resetBy}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Data/Hora:</span>
                                <span class="info-value">${new Date(resetInfo.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">IP:</span>
                                <span class="info-value">${resetInfo.ipAddress}</span>
                            </div>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Importante:</strong> Por motivos de segurança, recomendamos que você altere esta senha no seu primeiro acesso ao sistema.
                        </div>
                        
                        <p>Para acessar o sistema, utilize suas credenciais de login normalmente.</p>
                        
                        <p>Se você não solicitou esta redefinição, entre em contato com o administrador do sistema imediatamente.</p>
                        
                        <p>Atenciosamente,<br>
                        <strong>Equipe CORE RH</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>Este é um e-mail automático, não responda a esta mensagem.</p>
                        <p>Sistema de Ponto - CORE RH | ${new Date().getFullYear()}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Salva log de e-mail
     */
    saveEmailLog(log) {
        try {
            const existingLogs = this.getEmailLogs();
            existingLogs.push(log);
            LocalStorageService.save(this.STORAGE_KEY, existingLogs);
        } catch (error) {
            console.error('Erro ao salvar log de e-mail:', error);
        }
    }

    /**
     * Recupera logs de e-mail
     */
    getEmailLogs() {
        try {
            return LocalStorageService.load(this.STORAGE_KEY) || [];
        } catch (error) {
            console.error('Erro ao carregar logs de e-mail:', error);
            return [];
        }
    }

    /**
     * Salva log de auditoria
     */
    saveAuditLog(user, resetInfo) {
        try {
            const auditLog = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                action: 'password_reset',
                performedBy: resetInfo.resetBy,
                performedByUserId: resetInfo.resetByUserId,
                ipAddress: resetInfo.ipAddress,
                details: {
                    reason: 'Administrative reset',
                    timestamp: resetInfo.timestamp
                }
            };

            const existingAudit = LocalStorageService.load(this.AUDIT_KEY) || [];
            existingAudit.push(auditLog);
            LocalStorageService.save(this.AUDIT_KEY, existingAudit);

            console.log('📝 Log de auditoria salvo:', auditLog.id);
        } catch (error) {
            console.error('Erro ao salvar log de auditoria:', error);
        }
    }

    /**
     * Recupera logs de auditoria
     */
    getAuditLogs() {
        try {
            return LocalStorageService.load(this.AUDIT_KEY) || [];
        } catch (error) {
            console.error('Erro ao carregar logs de auditoria:', error);
            return [];
        }
    }

    /**
     * Envia e-mail de notificação genérico
     */
    async sendNotificationEmail({ to, subject, html }) {
        try {
            console.log('📧 Enviando e-mail de notificação...');

            // Simular delay de envio
            await new Promise(resolve => setTimeout(resolve, 1000));

            const emailLog = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                type: 'notification_email',
                recipient: to,
                subject: subject,
                status: 'sent',
                html: html
            };

            // Salvar log
            this.saveEmailLog(emailLog);

            console.log('✅ E-mail de notificação enviado:', emailLog.id);

            return {
                success: true,
                messageId: emailLog.id,
                message: 'E-mail de notificação enviado com sucesso'
            };
        } catch (error) {
            console.error('❌ Erro ao enviar e-mail de notificação:', error);

            const emailLog = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                type: 'notification_email',
                recipient: to,
                subject: subject,
                status: 'failed',
                error: error.message
            };

            this.saveEmailLog(emailLog);

            return {
                success: false,
                error: error.message,
                message: 'Erro ao enviar e-mail de notificação'
            };
        }
    }

    /**
     * Calcula estatísticas de e-mail
     */
    getEmailStats() {
        try {
            const logs = this.getEmailLogs();
            const total = logs.length;
            const sent = logs.filter(log => log.status === 'sent').length;
            const failed = logs.filter(log => log.status === 'failed').length;
            const successRate = total > 0 ? ((sent / total) * 100).toFixed(1) : 0;

            return {
                total,
                sent,
                failed,
                successRate: parseFloat(successRate)
            };
        } catch (error) {
            console.error('Erro ao calcular estatísticas de e-mail:', error);
            return {
                total: 0,
                sent: 0,
                failed: 0,
                successRate: 0
            };
        }
    }

    /**
     * Limpa logs de e-mail
     */
    clearEmailLogs() {
        try {
            LocalStorageService.remove(this.STORAGE_KEY);
            console.log('✅ Logs de e-mail limpos com sucesso');
        } catch (error) {
            console.error('❌ Erro ao limpar logs de e-mail:', error);
        }
    }

    /**
     * Inicializa dados de exemplo
     */
    initializeSampleData() {
        try {
            const existingLogs = this.getEmailLogs();

            // Só inicializar se não houver logs existentes
            if (existingLogs.length === 0) {
                const sampleLogs = [
                    {
                        id: Date.now() - 86400000, // 1 dia atrás
                        timestamp: new Date(Date.now() - 86400000).toISOString(),
                        type: 'password_reset_notification',
                        recipient: 'maria.silva@empresa.com',
                        subject: 'Redefinição de Senha - Sistema de Ponto',
                        status: 'sent',
                        content: {
                            user: 'Maria Silva',
                            resetBy: 'Administrador',
                            resetByUserId: 'admin',
                            timestamp: new Date(Date.now() - 86400000).toISOString(),
                            ipAddress: '127.0.0.1'
                        }
                    },
                    {
                        id: Date.now() - 172800000, // 2 dias atrás
                        timestamp: new Date(Date.now() - 172800000).toISOString(),
                        type: 'password_reset_notification',
                        recipient: 'joao.santos@empresa.com',
                        subject: 'Redefinição de Senha - Sistema de Ponto',
                        status: 'sent',
                        content: {
                            user: 'João Santos',
                            resetBy: 'Administrador',
                            resetByUserId: 'admin',
                            timestamp: new Date(Date.now() - 172800000).toISOString(),
                            ipAddress: '127.0.0.1'
                        }
                    },
                    {
                        id: Date.now() - 259200000, // 3 dias atrás
                        timestamp: new Date(Date.now() - 259200000).toISOString(),
                        type: 'password_reset_notification',
                        recipient: 'ana.costa@empresa.com',
                        subject: 'Redefinição de Senha - Sistema de Ponto',
                        status: 'failed',
                        error: 'E-mail inválido',
                        content: {
                            user: 'Ana Costa',
                            resetBy: 'Administrador',
                            resetByUserId: 'admin',
                            timestamp: new Date(Date.now() - 259200000).toISOString(),
                            ipAddress: '127.0.0.1'
                        }
                    }
                ];

                LocalStorageService.save(this.STORAGE_KEY, sampleLogs);
                console.log('✅ Dados de exemplo inicializados com sucesso');
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar dados de exemplo:', error);
        }
    }
}

// Instância singleton
const advancedEmailService = new AdvancedEmailService();

export default advancedEmailService;


