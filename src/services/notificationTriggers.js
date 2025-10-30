/**
 * Triggers automáticos para eventos do sistema
 * Detecta eventos e cria notificações automaticamente
 */

import notificacoesService from './notificacoesService';
import notificationLogsService from './notificationLogsService';

class NotificationTriggers {
    /**
     * Trigger: Alteração de Escala
     */
    async onEscalaAlterada(colaboradorId, colaboradorNome, colaboradorEmail, novaEscala, dataInicio, observacoes, alteradoPor) {
        try {
            const resultado = await notificacoesService.enviarNotificacaoComEmail({
                usuario_destinatario_id: colaboradorId,
                usuario_remetente_id: alteradoPor?.id || alteradoPor,
                tipo: 'escala',
                categoria: 'escala',
                titulo: 'Escala de Trabalho Atualizada',
                mensagem: `Sua escala de trabalho foi atualizada para ${novaEscala}. A alteração já está ativa no sistema.`,
                link_acao: '/perfil',
                enviar_email: true,
                email_destinatario: colaboradorEmail,
                metadata: {
                    novaEscala,
                    dataInicio,
                    observacoes,
                    colaborador: colaboradorNome,
                    email: colaboradorEmail
                },
                acoes: [
                    { label: 'Ver Escala', acao: 'ver_escala', params: { escala: novaEscala } }
                ]
            });

            // Registrar log
            notificationLogsService.registrarLog({
                usuario_id: colaboradorId,
                tipo_evento: 'escala_alterada',
                acao_realizada: 'notificacao_enviada',
                resultado: resultado.success ? 'sucesso' : 'falha',
                detalhes: { novaEscala, alteradoPor }
            });

            return resultado;
        } catch (error) {
            console.error('Erro no trigger de alteração de escala:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Trigger: Nova Justificativa Criada
     */
    async onJustificativaCriada(justificativa, gestores) {
        try {
            // Notificar todos os gestores
            const resultados = await Promise.all(
                gestores.map(gestor =>
                    notificacoesService.enviarNotificacaoComEmail({
                        usuario_destinatario_id: gestor.id || gestor,
                        usuario_remetente_id: justificativa.colaboradorId,
                        tipo: 'justificativa',
                        categoria: 'justificativa',
                        titulo: 'Nova Solicitação de Justificativa',
                        mensagem: `${justificativa.colaboradorNome} enviou uma nova justificativa que requer sua aprovação.`,
                        link_acao: `/justificativas/${justificativa.id}`,
                        enviar_email: true,
                        email_destinatario: gestor.email || gestor,
                        metadata: {
                            justificativaId: justificativa.id,
                            colaborador: justificativa.colaboradorNome,
                            tipo: justificativa.tipo,
                            dataEvento: justificativa.dataEvento,
                            motivo: justificativa.motivo
                        },
                        acoes: [
                            { label: 'Aprovar', acao: 'aprovar_justificativa', params: { id: justificativa.id } },
                            { label: 'Recusar', acao: 'recusar_justificativa', params: { id: justificativa.id } },
                            { label: 'Ver Detalhes', acao: 'ver_justificativa', params: { id: justificativa.id } }
                        ]
                    })
                )
            );

            // Registrar logs
            resultados.forEach((resultado, index) => {
                notificationLogsService.registrarLog({
                    usuario_id: gestores[index].id || gestores[index],
                    tipo_evento: 'justificativa_criada',
                    acao_realizada: 'notificacao_enviada',
                    resultado: resultado.success ? 'sucesso' : 'falha',
                    detalhes: { justificativaId: justificativa.id }
                });
            });

            return resultados;
        } catch (error) {
            console.error('Erro no trigger de justificativa criada:', error);
            return [{ success: false, error: error.message }];
        }
    }

    /**
     * Trigger: Justificativa Aprovada/Rejeitada
     */
    async onJustificativaDecidida(justificativa, status, motivoRecusa, decisaoPor) {
        try {
            const aprovada = status === 'aprovada';
            const resultado = await notificacoesService.enviarNotificacaoComEmail({
                usuario_destinatario_id: justificativa.colaboradorId,
                usuario_remetente_id: decisaoPor?.id || decisaoPor,
                tipo: 'justificativa',
                categoria: 'justificativa',
                titulo: aprovada ? 'Justificativa Aprovada' : 'Justificativa Rejeitada',
                mensagem: aprovada
                    ? `Sua justificativa foi aprovada pelo gestor.`
                    : `Sua justificativa foi rejeitada pelo gestor.${motivoRecusa ? ` Motivo: ${motivoRecusa}` : ''}`,
                link_acao: `/justificativas/${justificativa.id}`,
                enviar_email: true,
                metadata: {
                    justificativaId: justificativa.id,
                    status,
                    motivoRecusa: motivoRecusa || null,
                    tipo: justificativa.tipo,
                    dataEvento: justificativa.dataEvento,
                    colaborador: justificativa.colaboradorNome
                },
                acoes: [
                    { label: 'Ver Detalhes', acao: 'ver_justificativa', params: { id: justificativa.id } }
                ]
            });

            // Registrar log
            notificationLogsService.registrarLog({
                usuario_id: justificativa.colaboradorId,
                tipo_evento: `justificativa_${status}`,
                acao_realizada: 'notificacao_enviada',
                resultado: resultado.success ? 'sucesso' : 'falha',
                detalhes: { justificativaId: justificativa.id, status }
            });

            return resultado;
        } catch (error) {
            console.error('Erro no trigger de decisão de justificativa:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Trigger: Solicitação de Horas Extras
     */
    async onHorasExtrasSolicitada(solicitacao, gestorId, gestorEmail) {
        try {
            const resultado = await notificacoesService.enviarNotificacaoComEmail({
                usuario_destinatario_id: gestorId,
                usuario_remetente_id: solicitacao.colaboradorId,
                tipo: 'horas_extras',
                categoria: 'horas_extras',
                titulo: 'Nova Solicitação de Horas Extras',
                mensagem: `${solicitacao.colaboradorNome} solicitou aprovação de ${solicitacao.horas} horas extras.`,
                link_acao: `/horas-extras/${solicitacao.id}`,
                enviar_email: true,
                email_destinatario: gestorEmail,
                metadata: {
                    solicitacaoId: solicitacao.id,
                    colaborador: solicitacao.colaboradorNome,
                    data: solicitacao.data,
                    horas: solicitacao.horas,
                    motivo: solicitacao.motivo
                },
                acoes: [
                    { label: 'Aprovar', acao: 'aprovar_horas_extras', params: { id: solicitacao.id } },
                    { label: 'Recusar', acao: 'recusar_horas_extras', params: { id: solicitacao.id } },
                    { label: 'Ver Detalhes', acao: 'ver_horas_extras', params: { id: solicitacao.id } }
                ]
            });

            // Registrar log
            notificationLogsService.registrarLog({
                usuario_id: gestorId,
                tipo_evento: 'horas_extras_solicitada',
                acao_realizada: 'notificacao_enviada',
                resultado: resultado.success ? 'sucesso' : 'falha',
                detalhes: { solicitacaoId: solicitacao.id }
            });

            return resultado;
        } catch (error) {
            console.error('Erro no trigger de horas extras solicitada:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Trigger: Horas Extras Aprovadas/Rejeitadas
     */
    async onHorasExtrasDecidida(solicitacao, status, motivoRecusa, decisaoPor) {
        try {
            const aprovada = status === 'aprovada';
            const resultado = await notificacoesService.enviarNotificacaoComEmail({
                usuario_destinatario_id: solicitacao.colaboradorId,
                usuario_remetente_id: decisaoPor?.id || decisaoPor,
                tipo: 'horas_extras',
                categoria: 'horas_extras',
                titulo: aprovada ? 'Horas Extras Aprovadas' : 'Horas Extras Rejeitadas',
                mensagem: aprovada
                    ? `Sua solicitação de ${solicitacao.horas} horas extras foi aprovada.`
                    : `Sua solicitação de ${solicitacao.horas} horas extras foi rejeitada.${motivoRecusa ? ` Motivo: ${motivoRecusa}` : ''}`,
                link_acao: `/horas-extras/${solicitacao.id}`,
                enviar_email: true,
                metadata: {
                    solicitacaoId: solicitacao.id,
                    status,
                    motivoRecusa: motivoRecusa || null,
                    data: solicitacao.data,
                    horas: solicitacao.horas,
                    colaborador: solicitacao.colaboradorNome
                },
                acoes: [
                    { label: 'Ver Registro', acao: 'ver_horas_extras', params: { id: solicitacao.id } }
                ]
            });

            // Registrar log
            notificationLogsService.registrarLog({
                usuario_id: solicitacao.colaboradorId,
                tipo_evento: `horas_extras_${status}`,
                acao_realizada: 'notificacao_enviada',
                resultado: resultado.success ? 'sucesso' : 'falha',
                detalhes: { solicitacaoId: solicitacao.id, status }
            });

            return resultado;
        } catch (error) {
            console.error('Erro no trigger de decisão de horas extras:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Trigger: Nova Conta Criada
     */
    async onNovaContaCriada(usuario, senhaTemporaria, criadoPor) {
        try {
            const resultado = await notificacoesService.enviarNotificacaoComEmail({
                usuario_destinatario_id: usuario.id,
                usuario_remetente_id: criadoPor?.id || criadoPor || 'Sistema',
                tipo: 'sistema',
                categoria: 'sistema',
                titulo: 'Bem-vindo ao Sistema de Ponto!',
                mensagem: 'Sua conta foi criada com sucesso. Use suas credenciais para acessar o sistema.',
                link_acao: '/login',
                enviar_email: true,
                email_destinatario: usuario.email,
                metadata: {
                    nome: usuario.name || usuario.nome,
                    email: usuario.email,
                    senhaTemporaria,
                    subtipo: 'nova_conta'
                },
                acoes: [
                    { label: 'Acessar Sistema', acao: 'acessar_sistema', params: {} }
                ]
            });

            // Registrar log
            notificationLogsService.registrarLog({
                usuario_id: usuario.id,
                tipo_evento: 'conta_criada',
                acao_realizada: 'notificacao_enviada',
                resultado: resultado.success ? 'sucesso' : 'falha',
                detalhes: { usuarioId: usuario.id }
            });

            return resultado;
        } catch (error) {
            console.error('Erro no trigger de nova conta:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Trigger: Senha Redefinida
     */
    async onSenhaRedefinida(usuario, redefinidaPor, ipAddress) {
        try {
            const resultado = await notificacoesService.enviarNotificacaoComEmail({
                usuario_destinatario_id: usuario.id,
                usuario_remetente_id: redefinidaPor?.id || redefinidaPor || 'Sistema',
                tipo: 'sistema',
                categoria: 'sistema',
                titulo: 'Senha Redefinida com Sucesso',
                mensagem: 'Sua senha foi redefinida com sucesso. Se você não solicitou esta alteração, entre em contato com o suporte imediatamente.',
                link_acao: '/login',
                enviar_email: true,
                email_destinatario: usuario.email,
                metadata: {
                    nome: usuario.name || usuario.nome,
                    email: usuario.email,
                    redefinidaPor: redefinidaPor?.name || redefinidaPor || 'Administrador',
                    ipAddress,
                    dataHora: new Date().toLocaleString('pt-BR'),
                    subtipo: 'senha_redefinida'
                },
                acoes: [
                    { label: 'Acessar Sistema', acao: 'acessar_sistema', params: {} }
                ]
            });

            // Registrar log
            notificationLogsService.registrarLog({
                usuario_id: usuario.id,
                tipo_evento: 'senha_redefinida',
                acao_realizada: 'notificacao_enviada',
                resultado: resultado.success ? 'sucesso' : 'falha',
                detalhes: { usuarioId: usuario.id }
            });

            return resultado;
        } catch (error) {
            console.error('Erro no trigger de senha redefinida:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Trigger: Falta de Batida
     */
    async onFaltaBatida(colaboradorId, colaboradorNome, colaboradorEmail, data, tipoBatida, gestorId, gestorEmail) {
        try {
            // Notificar colaborador
            const notifColaborador = await notificacoesService.enviarNotificacaoComEmail({
                usuario_destinatario_id: colaboradorId,
                tipo: 'sistema',
                categoria: 'sistema',
                titulo: 'Falta de Batida Registrada',
                mensagem: `Foi detectada uma falta de batida de ponto em ${data}. Por favor, verifique seu registro.`,
                link_acao: '/ponto',
                enviar_email: true,
                email_destinatario: colaboradorEmail,
                metadata: {
                    colaborador: colaboradorNome,
                    data,
                    tipoBatida,
                    subtipo: 'falta_batida'
                }
            });

            // Notificar gestor
            const notifGestor = await notificacoesService.enviarNotificacaoComEmail({
                usuario_destinatario_id: gestorId,
                tipo: 'sistema',
                categoria: 'sistema',
                titulo: 'Falta de Batida - Colaborador',
                mensagem: `${colaboradorNome} não registrou batida de ponto em ${data}.`,
                link_acao: `/gestao-ponto?colaborador=${colaboradorId}`,
                enviar_email: true,
                email_destinatario: gestorEmail,
                metadata: {
                    colaborador: colaboradorNome,
                    colaboradorId,
                    data,
                    tipoBatida,
                    subtipo: 'falta_batida_gestor'
                }
            });

            // Registrar logs
            notificationLogsService.registrarLog({
                usuario_id: colaboradorId,
                tipo_evento: 'falta_batida',
                acao_realizada: 'notificacao_enviada',
                resultado: notifColaborador.success ? 'sucesso' : 'falha',
                detalhes: { data, tipoBatida }
            });

            notificationLogsService.registrarLog({
                usuario_id: gestorId,
                tipo_evento: 'falta_batida_gestor',
                acao_realizada: 'notificacao_enviada',
                resultado: notifGestor.success ? 'sucesso' : 'falha',
                detalhes: { colaboradorId, data }
            });

            return { colaborador: notifColaborador, gestor: notifGestor };
        } catch (error) {
            console.error('Erro no trigger de falta de batida:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Trigger: Alteração de Dados Cadastrais
     */
    async onDadosAlterados(usuario, camposAlterados, alteradoPor) {
        try {
            const resultado = await notificacoesService.enviarNotificacaoComEmail({
                usuario_destinatario_id: usuario.id,
                usuario_remetente_id: alteradoPor?.id || alteradoPor || 'Sistema',
                tipo: 'sistema',
                categoria: 'sistema',
                titulo: 'Dados Cadastrais Alterados',
                mensagem: `Seus dados cadastrais foram alterados no sistema.${Array.isArray(camposAlterados) ? ` Campos alterados: ${camposAlterados.join(', ')}` : ''}`,
                link_acao: '/perfil',
                enviar_email: true,
                email_destinatario: usuario.email,
                metadata: {
                    nome: usuario.name || usuario.nome,
                    email: usuario.email,
                    camposAlterados: Array.isArray(camposAlterados) ? camposAlterados : [camposAlterados],
                    alteradoPor: alteradoPor?.name || alteradoPor || 'Administrador',
                    dataHora: new Date().toLocaleString('pt-BR'),
                    subtipo: 'dados_alterados'
                },
                acoes: [
                    { label: 'Ver Meus Dados', acao: 'ver_perfil', params: {} }
                ]
            });

            // Registrar log
            notificationLogsService.registrarLog({
                usuario_id: usuario.id,
                tipo_evento: 'dados_alterados',
                acao_realizada: 'notificacao_enviada',
                resultado: resultado.success ? 'sucesso' : 'falha',
                detalhes: { usuarioId: usuario.id, camposAlterados }
            });

            return resultado;
        } catch (error) {
            console.error('Erro no trigger de dados alterados:', error);
            return { success: false, error: error.message };
        }
    }
}

const notificationTriggers = new NotificationTriggers();
export default notificationTriggers;

