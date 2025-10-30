import React from 'react';
import { motion } from 'framer-motion';
import {
    Edit, Trash2, Eye, MoreVertical, UserCheck, UserX, Clock, Calendar,
    Mail, Phone, MapPin, Building2, CreditCard, Calendar as CalendarIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EmployeeTable = ({
    employees,
    loading,
    onEdit,
    onView,
    onToggleStatus,
    onDelete,
    onSchedule,
    onEvents,
    userPermissions
}) => {
    const getStatusColor = (status) => {
        return status
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
    };

    const getRoleColor = (role) => {
        const colors = {
            'admin': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400',
            'rh': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
            'manager': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400',
            'employee': 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
        };
        return colors[role] || colors.employee;
    };

    const getRoleLabel = (role) => {
        const labels = {
            'admin': 'Administrador',
            'rh': 'RH',
            'manager': 'Gestor',
            'employee': 'Colaborador'
        };
        return labels[role] || 'Colaborador';
    };

    const canEdit = ['admin', 'rh'].includes(userPermissions);
    const canDelete = ['admin'].includes(userPermissions);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando colaboradores...</span>
                </div>
            </div>
        );
    }

    if (employees.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                <div className="text-center">
                    <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Nenhum colaborador encontrado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Comece cadastrando um novo colaborador ou ajuste os filtros de busca.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Lista de Colaboradores ({employees.length})
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Colaborador
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Contato
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Cargo/Setor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Perfil
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Cadastro
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {employees.map((employee, index) => (
                            <motion.tr
                                key={employee.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                {/* Colaborador */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                            <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {employee.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                CPF: {employee.cpf}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Matrícula: {employee.registration}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Contato */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        <div className="flex items-center mb-1">
                                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                            {employee.email}
                                        </div>
                                        {employee.phone && (
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                {employee.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Cargo/Setor */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        <div className="font-medium">{employee.position}</div>
                                        <div className="text-gray-500 dark:text-gray-400">
                                            <Building2 className="w-4 h-4 inline mr-1" />
                                            {employee.department}
                                        </div>
                                    </div>
                                </td>

                                {/* Perfil */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(employee.role)}`}>
                                        {getRoleLabel(employee.role)}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                                            {employee.status ? 'Ativo' : 'Inativo'}
                                        </span>
                                        {canEdit && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => onToggleStatus(employee)}
                                                className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                title={employee.status ? 'Desativar' : 'Ativar'}
                                            >
                                                {employee.status ? (
                                                    <UserX className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <UserCheck className="w-4 h-4 text-green-500" />
                                                )}
                                            </motion.button>
                                        )}
                                    </div>
                                </td>

                                {/* Cadastro */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <CalendarIcon className="w-4 h-4 mr-1" />
                                        {format(new Date(employee.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                                    </div>
                                </td>

                                {/* Ações */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        {/* Ver */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => onView(employee)}
                                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title="Visualizar"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </motion.button>

                                        {/* Editar */}
                                        {canEdit && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => onEdit(employee)}
                                                className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </motion.button>
                                        )}

                                        {/* Horários */}
                                        {canEdit && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => onSchedule(employee)}
                                                className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                                title="Horários"
                                            >
                                                <Clock className="w-4 h-4" />
                                            </motion.button>
                                        )}

                                        {/* Eventos */}
                                        {canEdit && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => onEvents(employee)}
                                                className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                                title="Eventos"
                                            >
                                                <Calendar className="w-4 h-4" />
                                            </motion.button>
                                        )}

                                        {/* Excluir */}
                                        {canDelete && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => onDelete(employee)}
                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </motion.button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeTable;
