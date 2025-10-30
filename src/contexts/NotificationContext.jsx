import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Context para notificações
const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications deve ser usado dentro de NotificationProvider');
    }
    return context;
};

// Tipos de notificação
const NOTIFICATION_TYPES = {
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILED: 'login_failed',
    SESSION_EXPIRED: 'session_expired',
    SESSION_WARNING: 'session_warning',
    SESSION_RENEWED: 'session_renewed',
    SECURITY_ALERT: 'security_alert',
    SYSTEM_ERROR: 'system_error'
};

// Configurações de notificação
const NOTIFICATION_CONFIG = {
    MAX_NOTIFICATIONS: 50,
    AUTO_DISMISS_TIME: 5000, // 5 segundos
    PERSISTENT_TYPES: ['security_alert', 'system_error'] // Tipos que não são auto-dismiss
};

// Provider de notificações
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Carregar notificações salvas
    useEffect(() => {
        const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        setNotifications(savedNotifications);
        updateUnreadCount(savedNotifications);
    }, []);

    // Salvar notificações no localStorage
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
        updateUnreadCount(notifications);
    }, [notifications]);

    // Atualizar contador de não lidas
    const updateUnreadCount = (notificationsList) => {
        const count = notificationsList.filter(n => !n.read).length;
        setUnreadCount(count);
    };

    // Adicionar nova notificação
    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            return updated.slice(0, NOTIFICATION_CONFIG.MAX_NOTIFICATIONS);
        });

        // Auto-dismiss para tipos não persistentes
        if (!NOTIFICATION_CONFIG.PERSISTENT_TYPES.includes(notification.type)) {
            setTimeout(() => {
                dismissNotification(newNotification.id);
            }, NOTIFICATION_CONFIG.AUTO_DISMISS_TIME);
        }

        // Mostrar toast
        showToast(newNotification);

        return newNotification.id;
    }, []);

    // Marcar como lida
    const markAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    }, []);

    // Marcar todas como lidas
    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    }, []);

    // Descartar notificação
    const dismissNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    // Limpar todas as notificações
    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Mostrar toast baseado no tipo
    const showToast = (notification) => {
        const { type, title, message } = notification;

        switch (type) {
            case NOTIFICATION_TYPES.LOGIN_SUCCESS:
                toast.success(`${title}: ${message}`, {
                    duration: 4000,
                    icon: '✅'
                });
                break;
            case NOTIFICATION_TYPES.LOGIN_FAILED:
                toast.error(`${title}: ${message}`, {
                    duration: 6000,
                    icon: '🚫'
                });
                break;
            case NOTIFICATION_TYPES.SESSION_EXPIRED:
                toast.error(`${title}: ${message}`, {
                    duration: 5000,
                    icon: '⏰'
                });
                break;
            case NOTIFICATION_TYPES.SECURITY_ALERT:
                toast.error(`${title}: ${message}`, {
                    duration: 8000,
                    icon: '🚨'
                });
                break;
            case NOTIFICATION_TYPES.SYSTEM_ERROR:
                toast.error(`${title}: ${message}`, {
                    duration: 6000,
                    icon: '⚠️'
                });
                break;
            default:
                toast(`${title}: ${message}`, {
                    duration: 4000
                });
        }
    };

    // Simular notificações em tempo real
    useEffect(() => {
        const interval = setInterval(() => {
            // Simular eventos aleatórios para demonstração
            const events = [
                {
                    type: NOTIFICATION_TYPES.LOGIN_SUCCESS,
                    title: 'Login Realizado',
                    message: 'Usuário fez login com sucesso',
                    userId: 1,
                    userName: 'Admin',
                    userEmail: 'admin@sistema.com'
                },
                {
                    type: NOTIFICATION_TYPES.LOGIN_FAILED,
                    title: 'Tentativa de Login Falhada',
                    message: 'Credenciais inválidas detectadas',
                    userEmail: 'hacker@example.com'
                },
                {
                    type: NOTIFICATION_TYPES.SESSION_EXPIRED,
                    title: 'Sessão Expirada',
                    message: 'Usuário foi desconectado por inatividade',
                    userId: 2,
                    userName: 'Colaborador',
                    userEmail: 'colaborador@sistema.com'
                }
            ];

            // 10% de chance de gerar notificação a cada intervalo
            if (Math.random() < 0.1) {
                const randomEvent = events[Math.floor(Math.random() * events.length)];
                addNotification(randomEvent);
            }
        }, 30000); // Verificar a cada 30 segundos

        return () => clearInterval(interval);
    }, [addNotification]);

    const value = {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearAllNotifications,
        NOTIFICATION_TYPES
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// Componente de painel de notificações melhorado
export const NotificationPanel = ({ isOpen, onClose }) => {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        dismissNotification
    } = useNotifications();

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'login_success':
                return '✅';
            case 'login_failed':
                return '🚫';
            case 'session_expired':
                return '⏰';
            case 'session_warning':
                return '⚠️';
            case 'session_renewed':
                return '🔄';
            case 'security_alert':
                return '🚨';
            case 'system_error':
                return '⚠️';
            default:
                return '📢';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'login_success':
                return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
            case 'login_failed':
                return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
            case 'session_expired':
                return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
            case 'session_warning':
                return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
            case 'session_renewed':
                return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
            case 'security_alert':
                return 'border-l-red-600 bg-red-100 dark:bg-red-900/20';
            case 'system_error':
                return 'border-l-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
            default:
                return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
        }
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
        return notificationTime.toLocaleDateString('pt-BR');
    };

    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <span className="text-xl">🔔</span>
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
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                Marcar todas como lidas
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-6xl mb-4 block">🔔</span>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Nenhuma notificação
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Você está em dia! 🎉
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification, index) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <span className="text-lg">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-sm font-semibold ${!notification.read
                                                        ? 'text-gray-900 dark:text-white'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>

                                            <p className={`text-sm mt-1 ${!notification.read
                                                    ? 'text-gray-700 dark:text-gray-300'
                                                    : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {notification.message}
                                            </p>

                                            {notification.userName && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Usuário: {notification.userName}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatTime(notification.timestamp)}
                                                </span>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dismissNotification(notification.id);
                                                    }}
                                                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => {
                                onClose();
                                // Aqui você pode navegar para a página de auditoria
                                window.location.href = '/admin-dashboard?tab=audit';
                            }}
                            className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                            Ver todos os logs de auditoria →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationProvider;






