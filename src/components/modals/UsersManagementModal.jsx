import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, Filter, ChevronLeft, ChevronRight, Edit, Trash2, Eye,
    User, Mail, Briefcase, Shield, Clock, MoreVertical, CheckCircle,
    XCircle, AlertCircle, Loader2, Plus, CalendarDays, RotateCcw, UserX, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUsers } from '../../hooks/useRealData';
import { useAuth } from '../../contexts/AuthContext';
import UserDetailsModal from './UserDetailsModal';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import ManageAbsencesModal from './ManageAbsencesModal';
import ResetPasswordModal from './ResetPasswordModal';
import ResetPasswordSuccessModal from './ResetPasswordSuccessModal';
import ConfirmActionModal from './ConfirmActionModal';

const UsersManagementModal = ({ isOpen, onClose }) => {
    const { user: currentUser, hasPermission } = useAuth();
    const {
        users,
        loading: usersLoading,
        actions: usersActions
    } = useUsers();

    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProfile, setFilterProfile] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAbsencesModal, setShowAbsencesModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [showResetPasswordSuccessModal, setShowResetPasswordSuccessModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [resetCredentials, setResetCredentials] = useState(null);

    // Estados para abas e toggle de status
    const [activeTab, setActiveTab] = useState('ativos');
    const [showConfirmToggleModal, setShowConfirmToggleModal] = useState(false);
    const [pendingToggleUser, setPendingToggleUser] = useState(null);
    const [isToggling, setIsToggling] = useState(false);

    const usersPerPage = 10;

    // Filtrar e ordenar usuários
    useEffect(() => {
        let filtered = users || [];

        // Filtro por busca
        if (searchTerm.trim()) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.position?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por perfil
        if (filterProfile !== 'all') {
            filtered = filtered.filter(user => user.profile === filterProfile);
        }

        // Filtro por status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(user => user.status === filterStatus);
        }

        // Ordenação
        filtered.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (sortField === 'lastActivity') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [users, searchTerm, filterProfile, filterStatus, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
        // Fechar modal de detalhes se estiver aberto
        setShowDetailsModal(false);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const handleManageAbsences = (user) => {
        setSelectedUser(user);
        setShowAbsencesModal(true);
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteConfirm(true);
    };

    const handleResetPassword = (user) => {
        setSelectedUser(user);
        setShowResetPasswordModal(true);
    };

    const handleResetPasswordSuccess = (credentials) => {
        setResetCredentials(credentials);
        setShowResetPasswordSuccessModal(true);
    };

    // Função auxiliar para verificar se usuário está ativo
    const isUserActive = (status) => {
        return status === true || status === 'ativo' || status === 'Ativo' || status === 'active';
    };

    // Função para obter usuários ativos e inativos
    const getActiveUsers = () => {
        return filteredUsers.filter(u => isUserActive(u.status));
    };

    const getInactiveUsers = () => {
        return filteredUsers.filter(u => !isUserActive(u.status));
    };

    // Função para toggle de status
    const handleToggleStatus = (user) => {
        setPendingToggleUser(user);
        setShowConfirmToggleModal(true);
    };

    // Função para confirmar toggle
    const confirmToggleStatus = async () => {
        if (!pendingToggleUser) return;

        setIsToggling(true);
        try {
            const currentStatus = pendingToggleUser.status;
            const newStatus = !isUserActive(currentStatus);

            const result = await usersActions.toggleUserStatus({
                id: pendingToggleUser.id,
                status: newStatus
            });

            if (result.success) {
                // Usuário já foi atualizado no estado, apenas fecha modal
                setShowConfirmToggleModal(false);
                setPendingToggleUser(null);

                // Atualiza a aba ativa automaticamente
                if (newStatus) {
                    setActiveTab('ativos');
                } else {
                    setActiveTab('inativos');
                }
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            toast.error('Erro ao alterar status do usuário');
        } finally {
            setIsToggling(false);
        }
    };

    // Obter usuários baseado na aba ativa
    const getUsersForActiveTab = () => {
        if (activeTab === 'ativos') {
            return getActiveUsers();
        } else {
            return getInactiveUsers();
        }
    };

    // Obter contagem de usuários
    const activeUsersCount = getActiveUsers().length;
    const inactiveUsersCount = getInactiveUsers().length;

    // Verificar permissão de acesso
    if (!hasPermission('admin')) {
        return (
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        key="admin-access-denied-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-gray-800 dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white dark:text-white mb-2">
                                Acesso Negado
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Apenas administradores podem gerenciar usuários.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Fechar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }


    const handleUserUpdated = () => {
        setShowEditModal(false);
        setSelectedUser(null);
        // Os dados serão atualizados automaticamente pelo React Query
    };

    // Paginação
    // Usuários da aba ativa
    const usersForActiveTab = getUsersForActiveTab();
    const totalPages = Math.ceil(usersForActiveTab.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = usersForActiveTab.slice(startIndex, endIndex);

    const getProfileIcon = (profile) => {
        switch (profile) {
            case 'admin': return <Shield className="w-4 h-4 text-red-600" />;
            case 'rh': return <User className="w-4 h-4 text-blue-600" />;
            case 'gestor': return <Briefcase className="w-4 h-4 text-green-600" />;
            default: return <User className="w-4 h-4 text-gray-600" />;
        }
    };

    const getProfileLabel = (profile) => {
        switch (profile) {
            case 'admin': return 'Administrador';
            case 'rh': return 'Recursos Humanos';
            case 'gestor': return 'Gestor';
            case 'colaborador': return 'Colaborador';
            default: return profile;
        }
    };

    const getStatusIcon = (status) => {
        return status === 'Ativo' ?
            <CheckCircle className="w-4 h-4 text-green-600" /> :
            <XCircle className="w-4 h-4 text-red-600" />;
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    key="users-management-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm dark"
                    onKeyDown={(e) => e.key === 'Escape' && onClose()}
                    tabIndex={-1}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white dark:text-white">
                                        Gerenciar Usuários
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Visualize e gerencie todos os usuários do sistema
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Filtros e Busca */}
                            <div className="mb-6 space-y-4">
                                {/* Busca */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome, e-mail ou cargo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-700 dark:bg-gray-700 text-white dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Filtros */}
                                <div className="flex flex-wrap gap-4">
                                    <select
                                        value={filterProfile}
                                        onChange={(e) => setFilterProfile(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Todos os Perfis</option>
                                        <option value="admin">Administrador</option>
                                        <option value="rh">Recursos Humanos</option>
                                        <option value="gestor">Gestor</option>
                                        <option value="colaborador">Colaborador</option>
                                    </select>

                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Todos os Status</option>
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inativo">Inativo</option>
                                    </select>

                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilterProfile('all');
                                            setFilterStatus('all');
                                        }}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 dark:bg-gray-700 text-gray-300 dark:text-gray-300 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span>Limpar Filtros</span>
                                    </button>
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{users.length}</p>
                                        </div>
                                        <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Ativos</p>
                                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                {users.filter(u => u.status === 'Ativo').length}
                                            </p>
                                        </div>
                                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>

                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-red-600 dark:text-red-400">Inativos</p>
                                            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                                                {users.filter(u => u.status === 'Inativo').length}
                                            </p>
                                        </div>
                                        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>

                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Administradores</p>
                                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                                {users.filter(u => u.profile === 'admin').length}
                                            </p>
                                        </div>
                                        <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Tabela */}
                            <div className="bg-gray-800 dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {usersLoading.users ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                        <span className="ml-2 text-gray-400 dark:text-gray-400">Carregando usuários...</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Abas de Usuários */}
                                        <div className="bg-gray-700 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setActiveTab('ativos')}
                                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'ativos'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                                        }`}
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                    <span>Ativos</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'ativos' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-200'
                                                        }`}>
                                                        {activeUsersCount}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('inativos')}
                                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'inativos'
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                                        }`}
                                                >
                                                    <UserX className="w-4 h-4" />
                                                    <span>Inativos</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'inativos' ? 'bg-red-500 text-white' : 'bg-gray-500 text-gray-200'
                                                        }`}>
                                                        {inactiveUsersCount}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Header da Tabela */}
                                        <div className="bg-gray-700 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
                                            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300 dark:text-gray-300">
                                                <div className="col-span-3">
                                                    <button
                                                        onClick={() => handleSort('name')}
                                                        className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        <span>Nome</span>
                                                        {sortField === 'name' && (
                                                            <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="col-span-2">E-mail</div>
                                                <div className="col-span-2">Cargo</div>
                                                <div className="col-span-1">Perfil</div>
                                                <div className="col-span-1">Status</div>
                                                <div className="col-span-1">
                                                    <button
                                                        onClick={() => handleSort('lastActivity')}
                                                        className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        <span>Último Acesso</span>
                                                        {sortField === 'lastActivity' && (
                                                            <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="col-span-2">Ações</div>
                                            </div>
                                        </div>

                                        {/* Corpo da Tabela */}
                                        <div className="divide-y divide-gray-200 dark:divide-gray-600">
                                            {currentUsers.map((user) => (
                                                <motion.div
                                                    key={user.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="px-6 py-4 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <div className="grid grid-cols-12 gap-4 items-center">
                                                        {/* Nome */}
                                                        <div className="col-span-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <User className="w-4 h-4 text-white" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-medium text-white dark:text-white truncate">{user.name}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* E-mail */}
                                                        <div className="col-span-2">
                                                            <p className="text-sm text-gray-400 dark:text-gray-400 truncate" title={user.email}>
                                                                {user.email}
                                                            </p>
                                                        </div>

                                                        {/* Cargo */}
                                                        <div className="col-span-2">
                                                            <p className="text-sm text-gray-400 dark:text-gray-400 truncate" title={user.position || 'N/A'}>
                                                                {user.position || 'N/A'}
                                                            </p>
                                                        </div>

                                                        {/* Perfil */}
                                                        <div className="col-span-1">
                                                            <div className="flex items-center space-x-1">
                                                                {getProfileIcon(user.profile)}
                                                                <span className="text-sm text-gray-400 dark:text-gray-400 truncate">
                                                                    {getProfileLabel(user.profile)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Status */}
                                                        <div className="col-span-1">
                                                            <div className="flex items-center space-x-1">
                                                                {getStatusIcon(user.status)}
                                                                <span className="text-sm text-gray-400 dark:text-gray-400">{user.status}</span>
                                                            </div>
                                                        </div>

                                                        {/* Último Acesso */}
                                                        <div className="col-span-1">
                                                            <div className="flex items-center space-x-1 text-sm text-gray-400 dark:text-gray-400">
                                                                <Clock className="w-3 h-3 flex-shrink-0" />
                                                                <span className="truncate">{user.lastActivity || 'Nunca'}</span>
                                                            </div>
                                                        </div>

                                                        {/* Ações */}
                                                        <div className="col-span-2">
                                                            <div className="flex items-center space-x-1">
                                                                {/* Botão Ativar/Inativar */}
                                                                {isUserActive(user.status) ? (
                                                                    <button
                                                                        onClick={() => handleToggleStatus(user)}
                                                                        className="p-1 text-orange-600 hover:text-orange-800 dark:hover:text-orange-400 transition-colors"
                                                                        title="Inativar usuário"
                                                                    >
                                                                        <UserX className="w-4 h-4" />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleToggleStatus(user)}
                                                                        className="p-1 text-green-600 hover:text-green-800 dark:hover:text-green-400 transition-colors"
                                                                        title="Ativar usuário"
                                                                    >
                                                                        <UserCheck className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleViewUser(user)}
                                                                    className="p-1 text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors"
                                                                    title="Ver detalhes"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEditUser(user)}
                                                                    className="p-1 text-green-600 hover:text-green-800 dark:hover:text-green-400 transition-colors"
                                                                    title="Editar usuário"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleManageAbsences(user)}
                                                                    className="p-1 text-yellow-600 hover:text-yellow-800 dark:hover:text-yellow-400 transition-colors"
                                                                    title="Gerenciar feriados, folgas e afastamentos"
                                                                >
                                                                    <CalendarDays className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleResetPassword(user)}
                                                                    className="p-1 text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors"
                                                                    title="Resetar senha"
                                                                >
                                                                    <RotateCcw className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user)}
                                                                    className="p-1 text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors"
                                                                    title="Excluir usuário"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Paginação */}
                                        {totalPages > 1 && (
                                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-400 dark:text-gray-400">
                                                        Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuários
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                            disabled={currentPage === 1}
                                                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                        </button>
                                                        <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                                                            Página {currentPage} de {totalPages}
                                                        </span>
                                                        <button
                                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                            disabled={currentPage === totalPages}
                                                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            )}

            {/* Modais de Ação */}
            <UserDetailsModal
                key="user-details-modal"
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onEdit={handleEditUser}
            />

            <EditUserModal
                key="edit-user-modal"
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />

            <DeleteUserModal
                key="delete-user-modal"
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />

            <ManageAbsencesModal
                key="manage-absences-modal"
                isOpen={showAbsencesModal}
                onClose={() => {
                    setShowAbsencesModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />

            <ResetPasswordModal
                key="reset-password-modal"
                isOpen={showResetPasswordModal}
                onClose={() => {
                    setShowResetPasswordModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onSuccess={handleResetPasswordSuccess}
            />

            <ResetPasswordSuccessModal
                key="reset-password-success-modal"
                isOpen={showResetPasswordSuccessModal}
                onClose={() => {
                    setShowResetPasswordSuccessModal(false);
                    setResetCredentials(null);
                }}
                credentials={resetCredentials}
            />

            <ConfirmActionModal
                isOpen={showConfirmToggleModal}
                onClose={() => {
                    setShowConfirmToggleModal(false);
                    setPendingToggleUser(null);
                }}
                onConfirm={confirmToggleStatus}
                title={pendingToggleUser && isUserActive(pendingToggleUser.status) ? 'Inativar Usuário?' : 'Ativar Usuário?'}
                message={
                    pendingToggleUser && isUserActive(pendingToggleUser.status)
                        ? `Tem certeza que deseja inativar ${pendingToggleUser.name}? O usuário será desconectado automaticamente e não poderá mais acessar o sistema até ser reativado.`
                        : `Tem certeza que deseja ativar ${pendingToggleUser?.name}? O usuário poderá acessar o sistema normalmente.`
                }
                confirmText={pendingToggleUser && isUserActive(pendingToggleUser.status) ? 'Inativar' : 'Ativar'}
                confirmColor={pendingToggleUser && isUserActive(pendingToggleUser.status) ? 'red' : 'green'}
                icon={AlertCircle}
                loading={isToggling}
            />
        </AnimatePresence>
    );
};

export default UsersManagementModal;
