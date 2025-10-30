import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Clock, BarChart3, Settings, LogOut, Bell, Sun, Moon, Menu, X, Shield, Search, Filter, Download, Upload, Plus, Edit, Trash2, Eye, MoreVertical, Home, FileText, Activity, UserCheck, AlertTriangle, CheckCircle, XCircle, TrendingUp, Loader2, Mail, Timer, FileSpreadsheet, Database
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import UsersManagementModal from '../modals/UsersManagementModal';
import NewUserModalWrapper from '../modals/NewUserModalWrapper';
import EditUserModal from '../modals/EditUserModal';
import UserDetailsModal from '../modals/UserDetailsModal';
import DeleteUserModal from '../modals/DeleteUserModal';
import ReportsModal from '../modals/ReportsModal';
import ExportDataModal from '../modals/ExportDataModal';
import TimeManagement from '../sections/TimeManagement';
import Reports from '../sections/Reports';
import AuditLogs from '../sections/AuditLogs';
import EmployeesPage from '../../pages/Employees';
import GestaoPonto from '../../pages/GestaoPonto';
import DashboardHeader from '../ui/DashboardHeader';
import DashboardCard from '../ui/DashboardCard';
import RecentActivity from '../ui/RecentActivity';
import UserList from '../ui/UserList';
import NotificationsPanel from '../ui/NotificationsPanel';
import CentralNotificacoes from '../ui/CentralNotificacoes';
import CardAusentesHoje from '../ui/CardAusentesHoje';
import GraficoAusenciasSemanal from '../ui/GraficoAusenciasSemanal';
import ReportHistory from '../pages/ReportHistory';
import PontoTempoReal from '../pages/PontoTempoReal';
import UserLogs from '../../pages/UserLogs';
import Justificativas from '../../pages/Justificativas';
import HorasCards from '../ui/HorasCards';
import GraficoHorasTrabalhadas from '../ui/GraficoHorasTrabalhadas';
import GraficoBancoHoras from '../ui/GraficoBancoHoras';
import GraficoDistribuicaoHoras from '../ui/GraficoDistribuicaoHoras';
import EmailConfigModal from '../modals/EmailConfigModal';
import UserProfileModal from '../modals/UserProfileModal';
import GeneralSettingsModal from '../modals/GeneralSettingsModal';
import HelpCenterModal from '../modals/HelpCenterModal';
import SecuritySettingsModal from '../modals/SecuritySettingsModal';
import LimitesExtrasModal from '../modals/LimitesExtrasModal';
import RelatoriosAuditoriasModal from '../modals/RelatoriosAuditoriasModal';
import BackupSettingsModal from '../modals/BackupSettingsModal';
import SettingsMenu from '../ui/SettingsMenu';
import SessionWarningModal from '../modals/SessionWarningModal';
import Footer from '../Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardData, useUsers, useNotifications } from '../../hooks/useRealData';
import { useAutoLogout } from '../../hooks/useAutoLogout';
import { initializeSampleHistory } from '../../data/sampleReportHistory';
import { initializeSampleAbsencesWithDepartments } from '../../data/sampleAbsencesWithDepartments';
import correcaoMarcacoesService from '../../services/correcaoMarcacoesService';

