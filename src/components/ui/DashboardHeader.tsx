import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Upload, Plus, Settings, Bell, Sun, Moon, Menu, X } from 'lucide-react';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    notifications: any[];
    onToggleNotifications: () => void;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    onExport?: () => void;
    onImport?: () => void;
    onCreateNew?: () => void;
    showActions?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    title,
    subtitle,
    searchTerm,
    onSearchChange,
    isDarkMode,
    onToggleDarkMode,
    notifications,
    onToggleNotifications,
    sidebarOpen,
    onToggleSidebar,
    onExport,
    onImport,
    onCreateNew,
    showActions = true
}) => {
    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
        >
            <div className="flex items-center justify-between">
                {/* Left side - Title and Mobile Menu */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {sidebarOpen ? (
                            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        )}
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Center - Search */}
                <div className="flex-1 max-w-md mx-8 hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar usuários, registros..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Right side - Actions and Controls */}
                <div className="flex items-center space-x-3">
                    {/* Mobile Search */}
                    <div className="md:hidden">
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Actions */}
                    {showActions && (
                        <div className="hidden sm:flex items-center space-x-2">
                            {onExport && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onExport}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden lg:inline">Exportar</span>
                                </motion.button>
                            )}

                            {onImport && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onImport}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="hidden lg:inline">Importar</span>
                                </motion.button>
                            )}

                            {onCreateNew && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onCreateNew}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden lg:inline">Novo</span>
                                </motion.button>
                            )}
                        </div>
                    )}

                    {/* Notifications */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onToggleNotifications}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                        >
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            {unreadNotifications > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                                >
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </motion.div>
                            )}
                        </motion.button>
                    </div>

                    {/* Dark Mode Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggleDarkMode}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5 text-yellow-500" />
                        ) : (
                            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                    </motion.button>

                    {/* Settings */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </motion.button>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden mt-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                </div>
            </div>
        </motion.header>
    );
};

export default DashboardHeader;






