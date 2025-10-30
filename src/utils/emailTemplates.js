/**
 * Templates HTML para e-mails de notificações do sistema
 */

class EmailTemplates {
    /**
     * Template base com logo e cores do sistema
     */
    getBaseTemplate(content) {
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificação - Sistema de Ponto</title>
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
        .content h2 {
            color: #333;
            margin-top: 0;
            font-size: 20px;
            font-weight: 600;
        }
        .content p {
            color: #666;
            margin: 15px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 500;
        }
        .button:hover {
            opacity: 0.9;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info {
            background-color: #d1ecf1;
            border-left: 4px solid #0dcaf0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🕐 Sistema de Ponto - CORE RH</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Esta é uma notificação automática do sistema. Por favor, não responda este e-mail.</p>
            <p>&copy; ${new Date().getFullYear()} CORE RH - Todos os direitos reservados</p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }

    /**
     * Template para alteração de escala
     */
    getTemplate(tipo, dados = {}) {
        switch (tipo) {
            case 'escala':
                return this.getBaseTemplate(`
                    <h2>${dados.titulo || 'Sua Escala de Trabalho Foi Atualizada'}</h2>
                    <p>Olá, <strong>${dados.colaborador || 'Colaborador'}</strong>!</p>
                    <div class="info">
                        <p><strong>Sua escala de trabalho foi atualizada:</strong></p>
                        <p>Nova escala: <strong>${dados.novaEscala || 'N/A'}</strong></p>
                        ${dados.dataInicio ? `<p>Data de início: ${dados.dataInicio}</p>` : ''}
                        ${dados.observacoes ? `<p>Observações: ${dados.observacoes}</p>` : ''}
                    </div>
                    <p>A alteração já está ativa no sistema. Acesse o painel para visualizar seus novos horários.</p>
                    ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Acessar Sistema</a>` : ''}
                `);

            case 'justificativa':
                if (dados.status === 'aprovada') {
                    return this.getBaseTemplate(`
                        <h2>✅ Justificativa Aprovada</h2>
                        <p>Olá, <strong>${dados.colaborador || 'Colaborador'}</strong>!</p>
                        <div class="info">
                            <p>Sua justificativa foi <strong>aprovada</strong> pelo gestor.</p>
                            <p><strong>Tipo:</strong> ${dados.tipo || 'N/A'}</p>
                            <p><strong>Data do evento:</strong> ${dados.dataEvento || 'N/A'}</p>
                            ${dados.observacoes ? `<p><strong>Observações:</strong> ${dados.observacoes}</p>` : ''}
                        </div>
                        ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Ver Detalhes</a>` : ''}
                    `);
                } else if (dados.status === 'rejeitada') {
                    return this.getBaseTemplate(`
                        <h2>❌ Justificativa Rejeitada</h2>
                        <p>Olá, <strong>${dados.colaborador || 'Colaborador'}</strong>!</p>
                        <div class="warning">
                            <p>Infelizmente, sua justificativa foi <strong>rejeitada</strong> pelo gestor.</p>
                            <p><strong>Tipo:</strong> ${dados.tipo || 'N/A'}</p>
                            <p><strong>Data do evento:</strong> ${dados.dataEvento || 'N/A'}</p>
                            ${dados.motivoRecusa ? `<p><strong>Motivo da recusa:</strong> ${dados.motivoRecusa}</p>` : ''}
                        </div>
                        ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Ver Detalhes</a>` : ''}
                    `);
                } else {
                    // Nova justificativa para gestor
                    return this.getBaseTemplate(`
                        <h2>📝 Nova Solicitação de Justificativa</h2>
                        <p>Olá, <strong>${dados.gestor || 'Gestor'}</strong>!</p>
                        <div class="info">
                            <p>O colaborador <strong>${dados.colaborador || 'N/A'}</strong> enviou uma nova justificativa que requer sua aprovação.</p>
                            <p><strong>Tipo:</strong> ${dados.tipo || 'N/A'}</p>
                            <p><strong>Data do evento:</strong> ${dados.dataEvento || 'N/A'}</p>
                            <p><strong>Motivo:</strong> ${dados.motivo || 'N/A'}</p>
                        </div>
                        <p>Acesse o sistema para revisar e tomar uma decisão.</p>
                        ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Avaliar Justificativa</a>` : ''}
                    `);
                }

            case 'horas_extras':
                if (dados.status === 'aprovada') {
                    return this.getBaseTemplate(`
                        <h2>✅ Horas Extras Aprovadas</h2>
                        <p>Olá, <strong>${dados.colaborador || 'Colaborador'}</strong>!</p>
                        <div class="info">
                            <p>Sua solicitação de horas extras foi <strong>aprovada</strong> pelo gestor.</p>
                            <p><strong>Data:</strong> ${dados.data || 'N/A'}</p>
                            <p><strong>Horas:</strong> ${dados.horas || 'N/A'}</p>
                            ${dados.observacoes ? `<p><strong>Observações:</strong> ${dados.observacoes}</p>` : ''}
                        </div>
                        ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Ver Registro</a>` : ''}
                    `);
                } else if (dados.status === 'rejeitada') {
                    return this.getBaseTemplate(`
                        <h2>❌ Horas Extras Rejeitadas</h2>
                        <p>Olá, <strong>${dados.colaborador || 'Colaborador'}</strong>!</p>
                        <div class="warning">
                            <p>Sua solicitação de horas extras foi <strong>rejeitada</strong> pelo gestor.</p>
                            <p><strong>Data:</strong> ${dados.data || 'N/A'}</p>
                            <p><strong>Horas:</strong> ${dados.horas || 'N/A'}</p>
                            ${dados.motivoRecusa ? `<p><strong>Motivo:</strong> ${dados.motivoRecusa}</p>` : ''}
                        </div>
                        ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Ver Detalhes</a>` : ''}
                    `);
                } else {
                    // Nova solicitação para gestor
                    return this.getBaseTemplate(`
                        <h2>⏱️ Nova Solicitação de Horas Extras</h2>
                        <p>Olá, <strong>${dados.gestor || 'Gestor'}</strong>!</p>
                        <div class="info">
                            <p>O colaborador <strong>${dados.colaborador || 'N/A'}</strong> solicitou aprovação de horas extras.</p>
                            <p><strong>Data:</strong> ${dados.data || 'N/A'}</p>
                            <p><strong>Horas:</strong> ${dados.horas || 'N/A'}</p>
                            <p><strong>Motivo:</strong> ${dados.motivo || 'N/A'}</p>
                        </div>
                        <p>Acesse o sistema para revisar e tomar uma decisão.</p>
                        ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Avaliar Solicitação</a>` : ''}
                    `);
                }

            case 'sistema':
                if (dados.subtipo === 'nova_conta') {
                    return this.getBaseTemplate(`
                        <h2>🎉 Bem-vindo ao Sistema de Ponto!</h2>
                        <p>Olá, <strong>${dados.nome || 'Usuário'}</strong>!</p>
                        <div class="info">
                            <p>Sua conta foi criada com sucesso no Sistema de Ponto - CORE RH.</p>
                            <p><strong>E-mail:</strong> ${dados.email || 'N/A'}</p>
                            ${dados.senhaTemporaria ? `
                                <div class="warning">
                                    <p><strong>⚠️ IMPORTANTE:</strong> Sua senha temporária é:</p>
                                    <p style="font-size: 18px; font-weight: bold; text-align: center; background: #f0f0f0; padding: 10px; border-radius: 4px;">${dados.senhaTemporaria}</p>
                                    <p style="margin-top: 10px;">Por favor, altere sua senha no primeiro acesso.</p>
                                </div>
                            ` : ''}
                        </div>
                        <p>Acesse o sistema para começar a usar:</p>
                        ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Acessar Sistema</a>` : ''}
                    `);
                } else if (dados.subtipo === 'senha_redefinida') {
                    return this.getBaseTemplate(`
                        <h2>🔐 Senha Redefinida com Sucesso</h2>
                        <p>Olá, <strong>${dados.nome || 'Usuário'}</strong>!</p>
                        <div class="warning">
                            <p>Sua senha foi redefinida com sucesso.</p>
                            <p><strong>Data/Hora:</strong> ${dados.dataHora || new Date().toLocaleString('pt-BR')}</p>
                            <p><strong>Redefinida por:</strong> ${dados.redefinidaPor || 'Administrador'}</p>
                            ${dados.ipAddress ? `<p><strong>IP:</strong> ${dados.ipAddress}</p>` : ''}
                        </div>
                        <p>Se você não solicitou esta alteração, entre em contato com o suporte imediatamente.</p>
                        ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Acessar Sistema</a>` : ''}
                    `);
                } else if (dados.subtipo === 'falta_batida') {
                    return this.getBaseTemplate(`
                        <h2>⚠️ Falta de Batida Registrada</h2>
                        <p>Olá, <strong>${dados.colaborador || 'Colaborador'}</strong>!</p>
                        <div class="warning">
                            <p>Foi detectada uma falta de batida de ponto em:</p>
                            <p><strong>Data:</strong> ${dados.data || 'N/A'}</p>
                            ${dados.tipoBatida ? `<p><strong>Tipo:</strong> ${dados.tipoBatida} (entrada/saída)</p>` : ''}
                        </div>
                        <p>Por favor, verifique seu registro de ponto e entre em contato com seu gestor se necessário.</p>
                        ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Ver Registro de Ponto</a>` : ''}
                    `);
                } else if (dados.subtipo === 'dados_alterados') {
                    return this.getBaseTemplate(`
                        <h2>📋 Dados Cadastrais Alterados</h2>
                        <p>Olá, <strong>${dados.nome || 'Usuário'}</strong>!</p>
                        <div class="info">
                            <p>Seus dados cadastrais foram alterados no sistema.</p>
                            ${dados.camposAlterados ? `<p><strong>Campos alterados:</strong> ${Array.isArray(dados.camposAlterados) ? dados.camposAlterados.join(', ') : dados.camposAlterados}</p>` : ''}
                            <p><strong>Data/Hora:</strong> ${dados.dataHora || new Date().toLocaleString('pt-BR')}</p>
                            <p><strong>Alterado por:</strong> ${dados.alteradoPor || 'Administrador'}</p>
                        </div>
                        <p>Se você não solicitou esta alteração, entre em contato com o suporte.</p>
                        ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Ver Meus Dados</a>` : ''}
                    `);
                } else {
                    // Template genérico
                    return this.getBaseTemplate(`
                        <h2>${dados.titulo || 'Notificação do Sistema'}</h2>
                        <p>${dados.mensagem || 'Você recebeu uma notificação do sistema.'}</p>
                        ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Ver Detalhes</a>` : ''}
                    `);
                }

            default:
                return this.getBaseTemplate(`
                    <h2>${dados.titulo || 'Notificação'}</h2>
                    <p>${dados.mensagem || 'Você recebeu uma notificação.'}</p>
                    ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Ver Detalhes</a>` : ''}
                `);
        }
    }

    /**
     * Template para backup
     */
    getBackupTemplate(dados) {
        const status = dados.status === 'Concluído' ? '✅' : '❌';
        const statusClass = dados.status === 'Concluído' ? 'info' : 'warning';

        return this.getBaseTemplate(`
            <h2>${status} Backup ${dados.tipo} ${dados.status}</h2>
            <p>Olá, <strong>${dados.usuario || 'Administrador'}</strong>!</p>
            <div class="${statusClass}">
                <p><strong>Status:</strong> ${dados.status}</p>
                <p><strong>Tipo:</strong> ${dados.tipo}</p>
                <p><strong>Data/Hora:</strong> ${dados.data || new Date().toLocaleString('pt-BR')}</p>
                <p><strong>Tamanho:</strong> ${dados.tamanho || 'N/A'}</p>
                ${dados.modulos ? `<p><strong>Módulos incluídos:</strong> ${Array.isArray(dados.modulos) ? dados.modulos.join(', ') : dados.modulos}</p>` : ''}
                ${dados.local ? `<p><strong>Local de armazenamento:</strong> ${dados.local}</p>` : ''}
                ${dados.erro ? `<p><strong>Erro:</strong> ${dados.erro}</p>` : ''}
            </div>
            ${dados.status === 'Concluído'
                ? '<p>O backup foi gerado com sucesso e está disponível para download ou restauração no sistema.</p>'
                : '<p>Houve um problema ao gerar o backup. Por favor, verifique as configurações e tente novamente.</p>'
            }
            ${dados.link_acao ? `<a href="${dados.link_acao}" class="button">Acessar Sistema</a>` : ''}
        `);
    }
}

const emailTemplates = new EmailTemplates();
export default emailTemplates;

