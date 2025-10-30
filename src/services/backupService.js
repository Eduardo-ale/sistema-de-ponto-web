/**
 * Serviço principal de backup e restauração do sistema
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

class BackupService {
    constructor() {
        this.BACKUPS_KEY = 'backups_sistema';
        this.CONFIG_KEY = 'configuracoes_backup';
        this.LOGS_KEY = 'logs_backup';
        this.schedulerInterval = null;
    }

    /**
     * Coletar dados do sistema por módulos
     */
    async coletarDadosSistema(modulos) {
        const dados = {};

        try {
            // Definir todos os módulos disponíveis
            const todosModulos = {
                usuarios: () => LocalStorageService.load('users') || [],
                marcacoes: () => LocalStorageService.load('marcacoes_ponto') || [],
                justificativas: () => LocalStorageService.load('justificativas') || [],
                calculos: () => LocalStorageService.load('horas_calculadas') || [],
                limites_extras: () => LocalStorageService.load('limites_horas_extras') || [],
                notificacoes: () => LocalStorageService.load('notificacoes_central') || [],
                logs_usuario: () => LocalStorageService.load('logs_usuarios') || [],
                logs_email: () => LocalStorageService.load('emailLogs') || [],
                logs_auditoria: () => LocalStorageService.load('logs_notificacoes') || [],
                logs_backup: () => LocalStorageService.load(this.LOGS_KEY) || [],
                configuracoes: () => LocalStorageService.load(this.CONFIG_KEY) || []
            };

            // Coletar apenas módulos solicitados
            if (modulos.includes('todos') || modulos.length === 0) {
                Object.keys(todosModulos).forEach(modulo => {
                    dados[modulo] = todosModulos[modulo]();
                });
            } else {
                modulos.forEach(modulo => {
                    if (todosModulos[modulo]) {
                        dados[modulo] = todosModulos[modulo]();
                    }
                });
            }

            // Adicionar metadata
            dados._metadata = {
                data_backup: new Date().toISOString(),
                versao_sistema: '2.0.0',
                total_modulos: Object.keys(dados).length - 1 // -1 para metadata
            };

            return dados;
        } catch (error) {
            console.error('Erro ao coletar dados do sistema:', error);
            throw error;
        }
    }

    /**
     * Gerar backup manual
     */
    async gerarBackupManual(config, usuarioId, usuarioNome, progressCallback) {
        try {
            const backupId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const inicio = Date.now();

            // Criar registro de backup
            const backup = {
                id: backupId,
                tipo: 'manual',
                usuario_id: usuarioId,
                usuario_nome: usuarioNome || 'Administrador',
                data_execucao: new Date().toISOString(),
                status: 'em_andamento',
                tamanho_mb: 0,
                local_armazenamento: config.destino || 'local',
                caminho_arquivo: '',
                formato: config.formato || 'json',
                modulos_incluidos: config.modulos || ['todos'],
                retencao_dias: config.retencao_dias || 30,
                criado_em: new Date().toISOString(),
                atualizado_em: new Date().toISOString(),
                erro: null
            };

            // Salvar registro inicial
            const backups = LocalStorageService.load(this.BACKUPS_KEY) || [];
            backups.unshift(backup);
            LocalStorageService.save(this.BACKUPS_KEY, backups);

            if (progressCallback) progressCallback(10, 'Coletando dados do sistema...');

            // Coletar dados
            const dados = await this.coletarDadosSistema(config.modulos || ['todos']);

            if (progressCallback) progressCallback(30, 'Serializando dados...');

            // Serializar dados
            const backupUtils = (await import('../utils/backupUtils')).default;
            let arquivoSerializado;

            switch (config.formato) {
                case 'json':
                    arquivoSerializado = backupUtils.serializarParaJSON(dados);
                    break;
                case 'sql':
                    arquivoSerializado = backupUtils.serializarParaSQL(dados);
                    break;
                case 'zip':
                    const jsonData = backupUtils.serializarParaJSON(dados);
                    arquivoSerializado = await backupUtils.comprimirParaZIP(jsonData, 'backup.json');
                    break;
                default:
                    arquivoSerializado = backupUtils.serializarParaJSON(dados);
            }

            if (progressCallback) progressCallback(60, 'Criptografando arquivo...');

            // Criptografar (para ZIP, criptografar primeiro e depois comprimir)
            const senha = this.obterChaveCriptografia();
            let arquivoCriptografado;

            if (config.formato === 'zip') {
                // Para ZIP: criptografar string primeiro, depois comprimir
                const dadosCriptografados = await backupUtils.criptografarArquivo(arquivoSerializado, senha);
                arquivoCriptografado = await backupUtils.comprimirParaZIP(dadosCriptografados, 'backup.json');
            } else {
                arquivoCriptografado = await backupUtils.criptografarArquivo(arquivoSerializado, senha);
            }

            if (progressCallback) progressCallback(80, 'Salvando backup...');

            // Calcular tamanho
            const tamanhoBytes = arquivoCriptografado.size || arquivoCriptografado.length;
            const tamanhoMB = parseFloat((tamanhoBytes / (1024 * 1024)).toFixed(2));

            // Salvar no localStorage (simulado - em produção seria servidor/nuvem)
            const caminhoArquivo = `backup_${backupId}.${config.formato === 'zip' ? 'zip' : config.formato === 'sql' ? 'sql' : 'json'}`;

            // Armazenar arquivo como base64 no localStorage (limitado, mas funcional para MVP)
            try {
                const arquivoBase64 = typeof arquivoCriptografado === 'string'
                    ? btoa(arquivoCriptografado)
                    : await this.blobToBase64(arquivoCriptografado);

                // Armazenar backup em chave separada
                LocalStorageService.save(`backup_file_${backupId}`, arquivoBase64);
            } catch (e) {
                console.warn('Não foi possível salvar arquivo completo no localStorage:', e);
            }

            // Atualizar registro de backup
            const backupAtualizado = {
                ...backup,
                status: 'concluido',
                tamanho_mb: tamanhoMB,
                caminho_arquivo: caminhoArquivo,
                atualizado_em: new Date().toISOString()
            };

            const backupsAtualizados = LocalStorageService.load(this.BACKUPS_KEY) || [];
            const index = backupsAtualizados.findIndex(b => b.id === backupId);
            if (index >= 0) {
                backupsAtualizados[index] = backupAtualizado;
            }
            LocalStorageService.save(this.BACKUPS_KEY, backupsAtualizados);

            if (progressCallback) progressCallback(100, 'Backup concluído!');

            // Registrar log
            this.registrarLog(usuarioId, usuarioNome, 'gerar', 'sucesso', `Backup ${backupId} criado com sucesso`, backupId);

            return {
                success: true,
                backupId: backupId,
                backup: backupAtualizado,
                arquivo: arquivoCriptografado,
                tamanhoMB: tamanhoMB
            };
        } catch (error) {
            console.error('Erro ao gerar backup:', error);

            // Atualizar status para falhou
            const backups = LocalStorageService.load(this.BACKUPS_KEY) || [];
            if (backups.length > 0 && backups[0].status === 'em_andamento') {
                backups[0].status = 'falhou';
                backups[0].erro = error.message;
                backups[0].atualizado_em = new Date().toISOString();
                LocalStorageService.save(this.BACKUPS_KEY, backups);
            }

            this.registrarLog(usuarioId, usuarioNome || 'Sistema', 'gerar', 'falha', error.message, null);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Listar backups com filtros
     */
    listarBackups(filtros = {}) {
        try {
            let backups = LocalStorageService.load(this.BACKUPS_KEY) || [];

            // Filtrar por tipo
            if (filtros.tipo) {
                backups = backups.filter(b => b.tipo === filtros.tipo);
            }

            // Filtrar por status
            if (filtros.status) {
                backups = backups.filter(b => b.status === filtros.status);
            }

            // Filtrar por usuário
            if (filtros.usuario_id) {
                backups = backups.filter(b => b.usuario_id === filtros.usuario_id);
            }

            // Filtrar por período
            if (filtros.dataInicio) {
                const inicio = new Date(filtros.dataInicio);
                inicio.setHours(0, 0, 0, 0);
                backups = backups.filter(b => new Date(b.data_execucao) >= inicio);
            }

            if (filtros.dataFim) {
                const fim = new Date(filtros.dataFim);
                fim.setHours(23, 59, 59, 999);
                backups = backups.filter(b => new Date(b.data_execucao) <= fim);
            }

            // Ordenar por data (mais recente primeiro)
            backups.sort((a, b) => new Date(b.data_execucao) - new Date(a.data_execucao));

            return backups;
        } catch (error) {
            console.error('Erro ao listar backups:', error);
            return [];
        }
    }

    /**
     * Restaurar backup
     */
    async restaurarBackup(backupId, confirmacaoSenha, usuarioId, usuarioNome, progressCallback) {
        try {
            // Validar senha (simulado - em produção seria verificação real)
            if (!confirmacaoSenha || confirmacaoSenha.length < 4) {
                throw new Error('Confirmação de senha inválida');
            }

            // Buscar backup
            const backups = LocalStorageService.load(this.BACKUPS_KEY) || [];
            const backup = backups.find(b => b.id === backupId);

            if (!backup) {
                throw new Error('Backup não encontrado');
            }

            if (backup.status !== 'concluido') {
                throw new Error('Backup não está completo ou falhou');
            }

            if (progressCallback) progressCallback(10, 'Validando backup...');

            // Criar backup de segurança antes de restaurar
            if (progressCallback) progressCallback(20, 'Criando backup de segurança...');
            const backupSeguranca = await this.gerarBackupManual(
                { modulos: ['todos'], formato: 'json', destino: 'local', retencao_dias: 7 },
                usuarioId,
                usuarioNome
            );

            if (!backupSeguranca.success) {
                throw new Error('Não foi possível criar backup de segurança');
            }

            if (progressCallback) progressCallback(30, 'Carregando dados do backup...');

            // Carregar arquivo do backup
            const arquivoBase64 = LocalStorageService.load(`backup_file_${backupId}`);
            if (!arquivoBase64) {
                throw new Error('Arquivo de backup não encontrado');
            }

            // Descriptografar
            const backupUtils = (await import('../utils/backupUtils')).default;
            const senha = this.obterChaveCriptografia();
            let dadosDescriptografados = await backupUtils.descriptografarArquivo(arquivoBase64, senha);

            // Se for string, tentar parsear como JSON
            if (typeof dadosDescriptografados === 'string') {
                try {
                    dadosDescriptografados = JSON.parse(dadosDescriptografados);
                } catch (e) {
                    // Se não for JSON válido, continuar como string
                }
            }

            if (progressCallback) progressCallback(50, 'Validando integridade dos dados...');

            // Validar dados
            if (!backupUtils.validarBackup(dadosDescriptografados)) {
                throw new Error('Backup corrompido ou inválido');
            }

            if (progressCallback) progressCallback(60, 'Restaurando dados...');

            // Restaurar módulo por módulo
            const modulosRestaurados = [];
            const chavesMapping = {
                usuarios: 'users',
                marcacoes: 'marcacoes_ponto',
                justificativas: 'justificativas',
                calculos: 'horas_calculadas',
                limites_extras: 'limites_horas_extras',
                notificacoes: 'notificacoes_central',
                logs_usuario: 'logs_usuarios',
                logs_email: 'emailLogs',
                logs_auditoria: 'logs_notificacoes',
                logs_backup: this.LOGS_KEY,
                configuracoes: this.CONFIG_KEY
            };

            // Garantir que dadosDescriptografados é um objeto
            if (typeof dadosDescriptografados === 'string') {
                try {
                    dadosDescriptografados = JSON.parse(dadosDescriptografados);
                } catch (e) {
                    throw new Error('Dados do backup não estão em formato válido');
                }
            }

            const progressoPorModulo = 30 / Object.keys(chavesMapping).length;
            let progressoAtual = 60;

            for (const [modulo, chave] of Object.entries(chavesMapping)) {
                if (dadosDescriptografados[modulo] !== undefined) {
                    LocalStorageService.save(chave, dadosDescriptografados[modulo]);
                    modulosRestaurados.push(modulo);
                }
                progressoAtual += progressoPorModulo;
                if (progressCallback) {
                    progressCallback(
                        Math.min(progressoAtual, 95),
                        `Restaurando ${modulo}...`
                    );
                }
            }

            if (progressCallback) progressCallback(100, 'Restauração concluída!');

            // Registrar log
            this.registrarLog(
                usuarioId,
                usuarioNome,
                'restaurar',
                'sucesso',
                `Backup ${backupId} restaurado. Módulos: ${modulosRestaurados.join(', ')}`,
                backupId
            );

            return {
                success: true,
                modulosRestaurados,
                backupSegurancaId: backupSeguranca.backupId
            };
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            this.registrarLog(usuarioId, usuarioNome || 'Sistema', 'restaurar', 'falha', error.message, backupId);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Salvar configuração de backup automático
     */
    async salvarConfiguracao(config, usuarioId, usuarioNome) {
        try {
            const configuracao = {
                id: config.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                frequencia: config.frequencia,
                horario_execucao: config.horario_execucao,
                destino: config.destino || 'local',
                retencao_dias: config.retencao_dias || 30,
                notificar_email: config.notificar_email || false,
                email_destino: config.email_destino || '',
                ativo: config.ativo !== false,
                atualizado_por: usuarioId,
                atualizado_em: new Date().toISOString(),
                configuracao_destino: config.configuracao_destino || {}
            };

            const configuracoes = LocalStorageService.load(this.CONFIG_KEY) || [];
            const index = configuracoes.findIndex(c => c.id === configuracao.id);

            if (index >= 0) {
                configuracoes[index] = configuracao;
            } else {
                configuracoes.push(configuracao);
            }

            LocalStorageService.save(this.CONFIG_KEY, configuracoes);

            // Reiniciar agendamentos
            this.pararAgendamentosAutomaticos();
            if (config.ativo) {
                this.iniciarAgendamentosAutomaticos();
            }

            this.registrarLog(usuarioId, usuarioNome, 'configurar', 'sucesso', 'Configuração de backup salva', null);

            return { success: true, configuracao };
        } catch (error) {
            console.error('Erro ao salvar configuração:', error);
            this.registrarLog(usuarioId, usuarioNome || 'Sistema', 'configurar', 'falha', error.message, null);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obter configuração atual
     */
    obterConfiguracao() {
        try {
            const configuracoes = LocalStorageService.load(this.CONFIG_KEY) || [];
            return configuracoes.find(c => c.ativo === true) || null;
        } catch (error) {
            console.error('Erro ao obter configuração:', error);
            return null;
        }
    }

    /**
     * Deletar backup
     */
    async deletarBackup(backupId, usuarioId, usuarioNome) {
        try {
            const backups = LocalStorageService.load(this.BACKUPS_KEY) || [];
            const backupIndex = backups.findIndex(b => b.id === backupId);

            if (backupIndex === -1) {
                return { success: false, error: 'Backup não encontrado' };
            }

            // Remover arquivo
            try {
                localStorage.removeItem(`backup_file_${backupId}`);
            } catch (e) {
                console.warn('Erro ao remover arquivo do backup:', e);
            }

            backups.splice(backupIndex, 1);
            LocalStorageService.save(this.BACKUPS_KEY, backups);

            this.registrarLog(usuarioId, usuarioNome, 'excluir', 'sucesso', `Backup ${backupId} excluído`, backupId);

            return { success: true };
        } catch (error) {
            console.error('Erro ao deletar backup:', error);
            this.registrarLog(usuarioId, usuarioNome || 'Sistema', 'excluir', 'falha', error.message, backupId);
            return { success: false, error: error.message };
        }
    }

    /**
     * Iniciar agendamentos automáticos
     */
    iniciarAgendamentosAutomaticos() {
        if (this.schedulerInterval) {
            return; // Já está rodando
        }

        // Verificar a cada 5 minutos (reduzir frequência para melhorar performance)
        let ultimaVerificacao = Date.now();
        this.schedulerInterval = setInterval(async () => {
            // Evitar execuções muito rápidas
            const agora = Date.now();
            if (agora - ultimaVerificacao < 10000) { // Mínimo 10 segundos entre verificações
                return;
            }
            ultimaVerificacao = agora;

            try {
                const config = this.obterConfiguracao();
                if (!config || !config.ativo) {
                    return;
                }

                const dataAgora = new Date();
                const [hora, minuto] = config.horario_execucao.split(':').map(Number);
                let deveExecutar = false;

                switch (config.frequencia) {
                    case 'diario':
                        deveExecutar = dataAgora.getHours() === hora && dataAgora.getMinutes() === minuto;
                        break;
                    case 'semanal':
                        deveExecutar = dataAgora.getDay() === 0 && dataAgora.getHours() === hora && dataAgora.getMinutes() === minuto;
                        break;
                    case 'mensal':
                        deveExecutar = dataAgora.getDate() === 1 && dataAgora.getHours() === hora && dataAgora.getMinutes() === minuto;
                        break;
                }

                if (deveExecutar) {
                    // Verificar se já foi executado hoje
                    const backups = this.listarBackups({ tipo: 'automatico' });
                    const ultimoBackup = backups[0];
                    if (ultimoBackup && new Date(ultimoBackup.data_execucao).toDateString() === dataAgora.toDateString()) {
                        return; // Já executado hoje
                    }

                    // Executar backup automático
                    await this.gerarBackupAutomatico(config);
                }

                // Limpar backups expirados apenas uma vez por hora
                if (dataAgora.getMinutes() === 0) {
                    this.limparBackupsExpirados(config.retencao_dias);
                }
            } catch (error) {
                console.error('Erro no agendamento de backup:', error);
            }
        }, 300000); // Verificar a cada 5 minutos (ao invés de 1 minuto)
    }

    /**
     * Parar agendamentos automáticos
     */
    pararAgendamentosAutomaticos() {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }
    }

    /**
     * Gerar backup automático
     */
    async gerarBackupAutomatico(config) {
        try {
            const usuarios = LocalStorageService.load('users') || [];
            const admin = usuarios.find(u => u.role === 'admin' || u.profile === 'Administrador') || {
                id: 'sistema',
                name: 'Sistema'
            };

            const resultado = await this.gerarBackupManual(
                {
                    modulos: ['todos'],
                    formato: 'zip',
                    destino: config.destino,
                    retencao_dias: config.retencao_dias
                },
                admin.id,
                'Sistema (Automático)'
            );

            if (resultado.success) {
                // Enviar notificação por e-mail se configurado
                if (config.notificar_email && config.email_destino) {
                    const advancedEmailService = (await import('./advancedEmailService')).default;
                    const emailTemplates = (await import('../utils/emailTemplates')).default;

                    const template = emailTemplates.getBackupTemplate({
                        tipo: 'Automático',
                        data: new Date().toLocaleString('pt-BR'),
                        tamanho: `${resultado.tamanhoMB} MB`,
                        status: 'Concluído',
                        modulos: resultado.backup.modulos_incluidos.join(', '),
                        local: config.destino,
                        usuario: admin.name || 'Administrador'
                    });

                    await advancedEmailService.sendNotificationEmail({
                        to: config.email_destino,
                        subject: 'Backup Automático Concluído',
                        html: template
                    });
                }

                // Criar notificação interna
                const notificacoesService = (await import('./notificacoesService')).default;
                await notificacoesService.enviarNotificacaoComEmail({
                    usuario_destinatario_id: admin.id,
                    tipo: 'sistema',
                    categoria: 'sistema',
                    titulo: 'Backup Automático Concluído',
                    mensagem: `Backup automático criado com sucesso. Tamanho: ${resultado.tamanhoMB} MB`,
                    enviar_email: false
                });
            }
        } catch (error) {
            console.error('Erro ao gerar backup automático:', error);
        }
    }

    /**
     * Limpar backups expirados
     */
    limparBackupsExpirados(retencaoDias) {
        try {
            const backups = LocalStorageService.load(this.BACKUPS_KEY) || [];
            const agora = new Date();
            const limiteData = new Date(agora);
            limiteData.setDate(limiteData.getDate() - retencaoDias);

            const backupsValidos = backups.filter(backup => {
                const dataBackup = new Date(backup.data_execucao);
                if (dataBackup < limiteData) {
                    // Remover arquivo
                    try {
                        localStorage.removeItem(`backup_file_${backup.id}`);
                    } catch (e) {
                        console.warn('Erro ao remover arquivo expirado:', e);
                    }
                    return false;
                }
                return true;
            });

            if (backupsValidos.length !== backups.length) {
                LocalStorageService.save(this.BACKUPS_KEY, backupsValidos);
                console.log(`Limpeza: ${backups.length - backupsValidos.length} backups expirados removidos`);
            }
        } catch (error) {
            console.error('Erro ao limpar backups expirados:', error);
        }
    }

    /**
     * Registrar log de operação
     */
    registrarLog(usuarioId, usuarioNome, acao, resultado, detalhes, backupId) {
        try {
            const log = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                usuario_id: usuarioId,
                usuario_nome: usuarioNome || 'Sistema',
                acao: acao,
                resultado: resultado,
                data_hora: new Date().toISOString(),
                detalhes: detalhes || '',
                backup_id: backupId || null
            };

            const logs = LocalStorageService.load(this.LOGS_KEY) || [];
            logs.unshift(log);

            // Manter apenas últimos 1000 logs
            if (logs.length > 1000) {
                logs.splice(1000);
            }

            LocalStorageService.save(this.LOGS_KEY, logs);
        } catch (error) {
            console.error('Erro ao registrar log de backup:', error);
        }
    }

    /**
     * Obter chave de criptografia (simulado)
     */
    obterChaveCriptografia() {
        // Em produção, isso viria de variável de ambiente ou keystore seguro
        return 'sistema-ponto-backup-key-2025';
    }

    /**
     * Converter Blob para Base64
     */
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Baixar backup
     */
    async baixarBackup(backupId) {
        try {
            const backups = LocalStorageService.load(this.BACKUPS_KEY) || [];
            const backup = backups.find(b => b.id === backupId);

            if (!backup) {
                throw new Error('Backup não encontrado');
            }

            const arquivoBase64 = LocalStorageService.load(`backup_file_${backupId}`);
            if (!arquivoBase64) {
                throw new Error('Arquivo não encontrado');
            }

            // Descriptografar
            const backupUtils = (await import('../utils/backupUtils')).default;
            const senha = this.obterChaveCriptografia();

            // Descriptografar pode retornar string ou objeto parseado
            let dados = await backupUtils.descriptografarArquivo(arquivoBase64, senha);
            if (typeof dados === 'string') {
                try {
                    dados = JSON.parse(dados);
                } catch (e) {
                    // Se não for JSON válido, usar como está
                }
            }

            // Converter para string JSON se necessário
            let dadosStr = dados;
            if (typeof dados !== 'string') {
                dadosStr = JSON.stringify(dados, null, 2);
            }

            // Converter para blob e fazer download
            const tipoMIME = backup.formato === 'zip'
                ? 'application/zip'
                : backup.formato === 'sql'
                    ? 'text/sql'
                    : 'application/json';

            const blob = new Blob([dadosStr], { type: tipoMIME });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = backup.caminho_arquivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Erro ao baixar backup:', error);
            return { success: false, error: error.message };
        }
    }
}

const backupService = new BackupService();

// Iniciar agendamentos ao carregar serviço (apenas uma vez)
if (typeof window !== 'undefined' && !window._backupSchedulerStarted) {
    window._backupSchedulerStarted = true;
    setTimeout(() => {
        backupService.iniciarAgendamentosAutomaticos();
    }, 10000); // Aguardar 10 segundos após carregar para não sobrecarregar
}

export default backupService;

