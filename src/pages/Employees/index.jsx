import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, Search, Filter, Download, Upload, Edit, Trash2, Eye, MoreVertical,
    UserCheck, UserX, Clock, Calendar, FileText, Settings, AlertCircle, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmployeeTable from './EmployeeTable';
import EmployeeModal from './EmployeeModal';
import ScheduleModal from './ScheduleModal';
import EventsModal from './EventsModal';
import { useEmployees } from '../../hooks/useEmployees';
import { useAuth } from '../../contexts/AuthContext';

const EmployeesPage = () => {
    const { user, hasPermission } = useAuth();
    const {
        employees,
        loading,
        error,
        fetchEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        toggleEmployeeStatus,
        importEmployees,
        exportEmployees
    } = useEmployees();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showEventsModal, setShowEventsModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    // Filtrar colaboradores em tempo real
    useEffect(() => {
        let filtered = employees;

        // Filtro por busca
        if (searchTerm.trim()) {
            filtered = filtered.filter(emp =>
                emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.cpf.includes(searchTerm) ||
                emp.registration.includes(searchTerm)
            );
        }

        // Filtro por status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(emp => emp.status === filterStatus);
        }

        // Filtro por departamento
        if (filterDepartment !== 'all') {
            filtered = filtered.filter(emp => emp.department === filterDepartment);
        }

        setFilteredEmployees(filtered);
    }, [employees, searchTerm, filterStatus, filterDepartment]);

    // Carregar colaboradores ao montar o componente
    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleCreateEmployee = () => {
        setSelectedEmployee(null);
        setModalMode('create');
        setShowEmployeeModal(true);
    };

    const handleEditEmployee = (employee) => {
        setSelectedEmployee(employee);
        setModalMode('edit');
        setShowEmployeeModal(true);
    };

    const handleViewEmployee = (employee) => {
        setSelectedEmployee(employee);
        setModalMode('view');
        setShowEmployeeModal(true);
    };

    const handleScheduleEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowScheduleModal(true);
    };

    const handleEventsEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowEventsModal(true);
    };

    const handleCloseModals = () => {
        setShowEmployeeModal(false);
        setShowScheduleModal(false);
        setShowEventsModal(false);
        setSelectedEmployee(null);
    };

    const handleEmployeeCreated = (newEmployee) => {
        toast.success('✅ Colaborador cadastrado com sucesso!');
        handleCloseModals();
    };

    const handleEmployeeUpdated = (updatedEmployee) => {
        toast.success('✅ Colaborador atualizado com sucesso!');
        handleCloseModals();
    };

    const handleToggleStatus = async (employee) => {
        try {
            await toggleEmployeeStatus(employee.id, !employee.status);
            toast.success(`✅ Colaborador ${employee.status ? 'desativado' : 'ativado'} com sucesso!`);
        } catch (error) {
            toast.error('❌ Erro ao alterar status do colaborador');
        }
    };

    const handleDeleteEmployee = async (employee) => {
        if (window.confirm(`Tem certeza que deseja excluir o colaborador ${employee.name}?`)) {
            try {
                await deleteEmployee(employee.id);
                toast.success('✅ Colaborador excluído com sucesso!');
            } catch (error) {
                toast.error('❌ Erro ao excluir colaborador');
            }
        }
    };

    const handleImport = async (file) => {
        try {
            await importEmployees(file);
            toast.success('✅ Colaboradores importados com sucesso!');
        } catch (error) {
            toast.error('❌ Erro ao importar colaboradores');
        }
    };

    const handleExport = async () => {
        try {
            await exportEmployees();
            toast.success('✅ Colaboradores exportados com sucesso!');
        } catch (error) {
            toast.error('❌ Erro ao exportar colaboradores');
        }
    };

    // Obter departamentos únicos para filtro
    const departments = [...new Set(employees.map(emp => emp.department))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Gestão de Colaboradores
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Gerencie colaboradores, horários e escalas de trabalho
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Botão de Importar */}
                    {hasPermission(['admin', 'rh']) && (
                        <label className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                            <Upload className="w-4 h-4" />
                            <span>Importar</span>
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={(e) => e.target.files[0] && handleImport(e.target.files[0])}
                                className="hidden"
                            />
                        </label>
                    )}

                    {/* Botão de Exportar */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExport}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Exportar</span>
                    </motion.button>

                    {/* Botão de Novo Colaborador */}
                    {hasPermission(['admin', 'rh']) && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCreateEmployee}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Novo Colaborador</span>
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Busca */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar colaboradores..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filtro por Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                    </select>

                    {/* Filtro por Departamento */}
                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todos os Departamentos</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>

                    {/* Botão Limpar Filtros */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('all');
                            setFilterDepartment('all');
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Limpar</span>
                    </motion.button>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativos</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {employees.filter(emp => emp.status).length}
                            </p>
                        </div>
                        <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inativos</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {employees.filter(emp => !emp.status).length}
                            </p>
                        </div>
                        <UserX className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Departamentos</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{departments.length}</p>
                        </div>
                        <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                </motion.div>
            </div>

            {/* Tabela de Colaboradores */}
            <EmployeeTable
                employees={filteredEmployees}
                loading={loading}
                onEdit={handleEditEmployee}
                onView={handleViewEmployee}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteEmployee}
                onSchedule={handleScheduleEmployee}
                onEvents={handleEventsEmployee}
                userPermissions={user?.role}
            />

            {/* Modais */}
            <AnimatePresence>
                {showEmployeeModal && (
                    <EmployeeModal
                        isOpen={showEmployeeModal}
                        onClose={handleCloseModals}
                        employee={selectedEmployee}
                        mode={modalMode}
                        onSuccess={modalMode === 'create' ? handleEmployeeCreated : handleEmployeeUpdated}
                    />
                )}

                {showScheduleModal && (
                    <ScheduleModal
                        isOpen={showScheduleModal}
                        onClose={handleCloseModals}
                        employee={selectedEmployee}
                        onSuccess={() => {
                            toast.success('✅ Horários atualizados com sucesso!');
                            handleCloseModals();
                        }}
                    />
                )}

                {showEventsModal && (
                    <EventsModal
                        isOpen={showEventsModal}
                        onClose={handleCloseModals}
                        employee={selectedEmployee}
                        onSuccess={() => {
                            toast.success('✅ Eventos atualizados com sucesso!');
                            handleCloseModals();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeesPage;






