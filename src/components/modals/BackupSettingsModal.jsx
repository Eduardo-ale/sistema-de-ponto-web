/**
 * Modal para Configuração de Backups
 * Inclui 4 abas: Gerar Backup, Configuração Automática, Histórico e Restaurar
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Database,
    HardDrive,
    Download,
    Upload,
    Save,
    RefreshCw,
    Clock,
    Settings,
    FileText,
    CheckCircle,
    AlertCircle,
    Trash2,
    Eye,
    Calendar,
    Mail,
    Cloud,
    Server,
    Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useBackupManager } from '../../hooks/useBackupManager';
import ProgressModal from '../ui/ProgressModal';

const BackupSettingsModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const {
        backups,
        configuracao,
        loading,
        carregarBackups,
        gerarBackup,
        restaurarBackup,
        salvarConfiguracao,
        deletarBackup,
        baixarBackup
    } = useBackupManager();

    const [abaAtiva, setAbaAtiva] = useState('gerar');
    const [showProgress, setShowProgress] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [progressSucesso, setProgressSucesso] = useState(false);
    const [progressErro, setProgressErro] = useState(null);
    // Evitar clique acidental no botão primário ao abrir o modal
    const [interacaoHabilitada, setInteracaoHabilitada] = useState(false);
    // Flag para evitar qualquer ação enquanto o modal está fechando
    const [fechando, setFechando] = useState(false);

    // Estado para aba 1: Gerar Backup
    const [tipoBackup, setTipoBackup] = useState('completo');
    const [modulosSelecionados, setModulosSelecionados] = useState(['usuarios', 'marcacoes', 'justificativas', 'calculos']);
    const [formatoBackup, setFormatoBackup] = useState('json');

    // Estado para aba 2: Configuração Automática
    const [configForm, setConfigForm] = useState({
        frequencia: 'diario',
        horario_execucao: '02:00',
        destino: 'local',
        retencao_dias: 30,
        notificar_email: false,
        email_destino: user?.email || '',
        ativo: false
    });

    // Estado para aba 3: Histórico
    const [filtrosHistorico, setFiltrosHistorico] = useState({
        tipo: 'todos',
        status: 'todos',
        dataInicio: '',
        dataFim: ''
    });

    // Estado para aba 4: Restaurar
    const [backupSelecionado, setBackupSelecionado] = useState(null);
    const [senhaConfirmacao, setSenhaConfirmacao] = useState('');

    const modulosDisponiveis = [
        { id: 'usuarios', label: 'Usuários' },
        { id: 'marcacoes', label: 'Registros de Ponto' },
        { id: 'justificativas', label: 'Justificativas' },
        { id: 'calculos', label: 'Cálculos de Horas' },
        { id: 'limites_extras', label: 'Limites de Horas Extras' },
        { id: 'notificacoes', label: 'Notificações' },
        { id: 'logs_usuario', label: 'Logs de Usuários' },
        { id: 'logs_email', label: 'Logs de E-mail' },
        { id: 'logs_auditoria', label: 'Logs de Auditoria' },
        { id: 'configuracoes', label: 'Configurações' }
    ];

    useEffect(() => {
        if (isOpen) {
            carregarBackups();
            // Habilitar interação com pequeno atraso para evitar click-through
            setInteracaoHabilitada(false);
            const t = setTimeout(() => setInteracaoHabilitada(true), 400);
            if (configuracao) {
                setConfigForm({
                    frequencia: configuracao.frequencia || 'diario',
                    horario_execucao: configuracao.horario_execucao || '02:00',
                    destino: configuracao.destino || 'local',
                    retencao_dias: configuracao.retencao_dias || 30,
                    notificar_email: configuracao.notificar_email || false,
                    email_destino: configuracao.email_destino || user?.email || '',
                    ativo: configuracao.ativo || false
                });
            }
            return () => clearTimeout(t);
        }
    }, [isOpen, configuracao, carregarBackups, user]);

    // Handlers

    const handleCloseModal = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        // Bloquear ações por um curto período para evitar click-through
        setFechando(true);
        setShowProgress(false);
        onClose && onClose();
        setTimeout(() => setFechando(false), 500);
    };

    const handleGerarBackup = async () => {
        if (fechando) return; // se está fechando, ignorar
        if (tipoBackup === 'parcial' && modulosSelecionados.length === 0) {
            toast.error('Selecione pelo menos um módulo');
            return;
        }

        if (!window.confirm('Deseja gerar o backup agora? Esta operação pode levar alguns minutos.')) {
            return;
        }

        setShowProgress(true);
        setProgress(0);
        setProgressMessage('Iniciando backup...');
        setProgressSucesso(false);
        setProgressErro(null);

        try {
            const config = {
                modulos: tipoBackup === 'completo' ? ['todos'] : modulosSelecionados,
                formato: formatoBackup,
                destino: 'local',
                retencao_dias: 30
            };

            const resultado = await gerarBackup(config, (progresso, mensagem) => {
                setProgress(progresso);
                setProgressMessage(mensagem);
            });

            if (resultado.success) {
                setProgressSucesso(true);
                setProgressMessage(`Backup gerado com sucesso! Tamanho: ${resultado.tamanhoMB} MB`);

                // Enviar notificação
                const notificacoesService = (await import('../../services/notificacoesService')).default;
                await notificacoesService.enviarNotificacaoComEmail({
                    usuario_destinatario_id: user.id,
                    tipo: 'sistema',
                    categoria: 'sistema',
                    titulo: 'Backup Manual Concluído',
                    mensagem: `Backup criado com sucesso. Tamanho: ${resultado.tamanhoMB} MB`,
                    enviar_email: true,
                    email_destinatario: user.email
                });

                toast.success('Backup gerado com sucesso!');
                await carregarBackups();

                setTimeout(() => {
                    setShowProgress(false);
                }, 2000);
            } else {
                throw new Error(resultado.error || 'Erro ao gerar backup');
            }
        } catch (error) {
            setProgressErro(error.message);
            toast.error(`Erro ao gerar backup: ${error.message}`);
            setTimeout(() => {
                setShowProgress(false);
            }, 3000);
        }
    };

    const handleSalvarConfiguracao = async () => {
        try {
            const resultado = await salvarConfiguracao({
                ...configForm,
                id: configuracao?.id
            });

            if (resultado.success) {
                toast.success('Configuração salva com sucesso!');
            } else {
                throw new Error(resultado.error || 'Erro ao salvar configuração');
            }
        } catch (error) {
            toast.error(`Erro ao salvar configuração: ${error.message}`);
        }
    };

    const handleRestaurarBackup = async () => {
        if (!backupSelecionado) {
            toast.error('Selecione um backup para restaurar');
            return;
        }

        if (!senhaConfirmacao || senhaConfirmacao.length < 4) {
            toast.error('Digite a senha de confirmação (mínimo 4 caracteres)');
            return;
        }

        if (!window.confirm('ATENÇÃO: Esta ação irá substituir todos os dados atuais do sistema. Deseja continuar?')) {
            return;
        }

        setShowProgress(true);
        setProgress(0);
        setProgressMessage('Iniciando restauração...');
        setProgressSucesso(false);
        setProgressErro(null);

        try {
            const resultado = await restaurarBackup(backupSelecionado.id, senhaConfirmacao, (progresso, mensagem) => {
                setProgress(progresso);
                setProgressMessage(mensagem);
            });

            if (resultado.success) {
                setProgressSucesso(true);
                setProgressMessage(`Restauração concluída! ${resultado.modulosRestaurados.length} módulos restaurados.`);

                toast.success('Backup restaurado com sucesso!');
                await carregarBackups();

                setTimeout(() => {
                    setShowProgress(false);
                    onClose();
                }, 2000);
            } else {
                throw new Error(resultado.error || 'Erro ao restaurar backup');
            }
        } catch (error) {
            setProgressErro(error.message);
            toast.error(`Erro ao restaurar backup: ${error.message}`);
            setTimeout(() => {
                setShowProgress(false);
            }, 3000);
        }
    };

    const handleDeletarBackup = async (backupId) => {
        if (!window.confirm('Deseja realmente excluir este backup?')) {
            return;
        }

        try {
            const resultado = await deletarBackup(backupId);
            if (resultado.success) {
                toast.success('Backup excluído com sucesso!');
                await carregarBackups();
            } else {
                throw new Error(resultado.error || 'Erro ao excluir backup');
            }
        } catch (error) {
            toast.error(`Erro ao excluir backup: ${error.message}`);
        }
    };

    const handleBaixarBackup = async (backupId) => {
        try {
            const resultado = await baixarBackup(backupId);
            if (resultado.success) {
                toast.success('Download iniciado!');
            } else {
                throw new Error(resultado.error || 'Erro ao baixar backup');
            }
        } catch (error) {
            toast.error(`Erro ao baixar backup: ${error.message}`);
        }
    };

    const toggleModulo = (moduloId) => {
        if (modulosSelecionados.includes(moduloId)) {
            setModulosSelecionados(modulosSelecionados.filter(m => m !== moduloId));
        } else {
            setModulosSelecionados([...modulosSelecionados, moduloId]);
        }
    };

    // Filtrar backups
    const backupsFiltrados = backups.filter(backup => {
        if (filtrosHistorico.tipo !== 'todos' && backup.tipo !== filtrosHistorico.tipo) return false;
        if (filtrosHistorico.status !== 'todos' && backup.status !== filtrosHistorico.status) return false;
        if (filtrosHistorico.dataInicio) {
            const dataInicio = new Date(filtrosHistorico.dataInicio);
            dataInicio.setHours(0, 0, 0, 0);
            if (new Date(backup.data_execucao) < dataInicio) return false;
        }
        if (filtrosHistorico.dataFim) {
            const dataFim = new Date(filtrosHistorico.dataFim);
            dataFim.setHours(23, 59, 59, 999);
            if (new Date(backup.data_execucao) > dataFim) return false;
        }
        return true;
    });

    const abas = [
        { id: 'gerar', label: 'Gerar Backup', icon: Database },
        { id: 'configuracao', label: 'Configuração', icon: Settings },
        { id: 'historico', label: 'Histórico', icon: FileText },
        { id: 'restaurar', label: 'Restaurar', icon: RefreshCw }
    ];

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Configuração de Backups
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Gerencie backups e restaurações do sistema
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                        {abas.map(aba => {
                            const IconComponent = aba.icon;
                            return (
                                <button
                                    key={aba.id}
                                    onClick={() => setAbaAtiva(aba.id)}
                                    className={`flex items-center space-x-2 px-6 py-4 font-medium border-b-2 transition-colors ${abaAtiva === aba.id
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <IconComponent className="w-5 h-5" />
                                    <span>{aba.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div
                        className="flex-1 overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()} // impedir propagação dentro do modal
                    >
                        <AnimatePresence mode="wait">
                            {/* Aba 1: Gerar Backup */}
                            {abaAtiva === 'gerar' && (
                                <motion.div
                                    key="gerar"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Tipo de Backup */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Tipo de Backup
                                            </h3>
                                            <div className="space-y-3">
                                                <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <input
                                                        type="radio"
                                                        value="completo"
                                                        checked={tipoBackup === 'completo'}
                                                        onChange={(e) => setTipoBackup(e.target.value)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 dark:text-white">Completo</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">Todos os dados do sistema</div>
                                                    </div>
                                                </label>
                                                <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <input
                                                        type="radio"
                                                        value="parcial"
                                                        checked={tipoBackup === 'parcial'}
                                                        onChange={(e) => setTipoBackup(e.target.value)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 dark:text-white">Parcial</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">Selecionar módulos específicos</div>
                                                    </div>
                                                </label>
                                            </div>

                                            {/* Seleção de Módulos */}
                                            {tipoBackup === 'parcial' && (
                                                <div className="mt-4 space-y-2">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Módulos:</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {modulosDisponiveis.map(modulo => (
                                                            <label
                                                                key={modulo.id}
                                                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={modulosSelecionados.includes(modulo.id)}
                                                                    onChange={() => toggleModulo(modulo.id)}
                                                                    className="w-4 h-4 text-blue-600 rounded"
                                                                />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">{modulo.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Formato */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Formato de Exportação
                                            </h3>
                                            <div className="space-y-3">
                                                {['json', 'zip', 'sql'].map(formato => (
                                                    <label
                                                        key={formato}
                                                        className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                    >
                                                        <input
                                                            type="radio"
                                                            value={formato}
                                                            checked={formatoBackup === formato}
                                                            onChange={(e) => setFormatoBackup(e.target.value)}
                                                            className="w-4 h-4 text-blue-600"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900 dark:text-white uppercase">{formato}</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {formato === 'json' && 'Dados estruturados'}
                                                                {formato === 'zip' && 'Arquivo compactado'}
                                                                {formato === 'sql' && 'Dump do banco'}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGerarBackup}
                                        disabled={loading || !interacaoHabilitada}
                                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Database className="w-5 h-5" />
                                        <span>Gerar Backup Agora</span>
                                    </button>
                                </motion.div>
                            )}

                            {/* Aba 2: Configuração Automática */}
                            {abaAtiva === 'configuracao' && (
                                <motion.div
                                    key="configuracao"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Frequência
                                            </label>
                                            <select
                                                value={configForm.frequencia}
                                                onChange={(e) => setConfigForm({ ...configForm, frequencia: e.target.value })}
                                                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="diario">Diariamente</option>
                                                <option value="semanal">Semanalmente</option>
                                                <option value="mensal">Mensalmente</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Horário de Execução
                                            </label>
                                            <input
                                                type="time"
                                                value={configForm.horario_execucao}
                                                onChange={(e) => setConfigForm({ ...configForm, horario_execucao: e.target.value })}
                                                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Local de Armazenamento
                                            </label>
                                            <select
                                                value={configForm.destino}
                                                onChange={(e) => setConfigForm({ ...configForm, destino: e.target.value })}
                                                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="local">Servidor Local</option>
                                                <option value="aws_s3">AWS S3</option>
                                                <option value="google_drive">Google Drive</option>
                                                <option value="ftp">FTP</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Retenção (dias)
                                            </label>
                                            <input
                                                type="number"
                                                value={configForm.retencao_dias}
                                                onChange={(e) => setConfigForm({ ...configForm, retencao_dias: parseInt(e.target.value) })}
                                                min="1"
                                                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={configForm.notificar_email}
                                                    onChange={(e) => setConfigForm({ ...configForm, notificar_email: e.target.checked })}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 dark:text-white">Notificar por E-mail</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Enviar notificação ao concluir backup</div>
                                                </div>
                                            </label>
                                        </div>

                                        {configForm.notificar_email && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    E-mail de Destino
                                                </label>
                                                <input
                                                    type="email"
                                                    value={configForm.email_destino}
                                                    onChange={(e) => setConfigForm({ ...configForm, email_destino: e.target.value })}
                                                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        )}

                                        <div className="md:col-span-2">
                                            <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={configForm.ativo}
                                                    onChange={(e) => setConfigForm({ ...configForm, ativo: e.target.checked })}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 dark:text-white">Ativar Backup Automático</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Sistema irá executar backups automaticamente conforme configuração</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSalvarConfiguracao}
                                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        <span>Salvar Configuração</span>
                                    </button>

                                    {configuracao && configuracao.ativo && (
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                <div>
                                                    <div className="font-medium text-green-900 dark:text-green-300">Backup Automático Ativo</div>
                                                    <div className="text-sm text-green-700 dark:text-green-400">
                                                        Próxima execução: {configuracao.frequencia} às {configuracao.horario_execucao}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Aba 3: Histórico */}
                            {abaAtiva === 'historico' && (
                                <motion.div
                                    key="historico"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Filtros */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <select
                                            value={filtrosHistorico.tipo}
                                            onChange={(e) => setFiltrosHistorico({ ...filtrosHistorico, tipo: e.target.value })}
                                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                        >
                                            <option value="todos">Todos os Tipos</option>
                                            <option value="manual">Manual</option>
                                            <option value="automatico">Automático</option>
                                        </select>

                                        <select
                                            value={filtrosHistorico.status}
                                            onChange={(e) => setFiltrosHistorico({ ...filtrosHistorico, status: e.target.value })}
                                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                        >
                                            <option value="todos">Todos os Status</option>
                                            <option value="concluido">Concluído</option>
                                            <option value="falhou">Falhou</option>
                                            <option value="em_andamento">Em Andamento</option>
                                        </select>

                                        <input
                                            type="date"
                                            value={filtrosHistorico.dataInicio}
                                            onChange={(e) => setFiltrosHistorico({ ...filtrosHistorico, dataInicio: e.target.value })}
                                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                            placeholder="Data Início"
                                        />

                                        <input
                                            type="date"
                                            value={filtrosHistorico.dataFim}
                                            onChange={(e) => setFiltrosHistorico({ ...filtrosHistorico, dataFim: e.target.value })}
                                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                            placeholder="Data Fim"
                                        />
                                    </div>

                                    {/* Tabela */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Data</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Tipo</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Usuário</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Tamanho</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Formato</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {backupsFiltrados.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                            Nenhum backup encontrado
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    backupsFiltrados.map(backup => (
                                                        <tr
                                                            key={backup.id}
                                                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                        >
                                                            <td className="py-3 px-4">
                                                                {new Date(backup.data_execucao).toLocaleString('pt-BR')}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${backup.tipo === 'manual'
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                                                    }`}>
                                                                    {backup.tipo === 'manual' ? 'Manual' : 'Automático'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">{backup.usuario_nome}</td>
                                                            <td className="py-3 px-4">{backup.tamanho_mb} MB</td>
                                                            <td className="py-3 px-4 uppercase">{backup.formato}</td>
                                                            <td className="py-3 px-4">
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${backup.status === 'concluido'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                                    : backup.status === 'falhou'
                                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                                    }`}>
                                                                    {backup.status === 'concluido' ? '✅ Concluído' :
                                                                        backup.status === 'falhou' ? '❌ Falhou' :
                                                                            '⏳ Em Andamento'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center space-x-2">
                                                                    {backup.status === 'concluido' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleBaixarBackup(backup.id)}
                                                                                className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                                                                title="Baixar"
                                                                            >
                                                                                <Download className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setBackupSelecionado(backup);
                                                                                    setAbaAtiva('restaurar');
                                                                                }}
                                                                                className="p-1 text-green-600 hover:text-green-700 dark:text-green-400"
                                                                                title="Restaurar"
                                                                            >
                                                                                <RefreshCw className="w-4 h-4" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleDeletarBackup(backup.id)}
                                                                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400"
                                                                        title="Excluir"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {/* Aba 4: Restaurar */}
                            {abaAtiva === 'restaurar' && (
                                <motion.div
                                    key="restaurar"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-yellow-900 dark:text-yellow-300">Atenção!</div>
                                                <div className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                                    Esta ação irá substituir todos os dados atuais do sistema pelos dados do backup selecionado.
                                                    Um backup de segurança será criado automaticamente antes da restauração.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Selecionar Backup
                                        </label>
                                        <select
                                            value={backupSelecionado?.id || ''}
                                            onChange={(e) => {
                                                const backup = backups.find(b => b.id === e.target.value);
                                                setBackupSelecionado(backup);
                                            }}
                                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Selecione um backup...</option>
                                            {backups.filter(b => b.status === 'concluido').map(backup => (
                                                <option key={backup.id} value={backup.id}>
                                                    {new Date(backup.data_execucao).toLocaleString('pt-BR')} - {backup.tipo === 'manual' ? 'Manual' : 'Automático'} - {backup.tamanho_mb} MB
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {backupSelecionado && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                                            <div className="font-medium text-gray-900 dark:text-white">Detalhes do Backup:</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                <div>Data: {new Date(backupSelecionado.data_execucao).toLocaleString('pt-BR')}</div>
                                                <div>Tamanho: {backupSelecionado.tamanho_mb} MB</div>
                                                <div>Formato: {backupSelecionado.formato.toUpperCase()}</div>
                                                <div>Módulos: {backupSelecionado.modulos_incluidos.join(', ')}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Senha de Confirmação
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={senhaConfirmacao}
                                                onChange={(e) => setSenhaConfirmacao(e.target.value)}
                                                placeholder="Digite sua senha de administrador"
                                                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            />
                                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            É necessário confirmar com sua senha de administrador para restaurar o backup.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleRestaurarBackup}
                                        disabled={!backupSelecionado || !senhaConfirmacao}
                                        className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        <span>Restaurar Backup</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Progress Modal */}
            <ProgressModal
                isOpen={showProgress}
                progress={progress}
                mensagem={progressMessage}
                sucesso={progressSucesso}
                erro={progressErro}
            />
        </>
    );
};

export default BackupSettingsModal;

