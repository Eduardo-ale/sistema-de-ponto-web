import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

interface Notification {
    id: number;
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead?: (id: number) => void;
    onMarkAllAsRead?: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead,
    onMarkAllAsRead
}) => {
    const getNotificationIcon = (type: Notification['type']) => {
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
                                {unreadCount > 0 && (
                                    <button
                                        onClick={onMarkAllAsRead}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                        Marcar todas como lidas
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
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
                                <div className="text-center py-12">
                                    <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Nenhuma notificação
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Você está em dia! 🎉
                                    </p>
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






