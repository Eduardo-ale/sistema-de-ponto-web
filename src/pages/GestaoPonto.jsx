import React, { useState, useEffect } from 'react';
import {
    Clock,
    Users,
    Calendar,
    Edit3,
    History,
    Filter,
    Search,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Loader2,
    FileText,
    Download,
    TrendingUp,
    TrendingDown,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import CorrecaoMarcacaoModal from '../components/modals/CorrecaoMarcacaoModal';
import HistoricoCorrecoesModal from '../components/modals/HistoricoCorrecoesModal';
import DetalhesHorasModal from '../components/modals/DetalhesHorasModal';
import correcaoMarcacoesService from '../services/correcaoMarcacoesService';
import horasService from '../services/horasService';
import { formatarHoras } from '../utils/calculoHorasUtils';

const GestaoPonto = ({ onVoltar }) => {
    const { user } = useAuth();
    const canEdit = user?.role === 'admin' || user?.role === 'manager';

    const [marcacoes, setMarcacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterPeriodo, setFilterPeriodo] = useState('todos');
    const [filterStatus, setFilterStatus] = useState('');
    const [showCorrecaoModal, setShowCorrecaoModal] = useState(false);
    const [showHistoricoModal, setShowHistoricoModal] = useState(false);
    const [showDetalhesModal, setShowDetalhesModal] = useState(false);
    const [selectedMarcacao, setSelectedMarcacao] = useState(null);
    const [calculos, setCalculos] = useState({});

    useEffect(() => {
        loadMarcacoes();
    }, []);

    // Função para detectar faltas de batida (com throttling e cache)
    const detectarFaltasBatida = async (marcacoes) => {
        try {
            // Usar flag para evitar execuções simultâneas
            if (window._detectandoFaltasBatida) {
                return;
            }
            window._detectandoFaltasBatida = true;

            // Cache: verificar última execução (executar no máximo uma vez a cada 10 minutos)
            const ultimaExecucao = localStorage.getItem('ultima_deteccao_faltas');
            if (ultimaExecucao) {
                const agora = Date.now();
                const tempoPassado = agora - parseInt(ultimaExecucao);
                if (tempoPassado < 600000) { // 10 minutos
                    window._detectandoFaltasBatida = false;
                    return;
                }
            }
            localStorage.setItem('ultima_deteccao_faltas', Date.now().toString());

            // Buscar usuários ativos
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const usuariosAtivos = users.filter(u => u.status === true || u.status === 'Ativo');

            // Verificar apenas últimos 3 dias (ao invés de 7) para reduzir processamento
            const hoje = new Date();
            const diasAnteriores = [];
            for (let i = 0; i < 3; i++) {
                const data = new Date(hoje);
                data.setDate(data.getDate() - i);
                // Ignorar domingos
                if (data.getDay() !== 0) {
                    diasAnteriores.push(data.toISOString().split('T')[0]);
                }
            }

            // Carregar notificações uma única vez
            const notificacoes = JSON.parse(localStorage.getItem('notificacoes_central') || '[]');

            // Processar em batch para não bloquear
            let processado = 0;
            const PROCESSAR_POR_VEZ = 5; // Processar 5 de cada vez

            for (let i = 0; i < usuariosAtivos.length; i += PROCESSAR_POR_VEZ) {
                const batch = usuariosAtivos.slice(i, i + PROCESSAR_POR_VEZ);

                await Promise.all(batch.map(async (usuario) => {
                    for (const dataStr of diasAnteriores) {
                        // Verificar se já existe marcação
                        const temMarcacao = marcacoes.some(m =>
                            (m.colaborador === usuario.name || m.email === usuario.email) &&
                            m.data === dataStr
                        );

                        // Verificar se já foi notificado
                        const jaNotificado = notificacoes.some(n =>
                            n.usuario_destinatario_id === usuario.id &&
                            n.metadata?.data === dataStr &&
                            n.metadata?.subtipo === 'falta_batida'
                        );

                        if (!temMarcacao && !jaNotificado) {
                            // Buscar gestor do departamento
                            const gestores = users.filter(u =>
                                u.department === usuario.department &&
                                (u.profile === 'Gestor' || u.profile === 'Administrador' || u.role === 'admin')
                            );

                            // Disparar notificação (com delay para não sobrecarregar)
                            try {
                                const notificationTriggers = (await import('../services/notificationTriggers')).default;
                                const gestorPrincipal = gestores[0] || { id: 'admin', email: 'admin@sistema.com' };

                                await notificationTriggers.onFaltaBatida(
                                    usuario.id || usuario.email,
                                    usuario.name || usuario.nome,
                                    usuario.email,
                                    dataStr,
                                    'entrada',
                                    gestorPrincipal.id || gestorPrincipal,
                                    gestorPrincipal.email
                                );
                            } catch (error) {
                                console.error('Erro ao disparar notificação de falta de batida:', error);
                            }
                        }
                    }
                }));

                // Dar um respiro ao sistema
                if (i + PROCESSAR_POR_VEZ < usuariosAtivos.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            window._detectandoFaltasBatida = false;
        } catch (error) {
            console.error('Erro ao detectar faltas de batida:', error);
            window._detectandoFaltasBatida = false;
        }
    };

    const loadMarcacoes = async () => {
        try {
            setLoading(true);
            const data = await correcaoMarcacoesService.getMarcacoes();
            setMarcacoes(data);

            // Calcular horas apenas para marcações válidas
            const calculosMap = {};
            for (const marcacao of data) {
                // Filtrar marcações inválidas antes de tentar calcular
                const entradaValida = marcacao.entrada && typeof marcacao.entrada === 'string' && marcacao.entrada.trim() !== '';
                const saidaValida = marcacao.saida && typeof marcacao.saida === 'string' && marcacao.saida.trim() !== '';

                // Pular marcações sem entrada ou saída válidas
                if (!entradaValida || !saidaValida) {
                    continue; // Pula esta marcação e continua com a próxima
                }

                try {
                    const resultado = await horasService.calcularHorasDia(marcacao);
                    if (resultado.success && resultado.data) {
                        calculosMap[marcacao.id] = resultado.data;
                        // O cálculo já foi salvo automaticamente pelo calcularHorasDia
                        // Mas garantimos que está no mapa local
                    }
                } catch (err) {
                    // Erro silencioso - apenas continua com as próximas marcações
                    if (err.message && !err.message.includes('Dados de marcação inválidos')) {
                        console.warn(`Aviso ao calcular horas para marcação ${marcacao.id}:`, err.message);
                    }
                }
            }
            setCalculos(calculosMap);

            // Detectar faltas de batida apenas uma vez por carga (com delay para não bloquear)
            // Executar em background sem bloquear a UI
            setTimeout(() => {
                detectarFaltasBatida(data).catch(() => { });
            }, 2000);

            // Disparar evento apenas uma vez após todos os cálculos
            // com debounce para evitar múltiplas atualizações
            if (Object.keys(calculosMap).length > 0) {
                // Usar flag para garantir que só dispara uma vez por carregamento
                if (typeof window !== 'undefined' && !window._gestaoPontoEventDispatched) {
                    window._gestaoPontoEventDispatched = true;
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('calculosAtualizados', {
                            bubbles: false,
                            cancelable: false
                        }));
                        // Resetar flag após 1 segundo
                        setTimeout(() => {
                            window._gestaoPontoEventDispatched = false;
                        }, 1000);
                    }, 300);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar marcações:', error);
            toast.error('Erro ao carregar marcações', {
                icon: '❌',
                style: {
                    background: '#EF4444',
                    color: '#fff'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVoltar = () => {
        if (onVoltar) {
            onVoltar();
        } else {
            // Fallback caso não seja passada a função
            console.warn('Função onVoltar não fornecida');
        }
    };

    const handleEditMarcacao = (marcacao) => {
        if (!canEdit) {
            toast.error('Você não tem permissão para corrigir marcações', {
                icon: '🔒',
                style: {
                    background: '#EF4444',
                    color: '#fff'
                }
            });
            return;
        }
        setSelectedMarcacao(marcacao);
        setShowCorrecaoModal(true);
    };

    const handleViewHistorico = (marcacao) => {
        setSelectedMarcacao(marcacao);
        setShowHistoricoModal(true);
    };

    const handleCorrecaoSuccess = async () => {
        await loadMarcacoes();

        // Recalcular horas após correção
        if (selectedMarcacao) {
            try {
                const resultado = await horasService.calcularHorasDia(selectedMarcacao);
                if (resultado.success) {
                    setCalculos(prev => ({
                        ...prev,
                        [selectedMarcacao.id]: resultado.data
                    }));

                    // Disparar evento com debounce para atualizar cards do Dashboard
                    if (typeof window !== 'undefined') {
                        setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('calculosAtualizados', {
                                bubbles: false,
                                cancelable: false
                            }));
                        }, 200);
                    }
                }
            } catch (err) {
                console.error('Erro ao recalcular horas:', err);
            }
        }

        toast.success('Correção realizada com sucesso! Horas recalculadas.', {
            icon: '✅',
            style: {
                background: '#10B981',
                color: '#fff'
            }
        });
    };

    const handleViewDetalhes = (marcacao) => {
        setSelectedMarcacao(marcacao);
        setShowDetalhesModal(true);
    };

    const getFilteredMarcacoes = () => {
        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

        return marcacoes.filter(marcacao => {
            const matchesSearch = marcacao.colaborador.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDate = !filterDate || marcacao.data === filterDate;
            const matchesStatus = !filterStatus || marcacao.status === filterStatus;

            // Filtro por período
            let matchesPeriodo = true;
            if (filterPeriodo !== 'todos') {
                const dataMarcacao = new Date(marcacao.data);
                switch (filterPeriodo) {
                    case 'hoje':
                        matchesPeriodo = dataMarcacao.toDateString() === hoje.toDateString();
                        break;
                    case 'semana':
                        matchesPeriodo = dataMarcacao >= inicioSemana && dataMarcacao <= hoje;
                        break;
                    case 'mes':
                        matchesPeriodo = dataMarcacao >= inicioMes && dataMarcacao <= hoje;
                        break;
                }
            }

            return matchesSearch && matchesDate && matchesStatus && matchesPeriodo;
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Original':
                return 'text-gray-400 bg-gray-900/20';
            case 'Corrigida':
                return 'text-green-400 bg-green-900/20';
            case 'Normal':
                return 'text-green-400 bg-green-900/20';
            case 'Atrasado':
                return 'text-yellow-400 bg-yellow-900/20';
            case 'Faltou':
                return 'text-red-400 bg-red-900/20';
            default:
                return 'text-gray-400 bg-gray-900/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Normal':
                return <CheckCircle className="w-4 h-4" />;
            case 'Atrasado':
                return <AlertCircle className="w-4 h-4" />;
            case 'Faltou':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const filteredMarcacoes = getFilteredMarcacoes();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header com Botão Voltar */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleVoltar}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Voltar</span>
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-600/20 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Gestão de Ponto
                                </h1>
                                <p className="text-sm text-gray-400">
                                    Correção de marcações e histórico
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {!canEdit && (
                            <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-yellow-300">Visualização apenas</span>
                            </div>
                        )}
                        <button
                            onClick={loadMarcacoes}
                            disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Atualizar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-gray-800/50 border-b border-gray-700 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por colaborador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <select
                            value={filterPeriodo}
                            onChange={(e) => setFilterPeriodo(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                            <option value="todos">Todos os períodos</option>
                            <option value="hoje">Hoje</option>
                            <option value="semana">Esta semana</option>
                            <option value="mes">Este mês</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Todos os status</option>
                            <option value="Original">Original</option>
                            <option value="Corrigida">Corrigida</option>
                        </select>
                    </div>

                    <div>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterDate('');
                                setFilterPeriodo('todos');
                                setFilterStatus('');
                            }}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Limpar Filtros</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                            <span className="text-white text-lg">Carregando marcações...</span>
                        </div>
                    </div>
                ) : filteredMarcacoes.length === 0 ? (
                    <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">
                            Nenhuma marcação encontrada
                        </h3>
                        <p className="text-gray-400">
                            Não há marcações que correspondam aos filtros aplicados.
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Colaborador
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Data
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Entrada
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Saída
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Total Horas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Horas Extras
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Banco de Horas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Saldo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {filteredMarcacoes.map((marcacao) => {
                                        const calculo = calculos[marcacao.id];
                                        const saldo = calculo?.bancoHoras?.saldo ?? 0;
                                        const saldoColor = saldo > 0 ? 'text-green-400' : saldo < 0 ? 'text-red-400' : 'text-gray-400';

                                        return (
                                            <tr
                                                key={marcacao.id}
                                                className="hover:bg-gray-700 transition-colors cursor-pointer"
                                                onClick={() => handleViewDetalhes(marcacao)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                            <Users className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-white">
                                                                {marcacao.colaborador}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {new Date(marcacao.data).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                                                    {marcacao.entrada || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                                                    {marcacao.saida || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {calculo ? formatarHoras(calculo.horasTrabalhadas) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {calculo && calculo.horasExtras.total > 0 ? (
                                                        <span className="text-yellow-400 font-medium">
                                                            {formatarHoras(calculo.horasExtras.total)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {calculo ? (
                                                        <div className="flex flex-col">
                                                            <span className={`${calculo.bancoHoras.positivo > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                                                +{formatarHoras(calculo.bancoHoras.positivo)}
                                                            </span>
                                                            <span className={`${calculo.bancoHoras.negativo > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                                                -{formatarHoras(calculo.bancoHoras.negativo)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                                    {calculo ? (
                                                        <div className="flex items-center space-x-1">
                                                            {saldo >= 0 ? (
                                                                <TrendingUp className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <TrendingDown className="w-4 h-4 text-red-400" />
                                                            )}
                                                            <span className={saldoColor}>
                                                                {formatarHoras(Math.abs(saldo))}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(marcacao.status)}`}>
                                                        {getStatusIcon(marcacao.status)}
                                                        <span>{marcacao.status}</span>
                                                    </span>
                                                    {calculo?.atraso?.atrasado && (
                                                        <div className="mt-1 text-xs text-yellow-400">
                                                            Atraso: {calculo.atraso.minutos}min
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleViewDetalhes(marcacao)}
                                                            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
                                                            title="Ver detalhes de horas"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            <span>Detalhes</span>
                                                        </button>
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => handleEditMarcacao(marcacao)}
                                                                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                                                                title="Corrigir marcação"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                                <span>Corrigir</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleViewHistorico(marcacao)}
                                                            className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                                                            title="Ver histórico de correções"
                                                        >
                                                            <History className="w-4 h-4" />
                                                            <span>Histórico</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Totais no Rodapé */}
                        {filteredMarcacoes.length > 0 && (
                            <div className="bg-gray-700 border-t border-gray-600 px-6 py-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Total de Horas:</span>
                                        <span className="ml-2 text-white font-semibold">
                                            {formatarHoras(
                                                filteredMarcacoes.reduce((sum, m) => {
                                                    const calc = calculos[m.id];
                                                    return sum + (calc?.horasTrabalhadas || 0);
                                                }, 0)
                                            )}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Total Extras:</span>
                                        <span className="ml-2 text-yellow-400 font-semibold">
                                            {formatarHoras(
                                                filteredMarcacoes.reduce((sum, m) => {
                                                    const calc = calculos[m.id];
                                                    return sum + (calc?.horasExtras?.total || 0);
                                                }, 0)
                                            )}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Banco Positivo:</span>
                                        <span className="ml-2 text-green-400 font-semibold">
                                            {formatarHoras(
                                                filteredMarcacoes.reduce((sum, m) => {
                                                    const calc = calculos[m.id];
                                                    return sum + (calc?.bancoHoras?.positivo || 0);
                                                }, 0)
                                            )}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Banco Negativo:</span>
                                        <span className="ml-2 text-red-400 font-semibold">
                                            {formatarHoras(
                                                filteredMarcacoes.reduce((sum, m) => {
                                                    const calc = calculos[m.id];
                                                    return sum + (calc?.bancoHoras?.negativo || 0);
                                                }, 0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modais */}
            <AnimatePresence>
                {showCorrecaoModal && (
                    <CorrecaoMarcacaoModal
                        isOpen={showCorrecaoModal}
                        onClose={() => {
                            setShowCorrecaoModal(false);
                            setSelectedMarcacao(null);
                        }}
                        marcacao={selectedMarcacao}
                        onSuccess={handleCorrecaoSuccess}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showHistoricoModal && (
                    <HistoricoCorrecoesModal
                        isOpen={showHistoricoModal}
                        onClose={() => {
                            setShowHistoricoModal(false);
                            setSelectedMarcacao(null);
                        }}
                        marcacao={selectedMarcacao}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDetalhesModal && (
                    <DetalhesHorasModal
                        isOpen={showDetalhesModal}
                        onClose={() => {
                            setShowDetalhesModal(false);
                            setSelectedMarcacao(null);
                        }}
                        marcacao={selectedMarcacao}
                        calculo={selectedMarcacao ? calculos[selectedMarcacao.id] : null}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default GestaoPonto;