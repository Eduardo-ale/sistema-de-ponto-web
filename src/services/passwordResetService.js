// Serviço para gerenciar recuperação de senha
class PasswordResetService {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
        this.resetTokens = new Map(); // Simulação de armazenamento de tokens
    }

    // Gerar token JWT simulado
    generateResetToken(email) {
        const token = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        // Armazenar token temporariamente
        this.resetTokens.set(token, {
            email,
            expiresAt,
            used: false
        });

        return token;
    }

    // Validar token
    validateToken(token) {
        const tokenData = this.resetTokens.get(token);

        if (!tokenData) {
            return { valid: false, error: 'Token não encontrado' };
        }

        if (tokenData.used) {
            return { valid: false, error: 'Token já foi utilizado' };
        }

        if (new Date() > tokenData.expiresAt) {
            this.resetTokens.delete(token);
            return { valid: false, error: 'Token expirado' };
        }

        return { valid: true, email: tokenData.email };
    }

    // Invalidar token após uso
    invalidateToken(token) {
        const tokenData = this.resetTokens.get(token);
        if (tokenData) {
            tokenData.used = true;
        }
    }

    // Simular envio de email
    async sendResetEmail(email) {
        try {
            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Validar email
            const validEmails = [
                'admin@sistema.com',
                'colaborador@sistema.com',
                'rh@sistema.com',
                'teste@sistema.com'
            ];

            if (!validEmails.includes(email.toLowerCase())) {
                throw new Error('E-mail não encontrado no sistema');
            }

            // Gerar token
            const token = this.generateResetToken(email);

            // Simular envio de email
            const resetLink = `${window.location.origin}/reset-password/${token}`;

            console.log('📧 Email de recuperação simulado:');
            console.log(`Para: ${email}`);
            console.log(`Link: ${resetLink}`);
            console.log('Token expira em 15 minutos');

            // Em produção, aqui seria feita a chamada real para o serviço de email
            // await this.sendEmailViaAPI(email, resetLink);

            return {
                success: true,
                message: 'Link de recuperação enviado com sucesso',
                token // Para demonstração
            };

        } catch (error) {
            throw new Error(error.message || 'Erro ao enviar email de recuperação');
        }
    }

    // Simular redefinição de senha
    async resetPassword(token, newPassword) {
        try {
            // Validar token
            const validation = this.validateToken(token);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Validar força da senha
            if (newPassword.length < 8) {
                throw new Error('A senha deve ter pelo menos 8 caracteres');
            }

            // Simular atualização no banco de dados
            console.log('🔐 Senha redefinida com sucesso:');
            console.log(`Email: ${validation.email}`);
            console.log('Nova senha: [HASHED]');

            // Invalidar token
            this.invalidateToken(token);

            return {
                success: true,
                message: 'Senha redefinida com sucesso'
            };

        } catch (error) {
            throw new Error(error.message || 'Erro ao redefinir senha');
        }
    }

    // Simular envio de email via API (para produção)
    async sendEmailViaAPI(email, resetLink) {
        const emailData = {
            to: email,
            subject: 'Recuperação de Senha - Sistema de Ponto',
            html: this.generateEmailTemplate(resetLink),
            from: 'noreply@sistemaponto.com'
        };

        // Aqui seria feita a chamada real para o serviço de email
        // const response = await fetch(`${this.baseURL}/send-email`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(emailData)
        // });

        // return response.json();
    }

    // Template de email HTML
    generateEmailTemplate(resetLink) {
        return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
          .logo { width: 60px; height: 60px; background-color: white; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
          .title { color: white; font-size: 24px; font-weight: bold; margin: 0; }
          .content { padding: 40px 30px; }
          .message { color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; }
          .footer { background-color: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
          .warning { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🕐</div>
            <h1 class="title">Sistema de Ponto Web</h1>
          </div>
          
          <div class="content">
            <p class="message">
              Olá!<br><br>
              Recebemos uma solicitação para redefinir a senha da sua conta no Sistema de Ponto Web.
            </p>
            
            <p class="message">
              Clique no botão abaixo para criar uma nova senha:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="button">Redefinir Senha</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong><br>
              • Este link expira em 15 minutos<br>
              • Se você não solicitou esta redefinição, ignore este email<br>
              • Por segurança, não compartilhe este link
            </div>
            
            <p class="message">
              Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
              <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
            </p>
          </div>
          
          <div class="footer">
            <p>Sistema de Ponto Web v2.0.0</p>
            <p>&copy; 2024 Todos os direitos reservados</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
}

// Instância única do serviço
const passwordResetService = new PasswordResetService();

export default passwordResetService;