const AdminDashboard = () => {
    const { user, logout, toggleTheme, theme } = useAuth();

    // Hook para logout automático por inatividade
    const {
        showWarning,
        timeRemaining,
        isExtending,
        handleExtendSession,
        handleManualLogout,
        handleCloseWarning
    } = useAutoLogout();

    // Hooks para dados reais
    const {
        stats,
        activities,
        recentUsers,
        chartData,
        loading: dashboardLoading,
        errors: dashboardErrors,
        refreshAllData
    } = useDashboardData();

    const {
        users,
        loading: usersLoading,
        actions: usersActions
    } = useUsers();

    const {
        notifications,
        loading: notificationsLoading,
        actions: notificationsActions
    } = useNotifications();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showNewUserModal, setShowNewUserModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUsersManagement, setShowUsersManagement] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showReportHistory, setShowReportHistory] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [showEmailConfig, setShowEmailConfig] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [showGeneralSettings, setShowGeneralSettings] = useState(false);
    const [showHelpCenter, setShowHelpCenter] = useState(false);
    const [showSecuritySettings, setShowSecuritySettings] = useState(false);
    const [showLimitesExtras, setShowLimitesExtras] = useState(false);
    const [showRelatoriosAuditorias, setShowRelatoriosAuditorias] = useState(false);
    const [showBackupSettings, setShowBackupSettings] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Inicializar dados de exemplo e filtrar usuários
    useEffect(() => {
        // Inicializar dados de exemplo do histórico
        initializeSampleHistory();
        // Inicializar dados de exemplo de ausências com departamentos
        initializeSampleAbsencesWithDepartments();

        // Inicializar marcações e dados de teste para gráficos
        correcaoMarcacoesService.initializeSampleData();

        // Verificar e adicionar dados de teste se necessário
        const checkAndAddTestData = async () => {
            try {
                const marcacoes = await correcaoMarcacoesService.getMarcacoes();
                const calculos = JSON.parse(localStorage.getItem('horas_calculadas') || '[]');

                console.log(`🔍 Verificando dados: ${marcacoes.length} marcações, ${calculos.length} cálculos`);

                // Se não há marcações OU não há cálculos, adicionar dados de teste
                if (marcacoes.length === 0 || calculos.length === 0) {
                    console.log('🔄 Inserindo dados de teste para gráficos...');
                    const resultado = await correcaoMarcacoesService.adicionarDadosTeste();

                    if (resultado.success) {
                        console.log(`✅ Dados de teste inseridos: ${resultado.adicionados} novos, ${resultado.total} total`);

                        // Aguardar um pouco e verificar se cálculos foram criados
                        setTimeout(async () => {
                            const calculosApos = JSON.parse(localStorage.getItem('horas_calculadas') || '[]');
                            console.log(`📊 Cálculos após inserção: ${calculosApos.length}`);

                            if (calculosApos.length === 0) {
                                console.warn('⚠️ Nenhum cálculo foi gerado. Forçando recálculo...');
                                await correcaoMarcacoesService.forcarRecalculoHoras();
                            }
                        }, 1500);
                    }
                } else {
                    console.log('ℹ️ Dados já existem. Verificando se cálculos estão completos...');
                    // Verificar se há marcações sem cálculos
                    const marcacoesValidas = marcacoes.filter(m =>
                        m.entrada && m.saida &&
                        typeof m.entrada === 'string' &&
                        typeof m.saida === 'string' &&
                        m.entrada.trim() !== '' &&
                        m.saida.trim() !== ''
                    );

                    if (marcacoesValidas.length > calculos.length) {
                        console.log(`🔄 Há ${marcacoesValidas.length - calculos.length} marcações sem cálculo. Forçando recálculo...`);
                        await correcaoMarcacoesService.forcarRecalculoHoras();
                    }
                }
            } catch (err) {
                console.error('Erro ao verificar dados de teste:', err);
            }
        };

        // Aguardar um pouco para garantir que tudo carregou
        setTimeout(checkAndAddTestData, 2000);

        if (users && users.length > 0) {
            if (searchTerm.trim() === '') {
                setFilteredUsers(users);
            } else {
                const filtered = users.filter(user =>
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredUsers(filtered);
            }
        } else {
            setFilteredUsers([]);
        }
    }, [searchTerm, users]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'users', label: 'Usuários', icon: Users },
        { id: 'employees', label: 'Colaboradores', icon: UserCheck },
        { id: 'time', label: 'Gestão de Ponto', icon: Clock },
        { id: 'gestao-ponto', label: 'Correção de Marcações', icon: Clock },
        { id: 'justificativas', label: 'Justificativas', icon: FileText },
        { id: 'ponto-tempo-real', label: 'Ponto em Tempo Real', icon: Activity },
        { id: 'reports', label: 'Relatórios', icon: BarChart3 },
        { id: 'audit', label: 'Auditoria', icon: Shield },
        { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSidebarOpen(false); // Fechar sidebar no mobile
    };

    const handleCreateUser = () => {
        setShowNewUserModal(true);
    };

    const handleManageUsers = () => {
        setShowUsersManagement(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleUserCreated = async (newUser) => {
        try {
            const result = await usersActions.createUser(newUser);
            if (result.success) {
                // A lista será atualizada automaticamente pelo React Query
                toast.success('Usuário criado com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Você foi desconectado com sucesso!');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    };

    const handleMarkNotificationAsRead = (id) => {
        notificationsActions.markAsRead(id);
    };

    const handleMarkAllNotificationsAsRead = () => {
        notificationsActions.markAllAsRead();
    };

    const handleImport = () => {
        toast.success('Importação iniciada!');
    };

    const handleCreateNew = () => {
        if (activeTab === 'users') {
            handleCreateUser();
        } else {
            toast('Funcionalidade em desenvolvimento', {
                icon: 'ℹ️',
                style: {
                    background: '#3B82F6',
                    color: '#fff',
                },
            });
        }
    };

    const handleExport = () => {
        setShowExportModal(true);
    };

    const handleGenerateReport = () => {
        setShowReportsModal(true);
    };

    const toggleDarkMode = () => {
        toggleTheme();
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Função para limpar notificações persistentes
    const clearPersistentNotifications = () => {
        try {
            // Limpar localStorage de notificações
            const keysToClear = [
                'emailLogs',
                'passwordHistory',
                'passwordResetAudit',
                'notifications',
                'toast-notifications',
                'react-hot-toast',
                'persistent-notifications',
                'passwordResetError',
                'passwordResetSuccess',
                'alertMessage'
            ];

            keysToClear.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                }
            });

            // Limpar sessionStorage também
            keysToClear.forEach(key => {
                if (sessionStorage.getItem(key)) {
                    sessionStorage.removeItem(key);
                }
            });

            // Limpar todas as notificações toast ativas
            toast.dismiss();

            // Forçar limpeza de elementos DOM de notificações
            const notificationElements = document.querySelectorAll('[class*="toast"], [class*="notification"], [class*="alert"]');
            notificationElements.forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });

            // Limpar elementos específicos de erro de senha
            const passwordErrorElements = document.querySelectorAll('[class*="PasswordErrorAlert"], [class*="password-error"]');
            passwordErrorElements.forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });

            // Adicionar notificação de sucesso ao painel do sino
            const successNotification = {
                id: Date.now(),
                type: 'success',
                title: 'Notificações Limpas',
                message: 'Todas as notificações persistentes foram removidas com sucesso!',
                time: 'Agora',
                read: false
            };

            // Adicionar à lista de notificações
            notificationsActions.addNotification(successNotification);

            console.log('✅ Notificações persistentes limpas');
        } catch (error) {
            console.error('❌ Erro ao limpar notificações:', error);

            // Adicionar notificação de erro ao painel do sino
            const errorNotification = {
                id: Date.now(),
                type: 'error',
                title: 'Erro ao Limpar',
                message: 'Ocorreu um erro ao limpar as notificações persistentes.',
                time: 'Agora',
                read: false
            };

            notificationsActions.addNotification(errorNotification);
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 0, // Desabilitar auto-dismiss
                    style: {
                        display: 'none' // Ocultar notificações toast globais
                    }
                }}
            />

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            {/* Overlay para mobile */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSidebarOpen(false)}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                            />

                            {/* Sidebar */}
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl lg:shadow-none"
                            >
                                <div className="flex flex-col h-full">
                                    {/* Logo */}
                                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                                <Shield className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    Sistema Ponto
                                                </h1>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Painel Administrativo
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSidebarOpen(false)}
                                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </div>

                                    {/* Navigation */}
                                    <nav className="flex-1 p-4 overflow-y-auto">
                                        <div className="space-y-1">
                                            {/* Debug: Mostrar todos os itens do menu */}
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                                Debug: {menuItems.length} itens do menu: {menuItems.map(item => item.label).join(', ')}
                                            </div>

                                            {/* Menu Items - Versão Ultra Simplificada */}
                                            <div className="space-y-1">
                                                <button
                                                    onClick={() => handleTabChange('dashboard')}
                                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'dashboard'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <Home className="w-4 h-4" />
                                                    <span>Dashboard</span>
                                                </button>

                                                <button
                                                    onClick={() => handleTabChange('users')}
                                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'users'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <Users className="w-4 h-4" />
                                                    <span>Usuários</span>
                                                </button>

                                                <button
                                                    onClick={() => handleTabChange('employees')}
                                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'employees'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                    <span>Colaboradores</span>
                                                </button>

                                                <button
                                                    onClick={() => handleTabChange('time')}
                                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'time'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <Clock className="w-4 h-4" />
                                                    <span>Gestão de Ponto</span>
                                                </button>

                                                <button
                                                    onClick={() => handleTabChange('gestao-ponto')}
                                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'gestao-ponto'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <Clock className="w-4 h-4" />
                                                    <span>Correção de Marcações</span>
                                                </button>

                                                <button
                                                    onClick={() => handleTabChange('reports')}
                                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'reports'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <BarChart3 className="w-4 h-4" />
                                                    <span>Relatórios</span>
                                                </button>

                                                <button
                                                    onClick={() => handleTabChange('audit')}
                                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'audit'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    <span>Auditoria</span>
                                                </button>

                                                <button
                                                    onClick={() => handleTabChange('settings')}
                                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'settings'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    <span>Configurações</span>
                                                </button>

                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>Sair</span>
                                                </button>
                                            </div>
                                        </div>
                                    </nav>

                                    {/* User Info */}
                                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                                                <UserCheck className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {user?.name || 'Admin'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {user?.email || 'admin@sistema.com'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    {/* Header */}
                    <DashboardHeader
                        title={menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                        subtitle={user?.name || 'Usuário'}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isDarkMode={theme === 'dark'}
                        onToggleDarkMode={toggleDarkMode}
                        onToggleNotifications={() => setShowNotifications(!showNotifications)}
                        sidebarOpen={sidebarOpen}
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        onExport={handleExport}
                        onImport={handleImport}
                        onCreateNew={handleCreateNew}
                        onToggleSettings={() => setShowSettingsMenu(!showSettingsMenu)}
                        showActions={activeTab === 'users'} // Mostrar ações apenas na aba de usuários
                    />

                    {/* Page Content */}
                    <main className="p-6 sm:p-8 flex-1">
                        <AnimatePresence mode="wait">
                            {activeTab === 'dashboard' && (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-8"
                                >
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                                        {dashboardLoading.stats ? (
                                            // Loading state para cards
                                            Array.from({ length: 4 }).map((_, index) => (
                                                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : stats && stats.length > 0 ? (
                                            stats.map((stat, index) => {
                                                const IconComponent = stat.icon === 'Users' ? Users :
                                                    stat.icon === 'Clock' ? Clock :
                                                        stat.icon === 'AlertTriangle' ? AlertTriangle :
                                                            stat.icon === 'TrendingUp' ? TrendingUp : Users;

                                                return (
                                                    <DashboardCard
                                                        key={stat.id}
                                                        title={stat.title}
                                                        value={stat.value}
                                                        change={stat.change}
                                                        changeType={stat.changeType}
                                                        icon={IconComponent}
                                                        color={stat.color}
                                                        delay={index * 0.1}
                                                    />
                                                );
                                            })
                                        ) : (
                                            // Empty state
                                            <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <BarChart3 className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                    Nenhuma estatística disponível
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Os dados serão carregados quando houver informações no sistema.
                                                </p>
                                            </div>
                                        )}

                                        {/* Card de Ausentes Hoje */}
                                        <CardAusentesHoje />
                                    </div>

                                    {/* Cards de Horas */}
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                                Cálculo de Horas
                                            </h2>
                                            <HorasCards periodo="mes" delay={0.4} />
                                        </div>
                                    </div>

                                    {/* Gráficos de Horas */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <GraficoHorasTrabalhadas periodo="semana" />
                                        <GraficoBancoHoras periodo="mes" />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <GraficoDistribuicaoHoras periodo="mes" />
                                    </div>

                                    {/* Charts and Activities */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Recent Activity */}
                                        <RecentActivity
                                            activities={activities}
                                            loading={dashboardLoading.activities}
                                            delay={0.4}
                                        />

                                        {/* Recent Users */}
                                        <UserList
                                            users={recentUsers}
                                            loading={dashboardLoading.recentUsers}
                                            title="Usuários Recentes"
                                            delay={0.6}
                                            onEditUser={handleEditUser}
                                            onViewUser={handleViewUser}
                                            onDeleteUser={handleDeleteUser}
                                        />
                                    </div>

                                    {/* Quick Actions */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8"
                                    >
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                            Ações Rápidas
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                                            {[
                                                { icon: Plus, label: 'Novo Usuário', action: handleCreateUser, color: 'blue' },
                                                { icon: Users, label: 'Gerenciar Usuários', action: handleManageUsers, color: 'purple' },
                                                { icon: Clock, label: 'Gestão de Ponto', action: () => setActiveTab('gestao-ponto'), color: 'blue' },
                                                { icon: Timer, label: 'Limites de Horas Extras', action: () => setShowLimitesExtras(true), color: 'orange' },
                                                { icon: FileSpreadsheet, label: 'Relatórios e Auditorias', action: () => setShowRelatoriosAuditorias(true), color: 'indigo' },
                                                { icon: Database, label: 'Configuração de Backups', action: () => setShowBackupSettings(true), color: 'teal' },
                                                { icon: FileText, label: 'Justificativas', action: () => setActiveTab('justificativas'), color: 'yellow' },
                                                { icon: Download, label: 'Exportar Dados', action: handleExport, color: 'green' },
                                                { icon: BarChart3, label: 'Gerar Relatório', action: handleGenerateReport, color: 'purple' },
                                                { icon: FileText, label: 'Histórico de Relatórios', action: () => setShowReportHistory(true), color: 'orange' },
                                                { icon: Activity, label: 'Ponto em Tempo Real', action: () => setActiveTab('ponto-tempo-real'), color: 'green' },
                                                { icon: Mail, label: 'Logs de Usuários', action: () => setActiveTab('user-logs'), color: 'indigo' }
                                            ].map((action, index) => (
                                                <motion.button
                                                    key={action.label}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.8 + index * 0.1 }}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={action.action}
                                                    className={`p-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-${action.color}-300 dark:hover:border-${action.color}-600 transition-all duration-300 group`}
                                                >
                                                    <action.icon className={`w-8 h-8 mx-auto mb-3 text-${action.color}-600 dark:text-${action.color}-400 group-hover:scale-110 transition-transform duration-300`} />
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {action.label}
                                                    </p>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Gráfico de Ausências Semanal */}
                                    <GraficoAusenciasSemanal />
                                </motion.div>
                            )}

                            {activeTab === 'users' && (
                                <motion.div
                                    key="users"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {/* Users Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Gestão de Usuários
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                Gerencie usuários e permissões do sistema
                                            </p>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleCreateUser}
                                            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span>Novo Usuário</span>
                                        </motion.button>
                                    </div>

                                    {/* Users List */}
                                    <UserList
                                        users={filteredUsers}
                                        title="Todos os Usuários"
                                        onUserClick={handleEditUser}
                                        showActions={true}
                                    />
                                </motion.div>
                            )}

                            {activeTab === 'time' && (
                                <motion.div
                                    key="time"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <TimeManagement />
                                </motion.div>
                            )}

                            {activeTab === 'gestao-ponto' && (
                                <motion.div
                                    key="gestao-ponto"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <GestaoPonto onVoltar={() => handleTabChange('dashboard')} />
                                </motion.div>
                            )}

                            {activeTab === 'reports' && (
                                <motion.div
                                    key="reports"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Reports />
                                </motion.div>
                            )}

                            {activeTab === 'employees' && (
                                <motion.div
                                    key="employees"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <EmployeesPage />
                                </motion.div>
                            )}

                            {activeTab === 'audit' && (
                                <motion.div
                                    key="audit"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AuditLogs />
                                </motion.div>
                            )}

                            {activeTab === 'ponto-tempo-real' && (
                                <motion.div
                                    key="ponto-tempo-real"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <PontoTempoReal onVoltar={() => handleTabChange('dashboard')} />
                                </motion.div>
                            )}

                            {/* User Logs Tab */}
                            {activeTab === 'user-logs' && (
                                <motion.div
                                    key="user-logs"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <UserLogs onVoltar={() => handleTabChange('dashboard')} />
                                </motion.div>
                            )}

                            {activeTab === 'justificativas' && (
                                <motion.div
                                    key="justificativas"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Justificativas onVoltar={() => handleTabChange('dashboard')} />
                                </motion.div>
                            )}

                            {/* Placeholder for other tabs */}
                            {activeTab !== 'dashboard' && activeTab !== 'users' && activeTab !== 'employees' && activeTab !== 'time' && activeTab !== 'gestao-ponto' && activeTab !== 'justificativas' && activeTab !== 'ponto-tempo-real' && activeTab !== 'user-logs' && activeTab !== 'reports' && activeTab !== 'audit' && (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center justify-center h-64"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <BarChart3 className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            {menuItems.find(item => item.id === activeTab)?.label}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Esta seção será implementada em breve
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            {/* Modal de Novo Usuário */}
            <NewUserModalWrapper
                isModalOpen={showNewUserModal}
                handleClose={() => setShowNewUserModal(false)}
            />

            {/* Modal de Gerenciamento de Usuários */}
            <UsersManagementModal
                isOpen={showUsersManagement}
                onClose={() => setShowUsersManagement(false)}
            />

            {/* Central de Notificações Melhorada */}
            <CentralNotificacoes
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />

            {/* Painel de Notificações (mantido para compatibilidade) */}
            <NotificationsPanel
                isOpen={false}
                onClose={() => { }}
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                onClearAllNotifications={clearPersistentNotifications}
            />

            {/* Modal de Edição de Usuário */}
            <EditUserModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />

            {/* Modal de Detalhes do Usuário */}
            <UserDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onEdit={handleEditUser}
            />

            {/* Modal de Confirmação de Exclusão */}
            <DeleteUserModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onConfirm={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                    // Atualizar lista de usuários após exclusão
                    refreshAllData();
                }}
            />

            {/* Modal de Relatórios */}
            <ReportsModal
                isOpen={showReportsModal}
                onClose={() => setShowReportsModal(false)}
            />

            {/* Modal de Exportação */}
            <ExportDataModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
            />

            {/* Modal de Histórico de Relatórios */}
            <AnimatePresence>
                {showReportHistory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowReportHistory(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-orange-800/30 rounded-lg">
                                        <FileText className="h-6 w-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Histórico de Relatórios Enviados
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Visualize todos os relatórios enviados automaticamente
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowReportHistory(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                <ReportHistory />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Configuração de E-mail */}
            <EmailConfigModal
                isOpen={showEmailConfig}
                onClose={() => setShowEmailConfig(false)}
            />

            {/* Modal de Perfil do Usuário */}
            <UserProfileModal
                isOpen={showUserProfile}
                onClose={() => setShowUserProfile(false)}
            />

            {/* Modal de Configurações Gerais */}
            <GeneralSettingsModal
                isOpen={showGeneralSettings}
                onClose={() => setShowGeneralSettings(false)}
            />

            {/* Modal de Centro de Ajuda */}
            <HelpCenterModal
                isOpen={showHelpCenter}
                onClose={() => setShowHelpCenter(false)}
            />

            {/* Modal de Configurações de Segurança */}
            <SecuritySettingsModal
                isOpen={showSecuritySettings}
                onClose={() => setShowSecuritySettings(false)}
            />

            {/* Menu de Configurações */}
            <SettingsMenu
                isOpen={showSettingsMenu}
                onClose={() => setShowSettingsMenu(false)}
                onOpenEmailConfig={() => setShowEmailConfig(true)}
                onOpenUserProfile={() => setShowUserProfile(true)}
                onOpenGeneralSettings={() => setShowGeneralSettings(true)}
                onOpenHelpCenter={() => setShowHelpCenter(true)}
                onOpenSecuritySettings={() => setShowSecuritySettings(true)}
            />

            {/* Modal de Aviso de Sessão */}
            <SessionWarningModal
                isOpen={showWarning}
                onClose={handleCloseWarning}
                onExtendSession={handleExtendSession}
                onLogout={handleManualLogout}
                timeRemaining={timeRemaining}
                isExtending={isExtending}
            />

            {/* Modal de Configurações de E-mail */}
            <EmailConfigModal
                isOpen={showEmailConfig}
                onClose={() => setShowEmailConfig(false)}
            />

            {/* Modal de Limites de Horas Extras */}
            <LimitesExtrasModal
                isOpen={showLimitesExtras}
                onClose={() => setShowLimitesExtras(false)}
            />

            <RelatoriosAuditoriasModal
                isOpen={showRelatoriosAuditorias}
                onClose={() => setShowRelatoriosAuditorias(false)}
            />
            <BackupSettingsModal
                isOpen={showBackupSettings}
                onClose={() => setShowBackupSettings(false)}
            />

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default AdminDashboard;











