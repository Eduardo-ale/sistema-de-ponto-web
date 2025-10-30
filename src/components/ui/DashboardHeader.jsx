import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Upload, Plus, Settings, Bell, Sun, Moon, Menu, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import notificacoesService from '../../services/notificacoesService';

const DashboardHeader = ({
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
  showActions = true,
  onToggleSettings
}) => {
  const { unreadCount: contextUnreadCount } = useNotifications();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Atualizar contador de notificações não lidas (com throttling)
  useEffect(() => {
    if (!user?.id) return;

    let lastUpdate = 0;
    let timeoutId = null;
    const THROTTLE_DELAY = 2000; // 2 segundos entre atualizações

    const updateCount = () => {
      const now = Date.now();
      if (now - lastUpdate < THROTTLE_DELAY) {
        return; // Throttle
      }
      lastUpdate = now;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const count = notificacoesService.getContagemNaoLidas(user.id);
        setUnreadCount(count);
      }, 500); // Debounce de 500ms
    };

    // Carregar inicialmente
    updateCount();

    // Escutar eventos com throttling
    const handleNovaNotificacao = () => {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
      updateCount();
    };

    const handleNotificacaoAtualizada = updateCount;
    const handleTodasNotificacoesLidas = updateCount;

    window.addEventListener('novaNotificacao', handleNovaNotificacao, { passive: true });
    window.addEventListener('notificacaoAtualizada', handleNotificacaoAtualizada, { passive: true });
    window.addEventListener('todasNotificacoesLidas', handleTodasNotificacoesLidas, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('novaNotificacao', handleNovaNotificacao);
      window.removeEventListener('notificacaoAtualizada', handleNotificacaoAtualizada);
      window.removeEventListener('todasNotificacoesLidas', handleTodasNotificacoesLidas);
    };
  }, [user?.id]);

  // Usar o maior contador (contexto ou novo serviço)
  const totalUnreadCount = Math.max(unreadCount, contextUnreadCount || 0);

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
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative ${animating ? 'animate-pulse' : ''}`}
            >
              <Bell className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${animating ? 'animate-bounce' : ''}`} />
              {totalUnreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: animating ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg ring-2 ring-red-200 dark:ring-red-800"
                >
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
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
            onClick={onToggleSettings}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Configurações"
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
