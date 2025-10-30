import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Mail, Calendar, MoreVertical } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'Ativo' | 'Inativo';
    lastLogin: string;
    avatar?: string;
}

interface UserListProps {
    users: User[];
    title?: string;
    delay?: number;
    onUserClick?: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({
    users,
    title = 'Usuários Recentes',
    delay = 0,
    onUserClick
}) => {
    const getStatusColor = (status: User['status']) => {
        return status === 'Ativo'
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
    };

    const getRoleColor = (role: string) => {
        const colors = {
            'Administrador': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400',
            'RH': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
            'Gestor': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400',
            'Colaborador': 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
        };
        return colors[role as keyof typeof colors] || colors.Colaborador;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                    {users.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: delay + index * 0.1 }}
                            onClick={() => onUserClick?.(user)}
                            className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <UserCheck className="w-6 h-6 text-white" />
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${user.status === 'Ativo' ? 'bg-green-500' : 'bg-red-500'
                                        }`}></div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {user.name}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Mail className="w-3 h-3 text-gray-400" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${getRoleColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${getStatusColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {user.lastLogin}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                >
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {users.length === 0 && (
                    <div className="text-center py-8">
                        <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            Nenhum usuário encontrado
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default UserList;






