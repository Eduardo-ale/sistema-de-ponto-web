import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    Calendar,
    Filter,
    Download,
    Search,
    User,
    CheckCircle,
    AlertTriangle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TimeManagement = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Dados mock para demonstração
    const mockTimeRecords = [
        {
            id: 1,
            user: 'João Silva',
            department: 'TI',
            date: '2024-01-15',
            checkIn: '08:00',
            checkOut: '17:30',
            breakStart: '12:00',
            breakEnd: '13:00',
            totalHours: '8h 30min',
            overtime: '30min',
            status: 'normal'
        },
        {
            id: 2,
            user: 'Maria Santos',
            department: 'RH',
            date: '2024-01-15',
            checkIn: '08:15',
            checkOut: '17:45',
            breakStart: '12:00',
            breakEnd: '13:00',
            totalHours: '8h 30min',
            overtime: '30min',
            status: 'late'
        },
        {
            id: 3,
            user: 'Pedro Costa',
            department: 'Vendas',
            date: '2024-01-15',
            checkIn: '09:00',
            checkOut: '18:00',
            breakStart: '12:00',
            breakEnd: '13:00',
            totalHours: '8h 00min',
            overtime: '0min',
            status: 'late'
        },
        {
            id: 4,
            user: 'Ana Lima',
            department: 'Marketing',
            date: '2024-01-15',
            checkIn: '07:45',
            checkOut: '16:15',
            breakStart: '12:00',
            breakEnd: '13:00',
            totalHours: '7h 30min',
            overtime: '0min',
            status: 'early'
        }
    ];

    const departments = ['Todos', 'TI', 'RH', 'Vendas', 'Marketing', 'Financeiro'];
    const users = ['Todos', 'João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Lima'];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'normal':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'late':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'early':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Minus className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'normal':
                return 'Normal';
            case 'late':
                return 'Atraso';
            case 'early':
                return 'Saída Antecipada';
            default:
                return 'Indefinido';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'normal':
                return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
            case 'late':
                return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
            case 'early':
                return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
            default:
                return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
        }
    };

    // Estatísticas calculadas
    const stats = {
        totalRecords: mockTimeRecords.length,
        onTime: mockTimeRecords.filter(r => r.status === 'normal').length,
        late: mockTimeRecords.filter(r => r.status === 'late').length,
        early: mockTimeRecords.filter(r => r.status === 'early').length,
        totalOvertime: mockTimeRecords.reduce((acc, r) => {
            const overtime = parseInt(r.overtime.replace('min', ''));
            return acc + overtime;
        }, 0)
    };

    const filteredRecords = mockTimeRecords.filter(record => {
        const matchesSearch = record.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUser = selectedUser === '' || selectedUser === 'Todos' || record.user === selectedUser;
        const matchesDepartment = selectedDepartment === '' || selectedDepartment === 'Todos' || record.department === selectedDepartment;

        return matchesSearch && matchesUser && matchesDepartment;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Controle de Ponto
                </h2>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Exportar</span>
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Período */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Período
                        </label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="today">Hoje</option>
                            <option value="week">Esta Semana</option>
                            <option value="month">Este Mês</option>
                            <option value="custom">Período Personalizado</option>
                        </select>
                    </div>

                    {/* Usuário */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Usuário
                        </label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {users.map(user => (
                                <option key={user} value={user}>{user}</option>
                            ))}
                        </select>
                    </div>

                    {/* Departamento */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Departamento
                        </label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Busca */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Buscar
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Nome ou departamento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total de Registros
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {stats.totalRecords}
                            </p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Pontualidade
                            </p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                {stats.onTime}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Atrasos
                            </p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                                {stats.late}
                            </p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Saídas Antecipadas
                            </p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                                {stats.early}
                            </p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Horas Extras
                            </p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                {Math.floor(stats.totalOvertime / 60)}h {stats.totalOvertime % 60}min
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                </motion.div>
            </div>

            {/* Tabela de Registros */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Registros de Ponto
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Data
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Entrada
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Saída
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Horas Extras
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredRecords.map((record) => (
                                <motion.tr
                                    key={record.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {record.user}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {record.department}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {format(new Date(record.date), 'dd/MM/yyyy', { locale: ptBR })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {record.checkIn}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {record.checkOut}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {record.totalHours}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                            {getStatusIcon(record.status)}
                                            <span className="ml-1">{getStatusText(record.status)}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {record.overtime}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TimeManagement;






