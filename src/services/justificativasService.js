class LocalStorageService {
    static save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static load(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    static remove(key) {
        localStorage.removeItem(key);
    }
}

class JustificativasService {
    constructor() {
        this.STORAGE_KEY = 'justificativas';
        this.initializeSampleData();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async createJustificativa(data) {
        try {
            const justificativas = this.getJustificativas();

            const novaJustificativa = {
                id: this.generateId(),
                colaboradorId: data.colaboradorId,
                colaboradorNome: data.colaboradorNome,
                tipo: data.tipo, // 'ausencia' ou 'atraso'
                dataEvento: data.dataEvento,
                horario: data.horario || null,
                motivo: data.motivo,
                anexo: data.anexo || null,
                status: 'pendente',
                criadoEm: new Date().toISOString(),
                decisaoPor: null,
                decisaoEm: null,
                observacoes: null,
                motivoRecusa: null
            };

            justificativas.push(novaJustificativa);
            LocalStorageService.save(this.STORAGE_KEY, justificativas);

            // Trigger de notificação para gestores
            if (typeof window !== 'undefined') {
                // Buscar gestores e administradores do sistema
                setTimeout(async () => {
                    try {
                        const notificationTriggers = (await import('./notificationTriggers')).default;
                        const users = JSON.parse(localStorage.getItem('users') || '[]');
                        const gestores = users.filter(u =>
                            u.profile === 'Gestor' ||
                            u.profile === 'Administrador' ||
                            u.role === 'admin' ||
                            u.role === 'gestor'
                        );

                        await notificationTriggers.onJustificativaCriada(novaJustificativa, gestores);
                    } catch (error) {
                        console.error('Erro ao disparar notificação de justificativa criada:', error);
                    }
                }, 300);
            }

            return {
                success: true,
                data: novaJustificativa
            };
        } catch (error) {
            console.error('Erro ao criar justificativa:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getJustificativas(filters = {}) {
        try {
            const all = LocalStorageService.load(this.STORAGE_KEY) || [];

            // Aplicar filtros
            let filtered = all;

            if (filters.status) {
                filtered = filtered.filter(j => j.status === filters.status);
            }

            if (filters.tipo) {
                filtered = filtered.filter(j => j.tipo === filters.tipo);
            }

            if (filters.colaboradorId) {
                filtered = filtered.filter(j => j.colaboradorId === filters.colaboradorId);
            }

            if (filters.dataEvento) {
                filtered = filtered.filter(j => j.dataEvento === filters.dataEvento);
            }

            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filtered = filtered.filter(j =>
                    j.colaboradorNome.toLowerCase().includes(searchLower) ||
                    j.motivo.toLowerCase().includes(searchLower)
                );
            }

            return filtered;
        } catch (error) {
            console.error('Erro ao buscar justificativas:', error);
            return [];
        }
    }

    async getJustificativaById(id) {
        try {
            const justificativas = this.getJustificativas();
            const justificativa = justificativas.find(j => j.id === id);

            return justificativa || null;
        } catch (error) {
            console.error('Erro ao buscar justificativa:', error);
            return null;
        }
    }

    async approveJustificativa(id, approvedBy, observations = '') {
        return new Promise((resolve) => {
            // Usar setTimeout para garantir execução assíncrona
            setTimeout(() => {
                try {
                    const justificativas = this.getJustificativas();
                    const index = justificativas.findIndex(j => j.id === id);

                    if (index === -1) {
                        resolve({
                            success: false,
                            error: 'Justificativa não encontrada'
                        });
                        return;
                    }

                    justificativas[index] = {
                        ...justificativas[index],
                        status: 'aprovado',
                        decisaoPor: approvedBy,
                        decisaoEm: new Date().toISOString(),
                        observacoes: observations || null
                    };

                    LocalStorageService.save(this.STORAGE_KEY, justificativas);

                    // Trigger de notificação para colaborador
                    if (typeof window !== 'undefined') {
                        setTimeout(async () => {
                            try {
                                const notificationTriggers = (await import('./notificationTriggers')).default;
                                const justificativa = justificativas[index];
                                await notificationTriggers.onJustificativaDecidida(
                                    justificativa,
                                    'aprovada',
                                    null,
                                    { id: approvedBy, name: approvedBy }
                                );
                            } catch (error) {
                                console.error('Erro ao disparar notificação de aprovação:', error);
                            }
                        }, 300);
                    }

                    resolve({
                        success: true,
                        data: justificativas[index]
                    });
                } catch (error) {
                    console.error('Erro ao aprovar justificativa:', error);
                    resolve({
                        success: false,
                        error: error.message || 'Erro desconhecido ao aprovar justificativa'
                    });
                }
            }, 0);
        });
    }

    async rejectJustificativa(id, rejectedBy, motivoRecusa) {
        return new Promise((resolve, reject) => {
            try {
                if (!motivoRecusa || motivoRecusa.trim().length < 10) {
                    resolve({
                        success: false,
                        error: 'Motivo da recusa é obrigatório (mínimo 10 caracteres)'
                    });
                    return;
                }

                const justificativas = this.getJustificativas();
                const index = justificativas.findIndex(j => j.id === id);

                if (index === -1) {
                    resolve({
                        success: false,
                        error: 'Justificativa não encontrada'
                    });
                    return;
                }

                justificativas[index] = {
                    ...justificativas[index],
                    status: 'recusado',
                    decisaoPor: rejectedBy,
                    decisaoEm: new Date().toISOString(),
                    motivoRecusa: motivoRecusa.trim()
                };

                LocalStorageService.save(this.STORAGE_KEY, justificativas);

                // Trigger de notificação para colaborador
                if (typeof window !== 'undefined') {
                    setTimeout(async () => {
                        try {
                            const notificationTriggers = (await import('./notificationTriggers')).default;
                            const justificativa = justificativas[index];
                            await notificationTriggers.onJustificativaDecidida(
                                justificativa,
                                'rejeitada',
                                motivoRecusa.trim(),
                                { id: rejectedBy, name: rejectedBy }
                            );
                        } catch (error) {
                            console.error('Erro ao disparar notificação de recusa:', error);
                        }
                    }, 300);
                }

                resolve({
                    success: true,
                    data: justificativas[index]
                });
            } catch (error) {
                console.error('Erro ao recusar justificativa:', error);
                resolve({
                    success: false,
                    error: error.message || 'Erro desconhecido ao recusar justificativa'
                });
            }
        });
    }

    getHistorico() {
        return this.getJustificativas();
    }

    initializeSampleData() {
        const existing = LocalStorageService.load(this.STORAGE_KEY);
        if (existing && existing.length > 0) return;

        const sampleData = [
            {
                id: '1',
                colaboradorId: '1',
                colaboradorNome: 'João Silva',
                tipo: 'ausencia',
                dataEvento: '2025-10-20',
                horario: null,
                motivo: 'Ausência por motivo médico com atestado. Comparecimento ao pronto-socorro para tratamento de enxaqueca severa.',
                anexo: { name: 'atestado-medico.pdf', url: '#', type: 'pdf' },
                status: 'pendente',
                criadoEm: '2025-10-19T14:30:00.000Z',
                decisaoPor: null,
                decisaoEm: null,
                observacoes: null,
                motivoRecusa: null
            },
            {
                id: '2',
                colaboradorId: '2',
                colaboradorNome: 'Maria Santos',
                tipo: 'atraso',
                dataEvento: '2025-10-22',
                horario: '09:15',
                motivo: 'Atraso devido a grave acidente de trânsito no caminho para o trabalho. Autoridades interditarem a via principal.',
                anexo: null,
                status: 'aprovado',
                criadoEm: '2025-10-21T18:00:00.000Z',
                decisaoPor: 'Admin',
                decisaoEm: '2025-10-22T08:15:00.000Z',
                observacoes: 'Justificativa aprovada. Situação fora do controle do colaborador.',
                motivoRecusa: null
            },
            {
                id: '3',
                colaboradorId: '3',
                colaboradorNome: 'Pedro Oliveira',
                tipo: 'ausencia',
                dataEvento: '2025-10-18',
                horario: null,
                motivo: 'Falecimento de familiar próximo com necessidade de comparecimento a funerália e documentação.',
                anexo: null,
                status: 'aprovado',
                criadoEm: '2025-10-17T16:30:00.000Z',
                decisaoPor: 'Manager',
                decisaoEm: '2025-10-17T20:00:00.000Z',
                observacoes: 'Aprovado. Condolências à família.',
                motivoRecusa: null
            },
            {
                id: '4',
                colaboradorId: '4',
                colaboradorNome: 'Ana Costa',
                tipo: 'atraso',
                dataEvento: '2025-10-21',
                horario: '08:45',
                motivo: 'Problema com transporte público. Ônibus quebrou no trajeto e não havia alternativa imediata.',
                anexo: null,
                status: 'recusado',
                criadoEm: '2025-10-20T22:00:00.000Z',
                decisaoPor: 'Admin',
                decisaoEm: '2025-10-21T09:30:00.000Z',
                observacoes: null,
                motivoRecusa: 'Problema de transporte não justifica atraso recorrente. Recomendamos rever horário de saída de casa.'
            },
            {
                id: '5',
                colaboradorId: '1',
                colaboradorNome: 'João Silva',
                tipo: 'atraso',
                dataEvento: '2025-10-24',
                horario: '07:30',
                motivo: 'Emergência familiar. Filho teve febre alta durante a madrugada e precisou levar ao pediatra.',
                anexo: { name: 'receita-medica.jpg', url: '#', type: 'image' },
                status: 'pendente',
                criadoEm: '2025-10-24T07:00:00.000Z',
                decisaoPor: null,
                decisaoEm: null,
                observacoes: null,
                motivoRecusa: null
            }
        ];

        LocalStorageService.save(this.STORAGE_KEY, sampleData);
    }
}

const justificativasService = new JustificativasService();
export default justificativasService;

