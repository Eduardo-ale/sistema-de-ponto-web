/**
 * Serviço para geração de relatórios customizados
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

class RelatoriosService {
    constructor() {
        this.MARCACOES_KEY = 'marcacoesPonto';
        this.HORAS_CALCULADAS_KEY = 'horas_calculadas';
        this.AUSENCIAS_KEY = 'absences';
        this.JUSTIFICATIVAS_KEY = 'justificativas';
        this.USUARIOS_KEY = 'users';
    }

    /**
     * Carrega usuários do sistema
     */
    getUsuarios() {
        try {
            return LocalStorageService.load(this.USUARIOS_KEY) || [];
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            return [];
        }
    }

    /**
     * Busca marcações de ponto com filtros
     */
    getMarcacoes(filtros = {}) {
        try {
            let marcacoes = LocalStorageService.load(this.MARCACOES_KEY) || [];

            // Filtrar por período
            if (filtros.dataInicio) {
                const inicio = new Date(filtros.dataInicio);
                inicio.setHours(0, 0, 0, 0);
                marcacoes = marcacoes.filter(m => {
                    const data = new Date(m.data);
                    return data >= inicio;
                });
            }

            if (filtros.dataFim) {
                const fim = new Date(filtros.dataFim);
                fim.setHours(23, 59, 59, 999);
                marcacoes = marcacoes.filter(m => {
                    const data = new Date(m.data);
                    return data <= fim;
                });
            }

            // Filtrar por colaborador
            if (filtros.colaborador) {
                marcacoes = marcacoes.filter(m =>
                    m.colaborador?.toLowerCase().includes(filtros.colaborador.toLowerCase()) ||
                    m.email?.toLowerCase().includes(filtros.colaborador.toLowerCase())
                );
            }

            // Filtrar por departamento
            if (filtros.departamento) {
                const usuarios = this.getUsuarios();
                const usuariosDepartamento = usuarios
                    .filter(u => u.department === filtros.departamento)
                    .map(u => u.email || u.id);

                marcacoes = marcacoes.filter(m =>
                    usuariosDepartamento.includes(m.email) ||
                    usuariosDepartamento.includes(m.colaborador)
                );
            }

            return marcacoes;
        } catch (error) {
            console.error('Erro ao buscar marcações:', error);
            return [];
        }
    }

    /**
     * Busca cálculos de horas com filtros
     */
    getCalculosHoras(filtros = {}) {
        try {
            let calculos = LocalStorageService.load(this.HORAS_CALCULADAS_KEY) || [];

            // Filtrar por período
            if (filtros.dataInicio) {
                const inicio = new Date(filtros.dataInicio);
                inicio.setHours(0, 0, 0, 0);
                calculos = calculos.filter(c => {
                    if (!c.data) return false;
                    const data = new Date(c.data);
                    return data >= inicio;
                });
            }

            if (filtros.dataFim) {
                const fim = new Date(filtros.dataFim);
                fim.setHours(23, 59, 59, 999);
                calculos = calculos.filter(c => {
                    if (!c.data) return false;
                    const data = new Date(c.data);
                    return data <= fim;
                });
            }

            // Filtrar por colaborador
            if (filtros.colaborador) {
                calculos = calculos.filter(c =>
                    c.colaborador?.toLowerCase().includes(filtros.colaborador.toLowerCase()) ||
                    c.usuarioId?.toLowerCase().includes(filtros.colaborador.toLowerCase())
                );
            }

            return calculos;
        } catch (error) {
            console.error('Erro ao buscar cálculos:', error);
            return [];
        }
    }

    /**
     * Busca ausências com filtros
     */
    getAusencias(filtros = {}) {
        try {
            let ausencias = LocalStorageService.load(this.AUSENCIAS_KEY) || [];

            // Filtrar por período
            if (filtros.dataInicio) {
                const inicio = new Date(filtros.dataInicio);
                ausencias = ausencias.filter(a => new Date(a.fim) >= inicio);
            }

            if (filtros.dataFim) {
                const fim = new Date(filtros.dataFim);
                ausencias = ausencias.filter(a => new Date(a.inicio) <= fim);
            }

            // Filtrar por colaborador
            if (filtros.colaborador) {
                ausencias = ausencias.filter(a =>
                    a.userName?.toLowerCase().includes(filtros.colaborador.toLowerCase()) ||
                    a.userId?.toString().includes(filtros.colaborador)
                );
            }

            // Filtrar por tipo (justificada/não justificada)
            if (filtros.tipoJustificacao !== undefined) {
                const tiposJustificados = ['Feriado', 'Folga', 'Férias', 'Afastamento médico', 'Licença'];
                if (filtros.tipoJustificacao === true) {
                    ausencias = ausencias.filter(a => tiposJustificados.includes(a.tipo));
                } else {
                    ausencias = ausencias.filter(a => !tiposJustificados.includes(a.tipo));
                }
            }

            return ausencias;
        } catch (error) {
            console.error('Erro ao buscar ausências:', error);
            return [];
        }
    }

    /**
     * Gera relatório de presenças, atrasos e faltas
     */
    async gerarRelatorioPresencas(filtros = {}) {
        try {
            const marcacoes = this.getMarcacoes(filtros);
            const calculos = this.getCalculosHoras(filtros);
            const calculosMap = new Map();

            calculos.forEach(calc => {
                const key = `${calc.data}_${calc.usuarioId || calc.colaborador}`;
                calculosMap.set(key, calc);
            });

            const usuarios = this.getUsuarios();

            // Agrupar por colaborador e data
            const resultado = [];
            const colaboradoresMap = new Map();

            marcacoes.forEach(marcacao => {
                const key = `${marcacao.data}_${marcacao.email || marcacao.colaborador}`;
                const calc = calculosMap.get(key);
                const usuario = usuarios.find(u =>
                    u.email === marcacao.email ||
                    u.name === marcacao.colaborador
                );

                if (!colaboradoresMap.has(key)) {
                    colaboradoresMap.set(key, {
                        colaborador: marcacao.colaborador || usuario?.name || 'N/A',
                        email: marcacao.email || usuario?.email || 'N/A',
                        departamento: usuario?.department || 'N/A',
                        data: marcacao.data,
                        entrada: marcacao.entrada || 'N/A',
                        saida: marcacao.saida || 'N/A',
                        horasTrabalhadas: calc?.horasTrabalhadas || 0,
                        atraso: calc?.atraso?.minutos || 0,
                        falta: marcacao.saida ? 'Não' : 'Sim',
                        status: marcacao.saida ? 'Presente' : 'Falta'
                    });
                }
            });

            // Adicionar dias sem marcação como faltas
            if (filtros.dataInicio && filtros.dataFim) {
                const inicio = new Date(filtros.dataInicio);
                const fim = new Date(filtros.dataFim);
                const usuariosFiltrados = filtros.departamento
                    ? usuarios.filter(u => u.department === filtros.departamento)
                    : usuarios;

                usuariosFiltrados.forEach(usuario => {
                    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
                        const dataStr = d.toISOString().split('T')[0];
                        const key = `${dataStr}_${usuario.email || usuario.id}`;

                        if (!colaboradoresMap.has(key)) {
                            colaboradoresMap.set(key, {
                                colaborador: usuario.name,
                                email: usuario.email,
                                departamento: usuario.department || 'N/A',
                                data: dataStr,
                                entrada: 'N/A',
                                saida: 'N/A',
                                horasTrabalhadas: 0,
                                atraso: 0,
                                falta: 'Sim',
                                status: 'Falta'
                            });
                        }
                    }
                });
            }

            return Array.from(colaboradoresMap.values()).sort((a, b) =>
                new Date(a.data) - new Date(b.data)
            );
        } catch (error) {
            console.error('Erro ao gerar relatório de presenças:', error);
            return [];
        }
    }

    /**
     * Gera relatório de horas trabalhadas por colaborador
     */
    async gerarRelatorioHorasTrabalhadas(filtros = {}) {
        try {
            const calculos = this.getCalculosHoras(filtros);
            const usuarios = this.getUsuarios();

            // Agrupar por colaborador
            const colaboradoresMap = new Map();

            calculos.forEach(calc => {
                const usuarioId = calc.usuarioId || calc.colaborador;
                const usuario = usuarios.find(u =>
                    u.email === usuarioId ||
                    u.id === usuarioId ||
                    u.name === usuarioId
                );

                if (!colaboradoresMap.has(usuarioId)) {
                    colaboradoresMap.set(usuarioId, {
                        colaborador: calc.colaborador || usuario?.name || usuarioId,
                        email: usuario?.email || 'N/A',
                        departamento: usuario?.department || 'N/A',
                        totalHoras: 0,
                        jornadaContratual: calc.jornadaContratual || 8,
                        diasTrabalhados: 0,
                        mediaHorasDia: 0
                    });
                }

                const registro = colaboradoresMap.get(usuarioId);
                registro.totalHoras += calc.horasTrabalhadas || 0;
                registro.diasTrabalhados += 1;
            });

            // Calcular média
            colaboradoresMap.forEach(registro => {
                registro.mediaHorasDia = registro.diasTrabalhados > 0
                    ? registro.totalHoras / registro.diasTrabalhados
                    : 0;
            });

            return Array.from(colaboradoresMap.values());
        } catch (error) {
            console.error('Erro ao gerar relatório de horas trabalhadas:', error);
            return [];
        }
    }

    /**
     * Gera relatório de horas extras e compensações
     */
    async gerarRelatorioHorasExtras(filtros = {}) {
        try {
            const calculos = this.getCalculosHoras(filtros);
            const usuarios = this.getUsuarios();

            // Agrupar por colaborador
            const colaboradoresMap = new Map();

            calculos.forEach(calc => {
                const usuarioId = calc.usuarioId || calc.colaborador;
                const usuario = usuarios.find(u =>
                    u.email === usuarioId ||
                    u.id === usuarioId ||
                    u.name === usuarioId
                );

                if (!colaboradoresMap.has(usuarioId)) {
                    colaboradoresMap.set(usuarioId, {
                        colaborador: calc.colaborador || usuario?.name || usuarioId,
                        email: usuario?.email || 'N/A',
                        departamento: usuario?.department || 'N/A',
                        horasExtrasTotal: 0,
                        horasExtrasDiurnas: 0,
                        horasExtrasNoturnas: 0,
                        horasExtrasFeriado: 0,
                        bancoPositivo: 0,
                        bancoNegativo: 0,
                        saldoBanco: 0
                    });
                }

                const registro = colaboradoresMap.get(usuarioId);
                const extras = calc.horasExtras || {};
                registro.horasExtrasTotal += extras.total || 0;
                registro.horasExtrasDiurnas += extras.diurnas || 0;
                registro.horasExtrasNoturnas += extras.noturnas || 0;
                registro.horasExtrasFeriado += extras.feriado || 0;

                const banco = calc.bancoHoras || {};
                registro.bancoPositivo += banco.positivo || 0;
                registro.bancoNegativo += banco.negativo || 0;
                registro.saldoBanco += banco.saldo || 0;
            });

            return Array.from(colaboradoresMap.values());
        } catch (error) {
            console.error('Erro ao gerar relatório de horas extras:', error);
            return [];
        }
    }

    /**
     * Gera relatório de ausências justificadas e não justificadas
     */
    async gerarRelatorioAusencias(filtros = {}) {
        try {
            const ausencias = this.getAusencias(filtros);
            const usuarios = this.getUsuarios();

            const resultado = ausencias.map(ausencia => {
                const usuario = usuarios.find(u => u.id === ausencia.userId || u.email === ausencia.userId);

                const tiposJustificados = ['Feriado', 'Folga', 'Férias', 'Afastamento médico', 'Licença'];
                const justificada = tiposJustificados.includes(ausencia.tipo);

                // Calcular duração
                const inicio = new Date(ausencia.inicio);
                const fim = new Date(ausencia.fim);
                const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;

                return {
                    colaborador: ausencia.userName || usuario?.name || 'N/A',
                    email: usuario?.email || 'N/A',
                    departamento: usuario?.department || 'N/A',
                    tipo: ausencia.tipo,
                    dataInicio: ausencia.inicio,
                    dataFim: ausencia.fim,
                    duracao: dias,
                    justificada: justificada ? 'Sim' : 'Não',
                    status: ausencia.status || 'Ativo',
                    observacao: ausencia.observacao || ''
                };
            });

            return resultado.sort((a, b) => new Date(b.dataInicio) - new Date(a.dataInicio));
        } catch (error) {
            console.error('Erro ao gerar relatório de ausências:', error);
            return [];
        }
    }
}

const relatoriosService = new RelatoriosService();
export default relatoriosService;

