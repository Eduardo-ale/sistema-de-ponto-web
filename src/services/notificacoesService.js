/**
 * Serviço principal de notificações da Central de Comunicação
 * Gerencia criação, leitura, atualização e envio de notificações
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

class NotificacoesService {
    constructor() {
        this.NOTIFICACOES_KEY = 'notificacoes_central';
        this.MAX_NOTIFICACOES = 1000; // Limite total de notificações armazenadas
        this.DIAS_ARQUIVAMENTO = 90; // Notificações antigas são arquivadas após 90 dias
    }

    /**
     * Criar nova notificação
     */
    criarNotificacao(notificacaoData) {
        try {
            const notificacao = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                usuario_destinatario_id: notificacaoData.usuario_destinatario_id,
                usuario_remetente_id: notificacaoData.usuario_remetente_id || null,
                tipo: notificacaoData.tipo || 'sistema',
                categoria: notificacaoData.categoria || notificacaoData.tipo || 'sistema',
                titulo: notificacaoData.titulo || 'Notificação',
                mensagem: notificacaoData.mensagem || '',
                status: 'nao_lida',
                link_acao: notificacaoData.link_acao || null,
                data_criacao: new Date().toISOString(),
                data_leitura: null,
                enviada_por_email: false,
                email_enviado_em: null,
                acoes: notificacaoData.acoes || [],
                metadata: notificacaoData.metadata || {}
            };

            const notificacoes = this.buscarNotificacoes({});
            notificacoes.unshift(notificacao);

            // Manter apenas as últimas MAX_NOTIFICACOES
            if (notificacoes.length > this.MAX_NOTIFICACOES) {
                notificacoes.splice(this.MAX_NOTIFICACOES);
            }

            LocalStorageService.save(this.NOTIFICACOES_KEY, notificacoes);

            // Disparar evento customizado para atualização em tempo real
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('novaNotificacao', {
                    detail: { notificacao },
                    bubbles: false,
                    cancelable: false
                }));
            }

            return { success: true, notificacao };
        } catch (error) {
            console.error('Erro ao criar notificação:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar notificações com filtros
     */
    buscarNotificacoes(filtros = {}) {
        try {
            let notificacoes = LocalStorageService.load(this.NOTIFICACOES_KEY) || [];

            // Filtrar por usuário destinatário
            if (filtros.usuario_id) {
                notificacoes = notificacoes.filter(n =>
                    n.usuario_destinatario_id === filtros.usuario_id ||
                    n.usuario_destinatario_id === String(filtros.usuario_id) ||
                    String(n.usuario_destinatario_id) === String(filtros.usuario_id)
                );
            }

            // Filtrar por tipo/categoria
            if (filtros.tipo && filtros.tipo !== 'todas') {
                notificacoes = notificacoes.filter(n => n.tipo === filtros.tipo || n.categoria === filtros.tipo);
            }

            // Filtrar por status
            if (filtros.status === 'lidas') {
                notificacoes = notificacoes.filter(n => n.status === 'lida');
            } else if (filtros.status === 'nao_lidas') {
                notificacoes = notificacoes.filter(n => n.status === 'nao_lida');
            }

            // Filtrar por período
            if (filtros.dataInicio) {
                const inicio = new Date(filtros.dataInicio);
                inicio.setHours(0, 0, 0, 0);
                notificacoes = notificacoes.filter(n => {
                    const data = new Date(n.data_criacao);
                    return data >= inicio;
                });
            }

            if (filtros.dataFim) {
                const fim = new Date(filtros.dataFim);
                fim.setHours(23, 59, 59, 999);
                notificacoes = notificacoes.filter(n => {
                    const data = new Date(n.data_criacao);
                    return data <= fim;
                });
            }

            // Filtrar por busca de texto
            if (filtros.busca) {
                const buscaLower = filtros.busca.toLowerCase();
                notificacoes = notificacoes.filter(n =>
                    n.titulo?.toLowerCase().includes(buscaLower) ||
                    n.mensagem?.toLowerCase().includes(buscaLower)
                );
            }

            // Ordenar por data (mais recente primeiro)
            notificacoes.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));

            return notificacoes;
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            return [];
        }
    }

    /**
     * Buscar notificações não lidas de um usuário
     */
    buscarNaoLidas(usuarioId) {
        return this.buscarNotificacoes({
            usuario_id: usuarioId,
            status: 'nao_lidas'
        });
    }

    /**
     * Marcar notificação como lida
     */
    marcarComoLida(id, usuarioId = null) {
        try {
            const notificacoes = LocalStorageService.load(this.NOTIFICACOES_KEY) || [];
            const index = notificacoes.findIndex(n => n.id === id);

            if (index === -1) {
                return { success: false, error: 'Notificação não encontrada' };
            }

            // Verificar se a notificação pertence ao usuário
            if (usuarioId && notificacoes[index].usuario_destinatario_id !== usuarioId &&
                String(notificacoes[index].usuario_destinatario_id) !== String(usuarioId)) {
                return { success: false, error: 'Notificação não pertence ao usuário' };
            }

            notificacoes[index].status = 'lida';
            notificacoes[index].data_leitura = new Date().toISOString();

            LocalStorageService.save(this.NOTIFICACOES_KEY, notificacoes);

            // Disparar evento para atualização
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('notificacaoAtualizada', {
                    detail: { id, status: 'lida' },
                    bubbles: false,
                    cancelable: false
                }));
            }

            return { success: true };
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Marcar todas as notificações como lidas
     */
    marcarTodasComoLidas(usuarioId) {
        try {
            const notificacoes = LocalStorageService.load(this.NOTIFICACOES_KEY) || [];
            const agora = new Date().toISOString();
            let atualizadas = 0;

            notificacoes.forEach(notificacao => {
                if (notificacao.usuario_destinatario_id === usuarioId &&
                    notificacao.status === 'nao_lida') {
                    notificacao.status = 'lida';
                    notificacao.data_leitura = agora;
                    atualizadas++;
                }
            });

            LocalStorageService.save(this.NOTIFICACOES_KEY, notificacoes);

            // Disparar evento
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('todasNotificacoesLidas', {
                    detail: { usuarioId, total: atualizadas },
                    bubbles: false,
                    cancelable: false
                }));
            }

            return { success: true, total: atualizadas };
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Deletar notificação
     */
    deletarNotificacao(id, usuarioId = null) {
        try {
            const notificacoes = LocalStorageService.load(this.NOTIFICACOES_KEY) || [];
            const index = notificacoes.findIndex(n => n.id === id);

            if (index === -1) {
                return { success: false, error: 'Notificação não encontrada' };
            }

            // Verificar se a notificação pertence ao usuário
            if (usuarioId && notificacoes[index].usuario_destinatario_id !== usuarioId &&
                String(notificacoes[index].usuario_destinatario_id) !== String(usuarioId)) {
                return { success: false, error: 'Notificação não pertence ao usuário' };
            }

            notificacoes.splice(index, 1);
            LocalStorageService.save(this.NOTIFICACOES_KEY, notificacoes);

            // Disparar evento
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('notificacaoDeletada', {
                    detail: { id },
                    bubbles: false,
                    cancelable: false
                }));
            }

            return { success: true };
        } catch (error) {
            console.error('Erro ao deletar notificação:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Criar notificação e enviar e-mail automaticamente
     */
    async enviarNotificacaoComEmail(notificacaoData, enviarEmail = true) {
        try {
            // Criar notificação
            const resultado = this.criarNotificacao(notificacaoData);

            if (!resultado.success) {
                return resultado;
            }

            // Enviar e-mail se solicitado
            if (enviarEmail && notificacaoData.enviar_email !== false) {
                try {
                    const advancedEmailService = (await import('./advancedEmailService')).default;
                    const emailTemplates = (await import('../utils/emailTemplates')).default;

                    // Buscar template apropriado
                    const template = emailTemplates.getTemplate(notificacaoData.tipo, {
                        titulo: notificacaoData.titulo,
                        mensagem: notificacaoData.mensagem,
                        ...notificacaoData.metadata
                    });

                    // Enviar e-mail
                    const emailResultado = await advancedEmailService.sendNotificationEmail({
                        to: notificacaoData.email_destinatario || notificacaoData.metadata?.email,
                        subject: notificacaoData.titulo,
                        html: template
                    });

                    // Atualizar notificação com status de e-mail
                    if (emailResultado.success) {
                        const notificacoes = LocalStorageService.load(this.NOTIFICACOES_KEY) || [];
                        const index = notificacoes.findIndex(n => n.id === resultado.notificacao.id);
                        if (index !== -1) {
                            notificacoes[index].enviada_por_email = true;
                            notificacoes[index].email_enviado_em = new Date().toISOString();
                            LocalStorageService.save(this.NOTIFICACOES_KEY, notificacoes);
                        }
                    }
                } catch (emailError) {
                    console.error('Erro ao enviar e-mail da notificação:', emailError);
                    // Não falhar a criação da notificação se o e-mail falhar
                }
            }

            return resultado;
        } catch (error) {
            console.error('Erro ao criar notificação com e-mail:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Arquivar notificações antigas
     */
    arquivarAntigas() {
        try {
            const notificacoes = LocalStorageService.load(this.NOTIFICACOES_KEY) || [];
            const agora = new Date();
            const limiteData = new Date(agora);
            limiteData.setDate(limiteData.getDate() - this.DIAS_ARQUIVAMENTO);

            const ativas = notificacoes.filter(n => {
                const dataNotificacao = new Date(n.data_criacao);
                return dataNotificacao >= limiteData;
            });

            if (ativas.length !== notificacoes.length) {
                LocalStorageService.save(this.NOTIFICACOES_KEY, ativas);
                return { success: true, arquivadas: notificacoes.length - ativas.length };
            }

            return { success: true, arquivadas: 0 };
        } catch (error) {
            console.error('Erro ao arquivar notificações antigas:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obter contagem de não lidas para um usuário
     */
    getContagemNaoLidas(usuarioId) {
        const naoLidas = this.buscarNaoLidas(usuarioId);
        return naoLidas.length;
    }
}

const notificacoesService = new NotificacoesService();

// Arquivar notificações antigas periodicamente (a cada 24 horas) - apenas uma vez
if (typeof window !== 'undefined' && !window._notificacoesArchiverStarted) {
    window._notificacoesArchiverStarted = true;
    setInterval(() => {
        notificacoesService.arquivarAntigas();
    }, 24 * 60 * 60 * 1000);
}

export default notificacoesService;

