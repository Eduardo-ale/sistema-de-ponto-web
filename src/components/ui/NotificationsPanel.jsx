import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertTriangle, Info, Clock, Trash2 } from 'lucide-react';

const NotificationsPanel = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAllNotifications
}) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 border-l border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notificações
                  </h2>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onClearAllNotifications}
                  className="group flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                  title="Limpar todas as notificações persistentes"
                >
                  <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                  <span>Limpar</span>
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Marcar todas como lidas</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                  title="Fechar painel de notificações"
                >
                  <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => onMarkAsRead?.(notification.id)}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${notification.read
                        ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-semibold ${notification.read
                              ? 'text-gray-700 dark:text-gray-300'
                              : 'text-gray-900 dark:text-white'
                              }`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>

                          <p className={`text-sm mt-1 ${notification.read
                            ? 'text-gray-500 dark:text-gray-400'
                            : 'text-gray-700 dark:text-gray-300'
                            }`}>
                            {notification.message}
                          </p>

                          <div className="flex items-center mt-2">
                            <Clock className="w-3 h-3 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center shadow-lg">
                      <Bell className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Nenhuma notificação
                    </h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      Você está em dia! ✨
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 dark:text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Sistema funcionando perfeitamente</span>
                    </div>
                  </div>

                  <div className="w-full max-w-xs">
                    <button
                      onClick={onClearAllNotifications}
                      className="group w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                      title="Limpar todos os dados persistentes do sistema"
                    >
                      <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                      <span>Limpar Dados Persistentes</span>
                    </button>

                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
                      Remove notificações, logs e dados temporários
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPanel;
