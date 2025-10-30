/**
 * Modal para Relatórios e Auditorias
 * Inclui duas abas: Relatórios Customizados e Auditoria Detalhada
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    FileText,
    BarChart3,
    Shield,
    Download,
    FileSpreadsheet,
    RefreshCw,
    Clock,
    Users,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Calendar,
    Loader2,
    Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import relatoriosService from '../../services/relatoriosService';
import auditoriaService from '../../services/auditoriaService';
import { exportarParaPDF, exportarParaXLSX, exportarParaCSV, formatarDadosParaExportacao, gerarNomeArquivo } from '../../utils/exportUtils';
import FiltroRelatorio from '../ui/FiltroRelatorio';
import TabelaRelatorio from '../ui/TabelaRelatorio';
import SeletorColunas from '../ui/SeletorColunas';

const RelatoriosAuditoriasModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [abaAtiva, setAbaAtiva] = useState('relatorios');
    const [tipoRelatorio, setTipoRelatorio] = useState(null);
    const [filtrosRelatorio, setFiltrosRelatorio] = useState({
        dataInicio: '',
        dataFim: '',
        departamento: '',
        colaborador: ''
    });
    const [filtrosAuditoria, setFiltrosAuditoria] = useState({
        dataInicio: '',
        dataFim: '',
        usuario: '',
        tipoAcao: 'todos',
        departamento: '',
        busca: ''
    });
    const [dadosRelatorio, setDadosRelatorio] = useState([]);
    const [dadosAuditoria, setDadosAuditoria] = useState([]);
    const [loading, setLoading] = useState(false);
    const [colunasSelecionadas, setColunasSelecionadas] = useState([]);
    const [logSelecionado, setLogSelecionado] = useState(null);

    const departamentos = [
        'Administração', 'Recursos Humanos', 'TI', 'Financeiro',
        'Vendas', 'Marketing', 'Operações', 'Fisioterapia',
        'Enfermagem', 'Medicina'
    ];

    const tiposRelatorio = [
        {
            id: 'presencas',
            nome: 'Presenças, Atrasos e Faltas',
            descricao: 'Relatório de frequência dos colaboradores',
            icon: Users,
            color: 'blue'
        },
        {
            id: 'horas-trabalhadas',
            nome: 'Total de Horas Trabalhadas',
            descricao: 'Horas trabalhadas por colaborador',
            icon: Clock,
            color: 'green'
        },
        {
            id: 'horas-extras',
            nome: 'Horas Extras e Compensações',
            descricao: 'Horas extras e banco de horas',
            icon: TrendingUp,
            color: 'orange'
        },
        {
            id: 'ausencias',
            nome: 'Ausências Justificadas e Não Justificadas',
            descricao: 'Registro de ausências e justificativas',
            icon: Calendar,
            color: 'purple'
        }
    ];

    const tiposAcao = auditoriaService.getTiposAcao();

    // Definir colunas por tipo de relatório
    const colunasPorTipo = {
        presencas: [
            { key: 'colaborador', label: 'Colaborador' },
            { key: 'email', label: 'E-mail' },
            { key: 'departamento', label: 'Departamento' },
            { key: 'data', label: 'Data' },
            { key: 'entrada', label: 'Entrada' },
            { key: 'saida', label: 'Saída' },
            { key: 'horasTrabalhadas', label: 'Horas Trabalhadas', format: (v) => v ? `${v.toFixed(2)}h` : '0h' },
            { key: 'atraso', label: 'Atraso (min)', format: (v) => `${v} min` },
            { key: 'falta', label: 'Falta' },
            { key: 'status', label: 'Status' }
        ],
        'horas-trabalhadas': [
            { key: 'colaborador', label: 'Colaborador' },
            { key: 'email', label: 'E-mail' },
            { key: 'departamento', label: 'Departamento' },
            { key: 'totalHoras', label: 'Total de Horas', format: (v) => `${v.toFixed(2)}h` },
            { key: 'jornadaContratual', label: 'Jornada Contratual', format: (v) => `${v}h` },
            { key: 'diasTrabalhados', label: 'Dias Trabalhados' },
            { key: 'mediaHorasDia', label: 'Média Horas/Dia', format: (v) => `${v.toFixed(2)}h` }
        ],
        'horas-extras': [
            { key: 'colaborador', label: 'Colaborador' },
            { key: 'email', label: 'E-mail' },
            { key: 'departamento', label: 'Departamento' },
            { key: 'horasExtrasTotal', label: 'Total Horas Extras', format: (v) => `${v.toFixed(2)}h` },
            { key: 'horasExtrasDiurnas', label: 'Extras Diurnas', format: (v) => `${v.toFixed(2)}h` },
            { key: 'horasExtrasNoturnas', label: 'Extras Noturnas', format: (v) => `${v.toFixed(2)}h` },
            { key: 'horasExtrasFeriado', label: 'Extras Feriado', format: (v) => `${v.toFixed(2)}h` },
            { key: 'bancoPositivo', label: 'Banco Positivo', format: (v) => `${v.toFixed(2)}h` },
            { key: 'bancoNegativo', label: 'Banco Negativo', format: (v) => `${v.toFixed(2)}h` },
            { key: 'saldoBanco', label: 'Saldo Banco', format: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}h` }
        ],
        ausencias: [
            { key: 'colaborador', label: 'Colaborador' },
            { key: 'email', label: 'E-mail' },
            { key: 'departamento', label: 'Departamento' },
            { key: 'tipo', label: 'Tipo' },
            { key: 'dataInicio', label: 'Data Início', format: (v) => new Date(v).toLocaleDateString('pt-BR') },
            { key: 'dataFim', label: 'Data Fim', format: (v) => new Date(v).toLocaleDateString('pt-BR') },
            { key: 'duracao', label: 'Duração (dias)' },
            { key: 'justificada', label: 'Justificada' },
            { key: 'status', label: 'Status' },
            { key: 'observacao', label: 'Observação' }
        ]
    };

    const colunasAuditoria = [
        { key: 'data_hora', label: 'Data/Hora', format: (v) => new Date(v).toLocaleString('pt-BR') },
        { key: 'usuario_nome', label: 'Usuário' },
        { key: 'tipo_acao', label: 'Tipo de Ação' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'entidade_afetada', label: 'Entidade Afetada' },
        { key: 'departamento', label: 'Departamento' }
    ];

    // Inicializar colunas selecionadas quando o tipo de relatório mudar
    useEffect(() => {
        if (tipoRelatorio && colunasPorTipo[tipoRelatorio]) {
            setColunasSelecionadas(colunasPorTipo[tipoRelatorio].map(c => c.key));
        }
    }, [tipoRelatorio]);

    // Carregar dados quando filtros ou tipo mudarem
    useEffect(() => {
        if (abaAtiva === 'relatorios' && tipoRelatorio) {
            carregarRelatorio();
        } else if (abaAtiva === 'auditoria') {
            carregarAuditoria();
        }
    }, [abaAtiva, tipoRelatorio, filtrosRelatorio, filtrosAuditoria]);

    const carregarRelatorio = async () => {
        if (!tipoRelatorio) return;

        setLoading(true);
        try {
            let dados = [];

            switch (tipoRelatorio) {
                case 'presencas':
                    dados = await relatoriosService.gerarRelatorioPresencas(filtrosRelatorio);
                    break;
                case 'horas-trabalhadas':
                    dados = await relatoriosService.gerarRelatorioHorasTrabalhadas(filtrosRelatorio);
                    break;
                case 'horas-extras':
                    dados = await relatoriosService.gerarRelatorioHorasExtras(filtrosRelatorio);
                    break;
                case 'ausencias':
                    dados = await relatoriosService.gerarRelatorioAusencias(filtrosRelatorio);
                    break;
                default:
                    dados = [];
            }

            setDadosRelatorio(dados);
        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
            toast.error('Erro ao carregar relatório');
            setDadosRelatorio([]);
        } finally {
            setLoading(false);
        }
    };

    const carregarAuditoria = async () => {
        setLoading(true);
        try {
            const dados = await auditoriaService.getAllLogs(filtrosAuditoria);
            setDadosAuditoria(dados);
        } catch (error) {
            console.error('Erro ao carregar auditoria:', error);
            toast.error('Erro ao carregar logs de auditoria');
            setDadosAuditoria([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExportar = async (formato) => {
        try {
            let dados = [];
            let tipo = '';
            let nomeTipo = '';

            if (abaAtiva === 'relatorios' && tipoRelatorio) {
                dados = dadosRelatorio;
                tipo = tipoRelatorio;
                nomeTipo = tiposRelatorio.find(t => t.id === tipoRelatorio)?.nome || 'Relatório';
            } else if (abaAtiva === 'auditoria') {
                dados = dadosAuditoria;
                tipo = 'auditoria';
                nomeTipo = 'Auditoria';
            }

            if (!dados || dados.length === 0) {
                toast.error('Nenhum dado para exportar');
                return;
            }

            // Filtrar colunas se necessário
            const colunas = abaAtiva === 'relatorios' && tipoRelatorio
                ? colunasPorTipo[tipoRelatorio].filter(c => colunasSelecionadas.includes(c.key))
                : colunasAuditoria;

            const dadosFormatados = formatarDadosParaExportacao(dados, colunas);

            // Gerar cabeçalho
            const periodo = filtrosRelatorio.dataInicio && filtrosRelatorio.dataFim
                ? `${new Date(filtrosRelatorio.dataInicio).toLocaleDateString('pt-BR')} até ${new Date(filtrosRelatorio.dataFim).toLocaleDateString('pt-BR')}`
                : 'Período completo';

            const cabecalho = {
                'Empresa': 'CORE RH - Sistema de Ponto',
                'Tipo de Relatório': nomeTipo,
                'Período': periodo,
                'Data/Hora de Geração': new Date().toLocaleString('pt-BR'),
                'Gerado por': user?.name || 'Sistema'
            };

            // Gerar rodapé
            const rodape = {
                'Total de Registros': dados.length
            };

            const nomeArquivo = gerarNomeArquivo(tipo, periodo.replace(/\s/g, '_'), formato);

            // Exportar
            let resultado;
            if (formato === 'pdf') {
                resultado = exportarParaPDF(dadosFormatados, nomeArquivo, cabecalho, rodape, nomeTipo);
            } else if (formato === 'xlsx') {
                resultado = exportarParaXLSX(dadosFormatados, nomeArquivo, cabecalho, rodape);
            } else {
                resultado = exportarParaCSV(dadosFormatados, nomeArquivo, cabecalho);
            }

            if (resultado.success) {
                toast.success(`Relatório exportado com sucesso em formato ${formato.toUpperCase()}!`);

                // Registrar log de exportação
                auditoriaService.registrarExportacao(
                    nomeTipo,
                    formato,
                    abaAtiva === 'relatorios' ? filtrosRelatorio : filtrosAuditoria,
                    user?.id,
                    user?.name
                );
            } else {
                toast.error(`Erro ao exportar: ${resultado.error}`);
            }
        } catch (error) {
            console.error('Erro ao exportar:', error);
            toast.error('Erro ao exportar relatório');
        }
    };

    const colunasAtivas = useMemo(() => {
        if (abaAtiva === 'relatorios' && tipoRelatorio && colunasPorTipo[tipoRelatorio]) {
            return colunasPorTipo[tipoRelatorio].filter(c => colunasSelecionadas.includes(c.key));
        } else if (abaAtiva === 'auditoria') {
            return colunasAuditoria;
        }
        return [];
    }, [abaAtiva, tipoRelatorio, colunasSelecionadas]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col border border-gray-700"
                >
                    {/* Cabeçalho */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-indigo-600 rounded-xl">
                                <FileSpreadsheet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Relatórios e Auditorias</h2>
                                <p className="text-sm text-gray-400">Gere relatórios customizados e visualize logs de auditoria</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    {/* Abas */}
                    <div className="flex border-b border-gray-700">
                        <button
                            onClick={() => setAbaAtiva('relatorios')}
                            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${abaAtiva === 'relatorios'
                                    ? 'bg-gray-800 text-white border-b-2 border-indigo-500'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <BarChart3 className="w-5 h-5 inline-block mr-2" />
                            Relatórios Customizados
                        </button>
                        <button
                            onClick={() => setAbaAtiva('auditoria')}
                            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${abaAtiva === 'auditoria'
                                    ? 'bg-gray-800 text-white border-b-2 border-indigo-500'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <Shield className="w-5 h-5 inline-block mr-2" />
                            Auditoria Detalhada
                        </button>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <AnimatePresence mode="wait">
                            {abaAtiva === 'relatorios' && (
                                <motion.div
                                    key="relatorios"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    {!tipoRelatorio ? (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-white mb-4">Selecione o tipo de relatório</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {tiposRelatorio.map(tipo => {
                                                    const IconComponent = tipo.icon;
                                                    return (
                                                        <motion.button
                                                            key={tipo.id}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setTipoRelatorio(tipo.id)}
                                                            className={`p-6 bg-gray-800 rounded-xl border-2 border-gray-700 hover:border-${tipo.color}-500 transition-all text-left`}
                                                        >
                                                            <div className={`inline-block p-3 bg-${tipo.color}-600 rounded-lg mb-3`}>
                                                                <IconComponent className="w-6 h-6 text-white" />
                                                            </div>
                                                            <h4 className="text-lg font-semibold text-white mb-1">{tipo.nome}</h4>
                                                            <p className="text-sm text-gray-400">{tipo.descricao}</p>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {tiposRelatorio.find(t => t.id === tipoRelatorio)?.nome}
                                                    </h3>
                                                    <p className="text-sm text-gray-400">
                                                        {dadosRelatorio.length} registro(s) encontrado(s)
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {tipoRelatorio && (
                                                        <SeletorColunas
                                                            colunas={colunasPorTipo[tipoRelatorio]}
                                                            colunasSelecionadas={colunasSelecionadas}
                                                            onColunasChange={setColunasSelecionadas}
                                                        />
                                                    )}
                                                    <button
                                                        onClick={carregarRelatorio}
                                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm flex items-center space-x-2"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                        <span>Atualizar</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <FiltroRelatorio
                                                filtros={filtrosRelatorio}
                                                onFiltrosChange={setFiltrosRelatorio}
                                                departamentos={departamentos}
                                            />

                                            <TabelaRelatorio
                                                dados={dadosRelatorio}
                                                colunas={colunasAtivas}
                                                loading={loading}
                                                titulo={tiposRelatorio.find(t => t.id === tipoRelatorio)?.nome}
                                                onRowClick={(item) => {
                                                    // Pode abrir modal de detalhes se necessário
                                                    console.log('Item selecionado:', item);
                                                }}
                                            />

                                            {tipoRelatorio && (
                                                <button
                                                    onClick={() => setTipoRelatorio(null)}
                                                    className="text-sm text-gray-400 hover:text-white"
                                                >
                                                    ← Voltar para seleção de relatórios
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {abaAtiva === 'auditoria' && (
                                <motion.div
                                    key="auditoria"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">Logs de Auditoria</h3>
                                                <p className="text-sm text-gray-400">
                                                    {dadosAuditoria.length} registro(s) encontrado(s)
                                                </p>
                                            </div>
                                            <button
                                                onClick={carregarAuditoria}
                                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm flex items-center space-x-2"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                <span>Atualizar</span>
                                            </button>
                                        </div>

                                        <FiltroRelatorio
                                            filtros={filtrosAuditoria}
                                            onFiltrosChange={setFiltrosAuditoria}
                                            departamentos={departamentos}
                                        />

                                        {/* Filtro adicional para tipo de ação */}
                                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Tipo de Ação
                                            </label>
                                            <select
                                                value={filtrosAuditoria.tipoAcao || 'todos'}
                                                onChange={(e) => setFiltrosAuditoria({
                                                    ...filtrosAuditoria,
                                                    tipoAcao: e.target.value
                                                })}
                                                className="w-full md:w-64 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                                            >
                                                {tiposAcao.map(tipo => (
                                                    <option key={tipo.value} value={tipo.value}>
                                                        {tipo.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <TabelaRelatorio
                                            dados={dadosAuditoria}
                                            colunas={colunasAuditoria}
                                            loading={loading}
                                            titulo="Auditoria"
                                            onRowClick={(item) => setLogSelecionado(item)}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Rodapé com botões de exportação */}
                    <div className="border-t border-gray-700 p-4 flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                            {abaAtiva === 'relatorios' && tipoRelatorio && `Total: ${dadosRelatorio.length} registro(s)`}
                            {abaAtiva === 'auditoria' && `Total: ${dadosAuditoria.length} log(s)`}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleExportar('pdf')}
                                disabled={loading || (abaAtiva === 'relatorios' && (!tipoRelatorio || dadosRelatorio.length === 0)) || (abaAtiva === 'auditoria' && dadosAuditoria.length === 0)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white text-sm flex items-center space-x-2"
                            >
                                <FileText className="w-4 h-4" />
                                <span>PDF</span>
                            </button>
                            <button
                                onClick={() => handleExportar('xlsx')}
                                disabled={loading || (abaAtiva === 'relatorios' && (!tipoRelatorio || dadosRelatorio.length === 0)) || (abaAtiva === 'auditoria' && dadosAuditoria.length === 0)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white text-sm flex items-center space-x-2"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>XLSX</span>
                            </button>
                            <button
                                onClick={() => handleExportar('csv')}
                                disabled={loading || (abaAtiva === 'relatorios' && (!tipoRelatorio || dadosRelatorio.length === 0)) || (abaAtiva === 'auditoria' && dadosAuditoria.length === 0)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white text-sm flex items-center space-x-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>CSV</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Modal de detalhes do log */}
                {logSelecionado && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4"
                        onClick={() => setLogSelecionado(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full border border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">Detalhes do Log</h3>
                                <button
                                    onClick={() => setLogSelecionado(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-400">Data/Hora</p>
                                    <p className="text-white">{new Date(logSelecionado.data_hora).toLocaleString('pt-BR')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Usuário</p>
                                    <p className="text-white">{logSelecionado.usuario_nome}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Tipo de Ação</p>
                                    <p className="text-white">{logSelecionado.tipo_acao}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Descrição</p>
                                    <p className="text-white">{logSelecionado.descricao}</p>
                                </div>
                                {logSelecionado.detalhes_json && (
                                    <div>
                                        <p className="text-sm text-gray-400">Detalhes</p>
                                        <pre className="text-xs text-gray-300 bg-gray-900 p-3 rounded overflow-auto">
                                            {JSON.stringify(logSelecionado.detalhes_json, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </AnimatePresence>
    );
};

export default RelatoriosAuditoriasModal;

