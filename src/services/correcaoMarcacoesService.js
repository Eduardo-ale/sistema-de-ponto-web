/**
 * Serviço para gerenciar correções de marcações de ponto
 * Sistema completo com histórico imutável de alterações
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

class CorrecaoMarcacoesService {
    constructor() {
        this.MARCACOES_KEY = 'marcacoesPonto';
        this.HISTORICO_KEY = 'historicoCorrecoes';
    }

    /**
     * Gerar dados de teste para os gráficos
     */
    gerarDadosTeste() {
        // Gerar datas recentes (últimas 4 semanas)
        const hoje = new Date();
        const datas = [];
        for (let i = 0; i < 28; i++) {
            const data = new Date(hoje);
            data.setDate(hoje.getDate() - i);
            // Ignorar domingos
            if (data.getDay() !== 0) {
                datas.push(data.toISOString().split('T')[0]);
            }
        }
        datas.reverse(); // Ordenar do mais antigo para mais recente

        const colaboradores = [
            { nome: 'MARIO LUIS', email: 'marioluis@gmail.com' },
            { nome: 'Maria Silva', email: 'maria.silva@empresa.com' },
            { nome: 'João Santos', email: 'joao.santos@empresa.com' },
            { nome: 'Ana Costa', email: 'ana.costa@empresa.com' },
            { nome: 'Pedro Oliveira', email: 'pedro.oliveira@empresa.com' },
            { nome: 'Carla Mendes', email: 'carla.mendes@empresa.com' },
            { nome: 'Roberto Lima', email: 'roberto.lima@empresa.com' },
            { nome: 'Fernanda Rocha', email: 'fernanda.rocha@empresa.com' }
        ];

        const sampleMarcacoes = [];
        let idCounter = Date.now(); // Usar timestamp para IDs únicos

        // Gerar marcações para cada dia útil dos últimos dias
        datas.forEach((data, index) => {
            // Distribuir colaboradores pelos dias
            const colaborador = colaboradores[index % colaboradores.length];

            // Variar horários para criar cenários diferentes
            let entrada, saida;

            if (index % 7 === 0) {
                // Caso 1: Horário normal (8h-17h)
                entrada = '08:00';
                saida = '17:00';
            } else if (index % 7 === 1) {
                // Caso 2: Com horas extras (8h-18h)
                entrada = '08:00';
                saida = '18:00';
            } else if (index % 7 === 2) {
                // Caso 3: Atraso (8h30-17h)
                entrada = '08:30';
                saida = '17:00';
            } else if (index % 7 === 3) {
                // Caso 4: Muitas horas extras (8h-19h)
                entrada = '08:00';
                saida = '19:00';
            } else if (index % 7 === 4) {
                // Caso 5: Horário normal (9h-18h)
                entrada = '09:00';
                saida = '18:00';
            } else if (index % 7 === 5) {
                // Caso 6: Horário normal com minutos (8h15-17h30)
                entrada = '08:15';
                saida = '17:30';
            } else {
                // Caso 7: Horário normal
                entrada = '08:00';
                saida = '17:30';
            }

            sampleMarcacoes.push({
                id: idCounter++,
                colaborador: colaborador.nome,
                email: colaborador.email,
                data: data,
                entrada: entrada,
                saida: saida,
                status: index % 10 === 0 ? 'Corrigida' : 'Original',
                corrigidoPor: index % 10 === 0 ? 'Admin Sistema' : null,
                ultimaModificacao: new Date(data + 'T' + entrada + ':00Z').toISOString()
            });
        });

        return sampleMarcacoes;
    }

    /**
     * Inicializar dados de exemplo
     */
    initializeSampleData() {
        // Inicializar marcações de exemplo
        const existingMarcacoes = localStorage.getItem(this.MARCACOES_KEY);

        // Se já existem marcações, não sobrescrever (preservar dados)
        if (existingMarcacoes) {
            return;
        }

        const sampleMarcacoes = this.gerarDadosTeste();
        LocalStorageService.save(this.MARCACOES_KEY, sampleMarcacoes);
        console.log(`✅ ${sampleMarcacoes.length} marcações de exemplo inicializadas para testes dos gráficos`);

        // Forçar recálculo após adicionar dados
        setTimeout(async () => {
            try {
                const horasService = (await import('./horasService')).default;
                const resultado = await horasService.inicializarCalculos();
                console.log(`✅ Cálculos de horas inicializados: ${resultado.total} calculados`);
            } catch (err) {
                console.warn('Aviso ao recalcular após inserir dados de teste:', err.message);
            }
        }, 1000);

        // Inicializar histórico de correções
        if (!localStorage.getItem(this.HISTORICO_KEY)) {
            const sampleHistorico = [
                {
                    id: 1,
                    marcacaoId: 3,
                    colaborador: 'Ana Costa',
                    data: '2024-01-16',
                    entradaOriginal: '09:00',
                    entradaNova: '08:00',
                    saidaOriginal: '18:00',
                    saidaNova: '17:00',
                    motivo: 'Atraso justificado por problemas de transporte público. Colaborador apresentou comprovante de atraso do ônibus.',
                    corrigidoPor: 'Admin Sistema',
                    corrigidoPorId: 'admin-1',
                    dataCorrecao: '2024-01-16T14:30:00Z'
                }
            ];

            LocalStorageService.save(this.HISTORICO_KEY, sampleHistorico);
            console.log('✅ Dados de exemplo de histórico inicializados');
        }
    }

    /**
     * Buscar todas as marcações
     */
    async getMarcacoes() {
        try {
            const marcacoes = LocalStorageService.load(this.MARCACOES_KEY) || [];
            // Ordenar por data mais recente
            return marcacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
        } catch (error) {
            console.error('Erro ao buscar marcações:', error);
            return [];
        }
    }

    /**
     * Buscar marcação por ID
     */
    async getMarcacaoById(id) {
        try {
            const marcacoes = await this.getMarcacoes();
            return marcacoes.find(m => m.id === id);
        } catch (error) {
            console.error('Erro ao buscar marcação por ID:', error);
            return null;
        }
    }

    /**
     * Corrigir marcação e registrar no histórico
     */
    async corrigirMarcacao(marcacaoId, dadosCorrecao, usuario) {
        try {
            const marcacoes = await this.getMarcacoes();
            const marcacao = marcacoes.find(m => m.id === marcacaoId);

            if (!marcacao) {
                throw new Error('Marcação não encontrada');
            }

            // Verificar se houve alteração
            const entradaAlterada = dadosCorrecao.novaEntrada && dadosCorrecao.novaEntrada !== marcacao.entrada;
            const saidaAlterada = dadosCorrecao.novaSaida && dadosCorrecao.novaSaida !== marcacao.saida;

            if (!entradaAlterada && !saidaAlterada) {
                throw new Error('Nenhum horário foi alterado');
            }

            // Verificar validação de horário
            const horaEntrada = dadosCorrecao.novaEntrada || marcacao.entrada;
            const horaSaida = dadosCorrecao.novaSaida || marcacao.saida;

            if (new Date(`2000-01-01 ${horaSaida}`) < new Date(`2000-01-01 ${horaEntrada}`)) {
                throw new Error('Horário de saída não pode ser anterior ao horário de entrada');
            }

            // Salvar histórico de correção
            const historico = LocalStorageService.load(this.HISTORICO_KEY) || [];
            const novaCorrecao = {
                id: Date.now(),
                marcacaoId: marcacaoId,
                colaborador: marcacao.colaborador,
                data: marcacao.data,
                entradaOriginal: marcacao.entrada,
                entradaNova: dadosCorrecao.novaEntrada || marcacao.entrada,
                saidaOriginal: marcacao.saida,
                saidaNova: dadosCorrecao.novaSaida || marcacao.saida,
                motivo: dadosCorrecao.motivo,
                corrigidoPor: usuario.name || usuario.nome,
                corrigidoPorId: usuario.id,
                dataCorrecao: new Date().toISOString()
            };

            historico.push(novaCorrecao);
            LocalStorageService.save(this.HISTORICO_KEY, historico);

            // Atualizar marcação original
            const index = marcacoes.findIndex(m => m.id === marcacaoId);
            marcacoes[index] = {
                ...marcacoes[index],
                entrada: dadosCorrecao.novaEntrada || marcacoes[index].entrada,
                saida: dadosCorrecao.novaSaida || marcacoes[index].saida,
                status: 'Corrigida',
                corrigidoPor: usuario.name || usuario.nome,
                ultimaModificacao: new Date().toISOString()
            };

            LocalStorageService.save(this.MARCACOES_KEY, marcacoes);

            // Trigger de recálculo de horas após correção
            try {
                const { default: horasService } = await import('./horasService');
                const marcacaoAtualizada = marcacoes[index];
                await horasService.calcularHorasDia(marcacaoAtualizada);
            } catch (err) {
                console.warn('Aviso: Não foi possível recalcular horas automaticamente:', err);
                // Não falha a correção se o recálculo falhar
            }

            return {
                success: true,
                data: marcacoes[index]
            };
        } catch (error) {
            console.error('Erro ao corrigir marcação:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Buscar histórico de correções de uma marcação
     */
    async getHistoricoCorrecoes(marcacaoId) {
        try {
            const historico = LocalStorageService.load(this.HISTORICO_KEY) || [];
            const historicoMarcacao = historico.filter(h => h.marcacaoId === marcacaoId);
            // Ordenar da mais recente para mais antiga
            return historicoMarcacao.sort((a, b) => new Date(b.dataCorrecao) - new Date(a.dataCorrecao));
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            return [];
        }
    }

    /**
     * Buscar todas as correções (para estatísticas)
     */
    async getAllHistorico() {
        try {
            const historico = LocalStorageService.load(this.HISTORICO_KEY) || [];
            return historico.sort((a, b) => new Date(b.dataCorrecao) - new Date(a.dataCorrecao));
        } catch (error) {
            console.error('Erro ao buscar histórico completo:', error);
            return [];
        }
    }

    /**
     * Adicionar dados de teste (para desenvolvimento)
     * Pode ser chamado mesmo quando já existem marcações
     */
    async adicionarDadosTeste() {
        try {
            const existingMarcacoes = LocalStorageService.load(this.MARCACOES_KEY) || [];
            const novosDados = this.gerarDadosTeste();

            // Verificar duplicatas por data e colaborador (não apenas por ID)
            const existingMap = new Map();
            existingMarcacoes.forEach(m => {
                const key = `${m.data}_${m.colaborador}_${m.entrada}_${m.saida}`;
                existingMap.set(key, true);
            });

            const dadosUnicos = novosDados.filter(m => {
                const key = `${m.data}_${m.colaborador}_${m.entrada}_${m.saida}`;
                return !existingMap.has(key);
            });

            if (dadosUnicos.length === 0) {
                console.log('ℹ️ Todos os dados de teste já existem');
                // Mesmo assim, forçar recálculo de horas
                await this.forcarRecalculoHoras();

                return {
                    success: true,
                    total: existingMarcacoes.length,
                    adicionados: 0,
                    message: 'Dados já existem'
                };
            }

            const todasMarcacoes = [...existingMarcacoes, ...dadosUnicos];
            LocalStorageService.save(this.MARCACOES_KEY, todasMarcacoes);

            console.log(`✅ ${dadosUnicos.length} novas marcações de teste adicionadas (total: ${todasMarcacoes.length})`);
            console.log(`📅 Período dos dados: ${dadosUnicos[0]?.data} até ${dadosUnicos[dadosUnicos.length - 1]?.data}`);

            // Forçar recálculo imediatamente
            await this.forcarRecalculoHoras();

            return {
                success: true,
                total: todasMarcacoes.length,
                adicionados: dadosUnicos.length
            };
        } catch (error) {
            console.error('Erro ao adicionar dados de teste:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Força recálculo de todas as horas para marcações existentes
     */
    async forcarRecalculoHoras() {
        try {
            const horasService = (await import('./horasService')).default;
            console.log('🔄 Iniciando recálculo de horas...');
            const resultado = await horasService.inicializarCalculos();
            console.log(`✅ Cálculos atualizados: ${resultado.total} calculados, ${resultado.ignorados || 0} ignorados`);

            // Disparar eventos com throttling agressivo para evitar múltiplas atualizações
            if (typeof window !== 'undefined') {
                const now = Date.now();
                const lastDispatch = window._lastMarcacoesEvent || 0;
                const MIN_INTERVAL = 15000; // Mínimo 15 segundos entre eventos

                if (now - lastDispatch >= MIN_INTERVAL) {
                    window._lastMarcacoesEvent = now;
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('calculosAtualizados', {
                            bubbles: false,
                            cancelable: false
                        }));
                    }, 3000); // Debounce de 3 segundos
                }
            }

            return resultado;
        } catch (err) {
            console.error('Erro ao forçar recálculo:', err);
            return { success: false, error: err.message };
        }
    }
}

// Criar instância única do serviço
const correcaoMarcacoesService = new CorrecaoMarcacoesService();

// Inicializar dados de exemplo
correcaoMarcacoesService.initializeSampleData();

export default correcaoMarcacoesService;

