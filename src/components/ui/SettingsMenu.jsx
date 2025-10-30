import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut,
    Settings,
    UserCog,
    Moon,
    Sun,
    Shield,
    Bell,
    HelpCircle,
    Info,
    Mail,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const SettingsMenu = ({ isOpen, onClose, onOpenUserProfile, onOpenGeneralSettings, onOpenHelpCenter, onOpenSecuritySettings, onOpenEmailConfig }) => {
    const { logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true); // Assumindo tema escuro por padrão

    const handleLogout = async () => {
        try {
            // Mostrar feedback visual
            toast.success('Encerrando sessão...', {
                duration: 2000,
                icon: '👋'
            });

            // Aguardar um pouco para o feedback visual
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Executar logout
            await logout();

            // Feedback de sucesso
            toast.success('Sessão encerrada com sucesso!', {
                duration: 3000,
                icon: '✅'
            });

            // Fechar menu
            onClose();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            toast.error('Erro ao encerrar sessão');
        }
    };

    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
        toast.success(`Tema ${!isDarkMode ? 'escuro' : 'claro'} ativado`, {
            duration: 2000,
            icon: isDarkMode ? '🌙' : '☀️'
        });
    };

    const getItemDescription = (label) => {
        const descriptions = {
            'Configurações Gerais': 'Personalize interface e comportamento',
            'Perfil do Usuário': 'Gerencie seus dados pessoais',
            'Notificações': 'Configure alertas e notificações',
            'Segurança': 'Senhas, autenticação e privacidade',
            'Configuração de E-mail': 'Servidor SMTP e templates',
            'Tema Claro': 'Alternar para tema claro',
            'Tema Escuro': 'Alternar para tema escuro',
            'Ajuda': 'Documentação e suporte',
            'Sobre o Sistema': 'Informações da versão'
        };
        return descriptions[label] || 'Configuração do sistema';
    };

    const menuItems = [
        {
            icon: Settings,
            label: 'Configurações Gerais',
            action: () => {
                onOpenGeneralSettings();
                onClose();
            },
            color: 'text-gray-300 hover:text-white hover:bg-gray-800'
        },
        {
            icon: UserCog,
            label: 'Perfil do Usuário',
            action: () => {
                onOpenUserProfile();
                onClose();
            },
            color: 'text-gray-300 hover:text-white hover:bg-gray-800'
        },
        {
            icon: Bell,
            label: 'Notificações',
            action: () => {
                toast('Configurações de notificação em desenvolvimento', {
                    duration: 2000,
                    icon: '🔔',
                    style: { background: '#3B82F6', color: '#fff' }
                });
                onClose();
            },
            color: 'text-gray-300 hover:text-white hover:bg-gray-800'
        },
        {
            icon: Shield,
            label: 'Segurança',
            action: () => {
                onOpenSecuritySettings();
                onClose();
            },
            color: 'text-gray-300 hover:text-white hover:bg-gray-800'
        },
        {
            icon: Mail,
            label: 'Configuração de E-mail',
            action: () => {
                onOpenEmailConfig();
                onClose();
            },
            color: 'text-gray-300 hover:text-white hover:bg-gray-800'
        },
        {
            icon: isDarkMode ? Sun : Moon,
            label: isDarkMode ? 'Tema Claro' : 'Tema Escuro',
            action: handleThemeToggle,
            color: 'text-gray-300 hover:text-white hover:bg-gray-800'
        },
        {
            icon: HelpCircle,
            label: 'Ajuda',
            action: () => {
                onOpenHelpCenter();
                onClose();
            },
            color: 'text-gray-300 hover:text-white hover:bg-gray-800'
        },
        {
            icon: Info,
            label: 'Sobre o Sistema',
            action: () => {
                toast('CORE RH v2.0 - Sistema de Registro de Ponto', {
                    duration: 3000,
                    icon: 'ℹ️',
                    style: { background: '#3B82F6', color: '#fff' }
                });
                onClose();
            },
            color: 'text-gray-300 hover:text-white hover:bg-gray-800'
        }
    ];

    if (!isOpen) return null;

    return (
        <>
            <AnimatePresence key="settings-menu-presence">
                {/* Overlay para detectar cliques fora do menu */}
                <motion.div
                    key="settings-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={onClose}
                />

                <motion.div
                    key="settings-menu"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, type: 'spring', damping: 25 }}
                    className="absolute right-0 top-12 w-72 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl border border-gray-600/50 z-50 overflow-hidden backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header do menu */}
                    <div className="px-6 py-4 border-b border-gray-600/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-400" />
                                Configurações
                            </h3>
                            <p className="text-sm text-gray-300 mt-1">Gerencie suas preferências do sistema</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group"
                            title="Fechar configurações"
                        >
                            <X className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-200" />
                        </button>
                    </div>

                    {/* Lista de opções */}
                    <div className="py-3">
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={`menu-item-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={item.action}
                                className="group flex items-center gap-4 px-6 py-3 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10 hover:border-l-4 hover:border-blue-400"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-700/50 group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:to-purple-500/20 flex items-center justify-center transition-all duration-200">
                                    <item.icon size={20} className="text-gray-300 group-hover:text-blue-400 transition-colors duration-200" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors duration-200">
                                        {item.label}
                                    </span>
                                    <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200 mt-0.5">
                                        {getItemDescription(item.label)}
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-gray-600 group-hover:bg-blue-400 transition-colors duration-200"></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Separador */}
                    <div className="mx-6 my-3">
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                    </div>

                    {/* Botão de logout */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: menuItems.length * 0.05 }}
                        className="px-6 py-3"
                    >
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="group w-full flex items-center gap-4 px-4 py-4 text-red-400 hover:bg-gradient-to-r hover:from-red-600/10 hover:to-red-500/10 hover:text-red-300 rounded-xl cursor-pointer transition-all duration-200 border border-red-600/20 hover:border-red-500/40"
                        >
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-900/20 group-hover:bg-gradient-to-br group-hover:from-red-500/20 group-hover:to-red-600/20 flex items-center justify-center transition-all duration-200">
                                <LogOut size={20} className="group-hover:rotate-12 transition-transform duration-200" />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-semibold group-hover:text-red-200 transition-colors duration-200">
                                    Sair do Sistema
                                </span>
                                <div className="text-xs text-red-500 group-hover:text-red-400 transition-colors duration-200 mt-0.5">
                                    Encerrar sessão atual
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <div className="w-2 h-2 rounded-full bg-red-600 group-hover:bg-red-400 transition-colors duration-200"></div>
                            </div>
                        </button>
                    </motion.div>

                    {/* Modal de confirmação de logout */}
                    <AnimatePresence key="logout-confirm-presence">
                        {showLogoutConfirm && (
                            <motion.div
                                key="logout-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                <motion.div
                                    key="logout-modal"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-700"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <LogOut className="w-8 h-8 text-red-400" />
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2">
                                            Confirmar Logout
                                        </h3>

                                        <p className="text-gray-400 mb-6">
                                            Tem certeza que deseja sair do sistema? Você precisará fazer login novamente para acessar o painel administrativo.
                                        </p>

                                        <div className="flex space-x-3">
                                            <motion.button
                                                onClick={() => setShowLogoutConfirm(false)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
                                            >
                                                Cancelar
                                            </motion.button>

                                            <motion.button
                                                onClick={handleLogout}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
                                            >
                                                Sair do Sistema
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default SettingsMenu;
