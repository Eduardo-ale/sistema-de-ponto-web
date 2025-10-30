import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Globe,
    Clock,
    Palette,
    Bell,
    Shield,
    Database,
    Save,
    X,
    RefreshCw,
    Monitor,
    Smartphone,
    Sun,
    Moon
} from 'lucide-react';
import toast from 'react-hot-toast';

const GeneralSettingsModal = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState({
        // Configurações de Interface
        theme: 'dark',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',

        // Configurações de Notificações
        emailNotifications: true,
        pushNotifications: false,
        systemAlerts: true,
        weeklyReports: true,

        // Configurações de Sistema
        autoSave: true,
        sessionTimeout: 15,
        dataRetention: 365,
        debugMode: false,

        // Configurações de Privacidade
        analytics: true,
        cookies: true,
        dataSharing: false
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Salvar no localStorage
            localStorage.setItem('generalSettings', JSON.stringify(settings));

            toast.success('Configurações salvas com sucesso!', {
                duration: 3000,
                icon: '✅'
            });

            onClose();
        } catch (error) {
            toast.error('Erro ao salvar configurações');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setSettings({
            theme: 'dark',
            language: 'pt-BR',
            timezone: 'America/Sao_Paulo',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            emailNotifications: true,
            pushNotifications: false,
            systemAlerts: true,
            weeklyReports: true,
            autoSave: true,
            sessionTimeout: 15,
            dataRetention: 365,
            debugMode: false,
            analytics: true,
            cookies: true,
            dataSharing: false
        });

        toast.info('Configurações restauradas para o padrão', {
            duration: 2000,
            icon: '🔄'
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence key="general-settings-presence">
            <motion.div
                key="general-settings-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    key="general-settings-modal"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                    className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Configurações Gerais</h2>
                                    <p className="text-sm text-gray-400">Personalize sua experiência no sistema</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <motion.button
                                    onClick={handleReset}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    title="Restaurar padrões"
                                >
                                    <RefreshCw className="w-5 h-5 text-gray-400" />
                                </motion.button>
                                <motion.button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed rounded-lg transition-colors"
                                    title="Salvar configurações"
                                >
                                    {isSaving ? (
                                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5 text-white" />
                                    )}
                                </motion.button>
                                <motion.button
                                    onClick={onClose}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    title="Fechar"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-8">
                        {/* Configurações de Interface */}
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Palette className="w-5 h-5 mr-2 text-purple-400" />
                                Interface e Aparência
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tema
                                    </label>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleSettingChange('theme', 'light')}
                                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${settings.theme === 'light'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            <Sun className="w-4 h-4" />
                                            <span>Claro</span>
                                        </button>
                                        <button
                                            onClick={() => handleSettingChange('theme', 'dark')}
                                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${settings.theme === 'dark'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            <Moon className="w-4 h-4" />
                                            <span>Escuro</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Idioma
                                    </label>
                                    <select
                                        value={settings.language}
                                        onChange={(e) => handleSettingChange('language', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pt-BR">Português (Brasil)</option>
                                        <option value="en-US">English (US)</option>
                                        <option value="es-ES">Español</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Formato de Data
                                    </label>
                                    <select
                                        value={settings.dateFormat}
                                        onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Formato de Hora
                                    </label>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleSettingChange('timeFormat', '12h')}
                                            className={`px-3 py-2 rounded-lg transition-colors ${settings.timeFormat === '12h'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            12h (AM/PM)
                                        </button>
                                        <button
                                            onClick={() => handleSettingChange('timeFormat', '24h')}
                                            className={`px-3 py-2 rounded-lg transition-colors ${settings.timeFormat === '24h'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            24h
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configurações de Notificações */}
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Bell className="w-5 h-5 mr-2 text-yellow-400" />
                                Notificações
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { key: 'emailNotifications', label: 'Notificações por E-mail', description: 'Receber alertas importantes por e-mail' },
                                    { key: 'pushNotifications', label: 'Notificações Push', description: 'Notificações no navegador' },
                                    { key: 'systemAlerts', label: 'Alertas do Sistema', description: 'Avisos sobre problemas do sistema' },
                                    { key: 'weeklyReports', label: 'Relatórios Semanais', description: 'Receber relatórios automáticos' }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                        <div>
                                            <h4 className="text-white font-medium">{item.label}</h4>
                                            <p className="text-sm text-gray-400">{item.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleSettingChange(item.key, !settings[item.key])}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${settings[item.key] ? 'bg-blue-600' : 'bg-gray-600'
                                                }`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings[item.key] ? 'translate-x-7' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Configurações de Sistema */}
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Database className="w-5 h-5 mr-2 text-blue-400" />
                                Sistema e Performance
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Timeout de Sessão (minutos)
                                    </label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="60"
                                        value={settings.sessionTimeout}
                                        onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Retenção de Dados (dias)
                                    </label>
                                    <input
                                        type="number"
                                        min="30"
                                        max="1095"
                                        value={settings.dataRetention}
                                        onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                    <div>
                                        <h4 className="text-white font-medium">Salvamento Automático</h4>
                                        <p className="text-sm text-gray-400">Salvar alterações automaticamente</p>
                                    </div>
                                    <button
                                        onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.autoSave ? 'bg-blue-600' : 'bg-gray-600'
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.autoSave ? 'translate-x-7' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                    <div>
                                        <h4 className="text-white font-medium">Modo Debug</h4>
                                        <p className="text-sm text-gray-400">Ativar logs detalhados</p>
                                    </div>
                                    <button
                                        onClick={() => handleSettingChange('debugMode', !settings.debugMode)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.debugMode ? 'bg-blue-600' : 'bg-gray-600'
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.debugMode ? 'translate-x-7' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Configurações de Privacidade */}
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-red-400" />
                                Privacidade e Dados
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { key: 'analytics', label: 'Analytics de Uso', description: 'Coletar dados de uso para melhorias' },
                                    { key: 'cookies', label: 'Cookies Essenciais', description: 'Permitir cookies necessários' },
                                    { key: 'dataSharing', label: 'Compartilhamento de Dados', description: 'Compartilhar dados com terceiros' }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                        <div>
                                            <h4 className="text-white font-medium">{item.label}</h4>
                                            <p className="text-sm text-gray-400">{item.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleSettingChange(item.key, !settings[item.key])}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${settings[item.key] ? 'bg-blue-600' : 'bg-gray-600'
                                                }`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings[item.key] ? 'translate-x-7' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GeneralSettingsModal;
