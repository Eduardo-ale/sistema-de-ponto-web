import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    User,
    LogIn,
    LogOut,
    Coffee,
    Briefcase,
    Bell,
    Volume2,
    VolumeX,
    Settings,
    RefreshCw,
    Filter,
    Search,
    Calendar,
    Users,
    Activity,
    ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const PontoTempoReal = ({ onVoltar }) => {
    const [batidas, setBatidas] = useState([]);
    const [notificacao, setNotificacao] = useState(null);
    const [somAtivado, setSomAtivado] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroColaborador, setFiltroColaborador] = useState('');
    const [isConnected, setIsConnected] = useState(true);
    const [estatisticas, setEstatisticas] = useState({
        totalHoje: 0,
        entradas: 0,
        saidas: 0,
        almocos: 0,
        retornos: 0
    });

    const audioRef = useRef(null);
    const notificationTimeoutRef = useRef(null);

    // Simular conexão WebSocket (em produção seria socket.io-client)
    useEffect(() => {
        // Simular conexão WebSocket
        const simulateWebSocket = () => {
            setIsConnected(true);

            // Simular recebimento de batidas em tempo real
            const interval = setInterval(() => {
                if (Math.random() > 0.7) { // 30% de chance de nova batida
                    const novaBatida = gerarBatidaAleatoria();
                    adicionarBatida(novaBatida);
                }
            }, 3000); // Verificar a cada 3 segundos

            return () => {
                clearInterval(interval);
                setIsConnected(false);
            };
        };

        const cleanup = simulateWebSocket();
        return cleanup;
    }, []);

    // Gerar batida aleatória para demonstração
    const gerarBatidaAleatoria = () => {
        const colaboradores = [
            { id: 1, nome: 'Ana Silva', departamento: 'RH' },
            { id: 2, nome: 'Carlos Santos', departamento: 'TI' },
            { id: 3, nome: 'Maria Oliveira', departamento: 'Financeiro' },
            { id: 4, nome: 'João Costa', departamento: 'Comercial' },
            { id: 5, nome: 'Fernanda Lima', departamento: 'Operações' },
            { id: 6, nome: 'Pedro Alves', departamento: 'Atendimento' },
            { id: 7, nome: 'Lucia Mendes', departamento: 'Marketing' },
            { id: 8, nome: 'Roberto Silva', departamento: 'Jurídico' }
        ];

        const tiposBatida = ['entrada', 'saida_almoco', 'retorno_almoco', 'saida'];
        const colaborador = colaboradores[Math.floor(Math.random() * colaboradores.length)];
        const tipoBatida = tiposBatida[Math.floor(Math.random() * tiposBatida.length)];

        return {
            id: Date.now() + Math.random(),
            colaborador,
            tipoBatida,
            horario: new Date().toISOString(),
            ip: '192.168.1.100',
            dispositivo: 'Terminal Principal'
        };
    };

    // Adicionar nova batida
    const adicionarBatida = (novaBatida) => {
        setBatidas(prev => [novaBatida, ...prev.slice(0, 49)]); // Manter apenas 50 registros

        // Atualizar estatísticas
        setEstatisticas(prev => ({
            totalHoje: prev.totalHoje + 1,
            entradas: prev.entradas + (novaBatida.tipoBatida === 'entrada' ? 1 : 0),
            saidas: prev.saidas + (novaBatida.tipoBatida === 'saida' ? 1 : 0),
            almocos: prev.almocos + (novaBatida.tipoBatida === 'saida_almoco' ? 1 : 0),
            retornos: prev.retornos + (novaBatida.tipoBatida === 'retorno_almoco' ? 1 : 0)
        }));

        // Mostrar notificação
        mostrarNotificacao(novaBatida);

        // Tocar som se ativado
        if (somAtivado) {
            tocarSom();
        }
    };

    // Mostrar notificação
    const mostrarNotificacao = (batida) => {
        const mensagem = getMensagemBatida(batida.tipoBatida);

        setNotificacao({
            id: Date.now(),
            mensagem,
            colaborador: batida.colaborador.nome,
            tipoBatida: batida.tipoBatida,
            horario: batida.horario
        });

        // Limpar notificação anterior
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }

        // Auto-remover notificação após 4 segundos
        notificationTimeoutRef.current = setTimeout(() => {
            setNotificacao(null);
        }, 4000);

        // Toast adicional
        toast.success(`${mensagem} - ${batida.colaborador.nome}`, {
            duration: 3000,
            icon: getIconeBatida(batida.tipoBatida)
        });
    };

    // Obter mensagem da batida
    const getMensagemBatida = (tipo) => {
        const mensagens = {
            entrada: 'Entrada registrada',
            saida_almoco: 'Saída para almoço',
            retorno_almoco: 'Retorno do almoço',
            saida: 'Saída registrada'
        };
        return mensagens[tipo] || 'Batida registrada';
    };

    // Obter ícone da batida
    const getIconeBatida = (tipo) => {
        const icones = {
            entrada: '🟢',
            saida_almoco: '🟡',
            retorno_almoco: '🔵',
            saida: '🔴'
        };
        return icones[tipo] || '⏰';
    };

    // Tocar som de notificação
    const tocarSom = () => {
        try {
            // Criar som programaticamente (sem arquivo externo)
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Erro ao reproduzir som:', error);
        }
    };

    // Filtrar batidas
    const batidasFiltradas = batidas.filter(batida => {
        const tipoMatch = filtroTipo === 'todos' || batida.tipoBatida === filtroTipo;
        const colaboradorMatch = filtroColaborador === '' ||
            batida.colaborador.nome.toLowerCase().includes(filtroColaborador.toLowerCase());
        return tipoMatch && colaboradorMatch;
    });

    // Limpar histórico
    const limparHistorico = () => {
        if (window.confirm('Tem certeza que deseja limpar o histórico de batidas?')) {
            setBatidas([]);
            setEstatisticas({
                totalHoje: 0,
                entradas: 0,
                saidas: 0,
                almocos: 0,
                retornos: 0
            });
            toast.success('Histórico limpo com sucesso');
        }
    };

    // Formatar horário
    const formatarHorario = (horario) => {
        return new Date(horario).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Função para voltar ao dashboard
    const handleVoltar = () => {
        if (onVoltar) {
            onVoltar();
        } else {
            // Fallback caso não seja passada a função
            console.warn('Função onVoltar não fornecida');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* Botão Voltar */}
                    <button
                        onClick={handleVoltar}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Voltar</span>
                    </button>

                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-800/30 rounded-lg">
                            <Activity className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-200">
                                Ponto em Tempo Real
                            </h2>
                            <p className="text-sm text-gray-400">
                                Monitoramento de batidas de ponto em tempo real
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Status de conexão */}
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isConnected
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                        <span className="text-sm font-medium">
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </span>
                    </div>

                    {/* Controle de som */}
                    <motion.button
                        onClick={() => setSomAtivado(!somAtivado)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-lg transition-colors ${somAtivado
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                            }`}
                        title={somAtivado ? 'Desativar som' : 'Ativar som'}
                    >
                        {somAtivado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </motion.button>

                    {/* Atualizar */}
                    <motion.button
                        onClick={() => window.location.reload()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCw className="h-4 w-4 text-gray-300" />
                    </motion.button>
                </div>
            </div>

            {/* Notificação flutuante */}
            <AnimatePresence>
                {notificacao && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-blue-500/30 max-w-sm"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/30 rounded-lg">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{notificacao.mensagem}</p>
                                <p className="text-xs text-blue-100">{notificacao.colaborador}</p>
                                <p className="text-xs text-blue-200">
                                    {formatarHorario(notificacao.horario)}
                                </p>
                            </div>
                            <button
                                onClick={() => setNotificacao(null)}
                                className="text-blue-200 hover:text-white transition-colors"
                            >
                                ×
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <span className="text-sm text-gray-400">Total Hoje</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{estatisticas.totalHoje}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex items-center space-x-2">
                        <LogIn className="h-5 w-5 text-green-400" />
                        <span className="text-sm text-gray-400">Entradas</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{estatisticas.entradas}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex items-center space-x-2">
                        <Coffee className="h-5 w-5 text-yellow-400" />
                        <span className="text-sm text-gray-400">Almoços</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">{estatisticas.almocos}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex items-center space-x-2">
                        <Briefcase className="h-5 w-5 text-blue-400" />
                        <span className="text-sm text-gray-400">Retornos</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{estatisticas.retornos}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex items-center space-x-2">
                        <LogOut className="h-5 w-5 text-red-400" />
                        <span className="text-sm text-gray-400">Saídas</span>
                    </div>
                    <p className="text-2xl font-bold text-red-400">{estatisticas.saidas}</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                <div className="flex items-center space-x-2 mb-4">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Filtros</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filtro por tipo */}
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                        <option value="todos">Todos os tipos</option>
                        <option value="entrada">Entrada</option>
                        <option value="saida_almoco">Saída para almoço</option>
                        <option value="retorno_almoco">Retorno do almoço</option>
                        <option value="saida">Saída</option>
                    </select>

                    {/* Filtro por colaborador */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar colaborador..."
                            value={filtroColaborador}
                            onChange={(e) => setFiltroColaborador(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Limpar histórico */}
                    <motion.button
                        onClick={limparHistorico}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200 text-sm font-medium"
                    >
                        Limpar Histórico
                    </motion.button>
                </div>
            </div>

            {/* Lista de batidas */}
            <div className="bg-gray-800/50 rounded-lg border border-gray-700/30 overflow-hidden">
                <div className="p-4 border-b border-gray-700/30">
                    <h3 className="text-lg font-semibold text-gray-200">
                        Batidas Recentes ({batidasFiltradas.length})
                    </h3>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {batidasFiltradas.length === 0 ? (
                        <div className="p-8 text-center">
                            <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400 mb-2">Nenhuma batida encontrada</p>
                            <p className="text-sm text-gray-500">
                                {batidas.length === 0
                                    ? 'Aguardando batidas de ponto...'
                                    : 'Tente ajustar os filtros para encontrar batidas'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-700/30">
                            <AnimatePresence>
                                {batidasFiltradas.map((batida, index) => (
                                    <motion.div
                                        key={batida.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-4 hover:bg-gray-700/30 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-gray-700 rounded-lg">
                                                    {getIconeBatida(batida.tipoBatida)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-200">
                                                        {batida.colaborador.nome}
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        {getMensagemBatida(batida.tipoBatida)} • {batida.colaborador.departamento}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-200">
                                                    {formatarHorario(batida.horario)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {batida.dispositivo}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PontoTempoReal;
