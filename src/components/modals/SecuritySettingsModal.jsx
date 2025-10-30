import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Key,
    Lock,
    Eye,
    EyeOff,
    Smartphone,
    Mail,
    AlertTriangle,
    CheckCircle,
    X,
    Save,
    RefreshCw,
    Clock,
    User,
    Database,
    FileText,
    Download,
    Trash2,
    Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const SecuritySettingsModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('password');
    const [isSaving, setIsSaving] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Estados para diferentes seções
    const [passwordSettings, setPasswordSettings] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        passwordHistory: 5
    });

    const [twoFactorSettings, setTwoFactorSettings] = useState({
        enabled: false,
        method: 'email', // email, sms, authenticator
        backupCodes: [],
        phoneNumber: '',
        emailAddress: user?.email || ''
    });

    const [sessionSettings, setSessionSettings] = useState({
        timeoutMinutes: 15,
        maxConcurrentSessions: 3,
        requireReauthForSensitive: true,
        logoutOnInactivity: true,
        rememberDevice: false
    });

    const [auditSettings, setAuditSettings] = useState({
        logLoginAttempts: true,
        logPasswordChanges: true,
        logSecurityEvents: true,
        logDataAccess: true,
        retentionDays: 90,
        alertOnSuspiciousActivity: true
    });

    const [privacySettings, setPrivacySettings] = useState({
        dataEncryption: true,
        anonymizeLogs: false,
        shareAnalytics: false,
        allowCookies: true,
        gdprCompliance: true
    });

    // Carregar configurações salvas
    useEffect(() => {
        const savedSettings = localStorage.getItem('securitySettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setPasswordSettings(prev => ({ ...prev, ...parsed.passwordSettings }));
            setTwoFactorSettings(prev => ({ ...prev, ...parsed.twoFactorSettings }));
            setSessionSettings(prev => ({ ...prev, ...parsed.sessionSettings }));
            setAuditSettings(prev => ({ ...prev, ...parsed.auditSettings }));
            setPrivacySettings(prev => ({ ...prev, ...parsed.privacySettings }));
        }
    }, []);

    const handlePasswordChange = (field, value) => {
        setPasswordSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTwoFactorChange = (field, value) => {
        setTwoFactorSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSessionChange = (field, value) => {
        setSessionSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAuditChange = (field, value) => {
        setAuditSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePrivacyChange = (field, value) => {
        setPrivacySettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validatePassword = (password) => {
        const rules = {
            length: password.length >= passwordSettings.minLength,
            uppercase: passwordSettings.requireUppercase ? /[A-Z]/.test(password) : true,
            lowercase: passwordSettings.requireLowercase ? /[a-z]/.test(password) : true,
            numbers: passwordSettings.requireNumbers ? /\d/.test(password) : true,
            symbols: passwordSettings.requireSymbols ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true
        };
        return rules;
    };

    const generateBackupCodes = () => {
        const codes = Array.from({ length: 10 }, () =>
            Math.random().toString(36).substring(2, 8).toUpperCase()
        );
        setTwoFactorSettings(prev => ({
            ...prev,
            backupCodes: codes
        }));
        toast.success('Códigos de backup gerados!', {
            duration: 3000,
            icon: '🔐'
        });
    };

    const handleSavePassword = async () => {
        if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        const validation = validatePassword(passwordSettings.newPassword);
        if (!Object.values(validation).every(Boolean)) {
            toast.error('A senha não atende aos critérios de segurança');
            return;
        }

        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Senha alterada com sucesso!', {
                duration: 3000,
                icon: '✅'
            });
            setPasswordSettings(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error) {
            toast.error('Erro ao alterar senha');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePasswordSettings = async () => {
        setIsSaving(true);
        try {
            // Salvar configurações de senha no localStorage
            const savedSettings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
            savedSettings.passwordSettings = passwordSettings;
            localStorage.setItem('securitySettings', JSON.stringify(savedSettings));

            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Configurações de senha salvas!', {
                duration: 2000,
                icon: '🔐'
            });
        } catch (error) {
            toast.error('Erro ao salvar configurações de senha');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveTwoFactorSettings = async () => {
        setIsSaving(true);
        try {
            // Salvar configurações de 2FA no localStorage
            const savedSettings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
            savedSettings.twoFactorSettings = twoFactorSettings;
            localStorage.setItem('securitySettings', JSON.stringify(savedSettings));

            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Configurações de 2FA salvas!', {
                duration: 2000,
                icon: '🔐'
            });
        } catch (error) {
            toast.error('Erro ao salvar configurações de 2FA');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSessionSettings = async () => {
        setIsSaving(true);
        try {
            // Salvar configurações de sessão no localStorage
            const savedSettings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
            savedSettings.sessionSettings = sessionSettings;
            localStorage.setItem('securitySettings', JSON.stringify(savedSettings));

            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Configurações de sessão salvas!', {
                duration: 2000,
                icon: '⏰'
            });
        } catch (error) {
            toast.error('Erro ao salvar configurações de sessão');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAuditSettings = async () => {
        setIsSaving(true);
        try {
            // Salvar configurações de auditoria no localStorage
            const savedSettings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
            savedSettings.auditSettings = auditSettings;
            localStorage.setItem('securitySettings', JSON.stringify(savedSettings));

            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Configurações de auditoria salvas!', {
                duration: 2000,
                icon: '📊'
            });
        } catch (error) {
            toast.error('Erro ao salvar configurações de auditoria');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePrivacySettings = async () => {
        setIsSaving(true);
        try {
            // Salvar configurações de privacidade no localStorage
            const savedSettings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
            savedSettings.privacySettings = privacySettings;
            localStorage.setItem('securitySettings', JSON.stringify(savedSettings));

            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Configurações de privacidade salvas!', {
                duration: 2000,
                icon: '🛡️'
            });
        } catch (error) {
            toast.error('Erro ao salvar configurações de privacidade');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            const allSettings = {
                passwordSettings,
                twoFactorSettings,
                sessionSettings,
                auditSettings,
                privacySettings
            };

            localStorage.setItem('securitySettings', JSON.stringify(allSettings));

            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Configurações de segurança salvas!', {
                duration: 3000,
                icon: '🔒'
            });

            onClose();
        } catch (error) {
            toast.error('Erro ao salvar configurações');
        } finally {
            setIsSaving(false);
        }
    };

    const exportSecurityLogs = () => {
        const logs = {
            timestamp: new Date().toISOString(),
            user: user?.name || 'Usuário',
            settings: {
                passwordSettings,
                twoFactorSettings,
                sessionSettings,
                auditSettings,
                privacySettings
            }
        };

        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Log de segurança exportado!', {
            duration: 2000,
            icon: '📄'
        });
    };

    const tabs = [
        { id: 'password', label: 'Senha', icon: Key },
        { id: 'twofactor', label: '2FA', icon: Smartphone },
        { id: 'session', label: 'Sessão', icon: Clock },
        { id: 'audit', label: 'Auditoria', icon: FileText },
        { id: 'privacy', label: 'Privacidade', icon: Shield }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence key="security-settings-presence">
            <motion.div
                key="security-settings-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    key="security-settings-modal"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                    className="bg-gray-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gray-900 border-b border-gray-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Configurações de Segurança</h2>
                                    <p className="text-sm text-gray-400">Proteja sua conta e dados</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <motion.button
                                    onClick={exportSecurityLogs}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    title="Exportar logs"
                                >
                                    <Download className="w-5 h-5 text-gray-400" />
                                </motion.button>
                                <motion.button
                                    onClick={handleSaveAll}
                                    disabled={isSaving}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-red-500 disabled:cursor-not-allowed rounded-lg transition-colors"
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

                    {/* Tabs */}
                    <div className="bg-gray-800 border-b border-gray-700 px-6">
                        <div className="flex space-x-1">
                            {tabs.map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{tab.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <AnimatePresence mode="wait">
                            {/* Senha */}
                            {activeTab === 'password' && (
                                <motion.div
                                    key="password"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                            <Key className="w-5 h-5 mr-2 text-blue-400" />
                                            Alterar Senha
                                        </h3>

                                        <form onSubmit={(e) => { e.preventDefault(); handleSavePassword(); }}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Senha Atual
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords.current ? "text" : "password"}
                                                            value={passwordSettings.currentPassword}
                                                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                                            autoComplete="current-password"
                                                            className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('current')}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                                        >
                                                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Nova Senha
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords.new ? "text" : "password"}
                                                            value={passwordSettings.newPassword}
                                                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                                            autoComplete="new-password"
                                                            className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('new')}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                                        >
                                                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Confirmar Nova Senha
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords.confirm ? "text" : "password"}
                                                            value={passwordSettings.confirmPassword}
                                                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                                            autoComplete="new-password"
                                                            className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('confirm')}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                                        >
                                                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <motion.button
                                                        type="submit"
                                                        disabled={isSaving}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                                    >
                                                        {isSaving ? 'Salvando...' : 'Alterar Senha'}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Critérios de Senha */}
                                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                            <Settings className="w-5 h-5 mr-2 text-green-400" />
                                            Critérios de Segurança
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Comprimento Mínimo
                                                </label>
                                                <input
                                                    type="number"
                                                    min="6"
                                                    max="32"
                                                    value={passwordSettings.minLength}
                                                    onChange={(e) => handlePasswordChange('minLength', parseInt(e.target.value) || 8)}
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Histórico de Senhas
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    value={passwordSettings.passwordHistory}
                                                    onChange={(e) => handlePasswordChange('passwordHistory', parseInt(e.target.value) || 5)}
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                {[
                                                    { key: 'requireUppercase', label: 'Exigir maiúsculas' },
                                                    { key: 'requireLowercase', label: 'Exigir minúsculas' },
                                                    { key: 'requireNumbers', label: 'Exigir números' },
                                                    { key: 'requireSymbols', label: 'Exigir símbolos' }
                                                ].map((rule) => (
                                                    <div key={rule.key} className="flex items-center justify-between">
                                                        <span className="text-gray-300">{rule.label}</span>
                                                        <button
                                                            onClick={() => handlePasswordChange(rule.key, !passwordSettings[rule.key])}
                                                            className={`relative w-12 h-6 rounded-full transition-colors ${passwordSettings[rule.key] ? 'bg-blue-600' : 'bg-gray-600'
                                                                }`}
                                                        >
                                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${passwordSettings[rule.key] ? 'translate-x-7' : 'translate-x-1'
                                                                }`} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Botão OK para salvar configurações de senha */}
                                        <div className="flex justify-end mt-6">
                                            <motion.button
                                                onClick={handleSavePasswordSettings}
                                                disabled={isSaving}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                                            >
                                                {isSaving ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                                <span>{isSaving ? 'Salvando...' : 'OK'}</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Autenticação de Dois Fatores */}
                            {activeTab === 'twofactor' && (
                                <motion.div
                                    key="twofactor"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                            <Smartphone className="w-5 h-5 mr-2 text-purple-400" />
                                            Autenticação de Dois Fatores
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                                                <div>
                                                    <h4 className="text-white font-medium">Ativar 2FA</h4>
                                                    <p className="text-sm text-gray-400">Adicione uma camada extra de segurança</p>
                                                </div>
                                                <button
                                                    onClick={() => handleTwoFactorChange('enabled', !twoFactorSettings.enabled)}
                                                    className={`relative w-12 h-6 rounded-full transition-colors ${twoFactorSettings.enabled ? 'bg-purple-600' : 'bg-gray-600'
                                                        }`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${twoFactorSettings.enabled ? 'translate-x-7' : 'translate-x-1'
                                                        }`} />
                                                </button>
                                            </div>

                                            {twoFactorSettings.enabled && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="space-y-4"
                                                >
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Método de Autenticação
                                                        </label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {[
                                                                { value: 'email', label: 'E-mail', icon: Mail },
                                                                { value: 'sms', label: 'SMS', icon: Smartphone },
                                                                { value: 'authenticator', label: 'App', icon: Smartphone }
                                                            ].map((method) => (
                                                                <button
                                                                    key={method.value}
                                                                    onClick={() => handleTwoFactorChange('method', method.value)}
                                                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${twoFactorSettings.method === method.value
                                                                        ? 'bg-purple-600 text-white'
                                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                                        }`}
                                                                >
                                                                    <method.icon className="w-4 h-4" />
                                                                    <span className="text-sm">{method.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {twoFactorSettings.method === 'sms' && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                                Número de Telefone
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                value={twoFactorSettings.phoneNumber}
                                                                onChange={(e) => handleTwoFactorChange('phoneNumber', e.target.value)}
                                                                placeholder="(11) 99999-9999"
                                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center">
                                                        <button
                                                            onClick={generateBackupCodes}
                                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                                        >
                                                            Gerar Códigos de Backup
                                                        </button>
                                                        <span className="text-sm text-gray-400">
                                                            {twoFactorSettings.backupCodes.length} códigos disponíveis
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Botão OK para salvar configurações de 2FA */}
                                        <div className="flex justify-end mt-6">
                                            <motion.button
                                                onClick={handleSaveTwoFactorSettings}
                                                disabled={isSaving}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                                            >
                                                {isSaving ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                                <span>{isSaving ? 'Salvando...' : 'OK'}</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Sessão */}
                            {activeTab === 'session' && (
                                <motion.div
                                    key="session"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                            <Clock className="w-5 h-5 mr-2 text-orange-400" />
                                            Configurações de Sessão
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Timeout de Sessão (minutos)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="5"
                                                    max="480"
                                                    value={sessionSettings.timeoutMinutes}
                                                    onChange={(e) => handleSessionChange('timeoutMinutes', parseInt(e.target.value) || 15)}
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Sessões Simultâneas Máximas
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={sessionSettings.maxConcurrentSessions}
                                                    onChange={(e) => handleSessionChange('maxConcurrentSessions', parseInt(e.target.value) || 3)}
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                {[
                                                    { key: 'requireReauthForSensitive', label: 'Reautenticação para ações sensíveis' },
                                                    { key: 'logoutOnInactivity', label: 'Logout por inatividade' },
                                                    { key: 'rememberDevice', label: 'Lembrar dispositivo' }
                                                ].map((setting) => (
                                                    <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                                        <span className="text-gray-300">{setting.label}</span>
                                                        <button
                                                            onClick={() => handleSessionChange(setting.key, !sessionSettings[setting.key])}
                                                            className={`relative w-12 h-6 rounded-full transition-colors ${sessionSettings[setting.key] ? 'bg-orange-600' : 'bg-gray-600'
                                                                }`}
                                                        >
                                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${sessionSettings[setting.key] ? 'translate-x-7' : 'translate-x-1'
                                                                }`} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Botão OK para salvar configurações de sessão */}
                                        <div className="flex justify-end mt-6">
                                            <motion.button
                                                onClick={handleSaveSessionSettings}
                                                disabled={isSaving}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                                            >
                                                {isSaving ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                                <span>{isSaving ? 'Salvando...' : 'OK'}</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Auditoria */}
                            {activeTab === 'audit' && (
                                <motion.div
                                    key="audit"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-green-400" />
                                            Logs de Auditoria
                                        </h3>

                                        <div className="space-y-4">
                                            {[
                                                { key: 'logLoginAttempts', label: 'Registrar tentativas de login' },
                                                { key: 'logPasswordChanges', label: 'Registrar alterações de senha' },
                                                { key: 'logSecurityEvents', label: 'Registrar eventos de segurança' },
                                                { key: 'logDataAccess', label: 'Registrar acesso a dados' },
                                                { key: 'alertOnSuspiciousActivity', label: 'Alertar atividade suspeita' }
                                            ].map((setting) => (
                                                <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                                    <span className="text-gray-300">{setting.label}</span>
                                                    <button
                                                        onClick={() => handleAuditChange(setting.key, !auditSettings[setting.key])}
                                                        className={`relative w-12 h-6 rounded-full transition-colors ${auditSettings[setting.key] ? 'bg-green-600' : 'bg-gray-600'
                                                            }`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${auditSettings[setting.key] ? 'translate-x-7' : 'translate-x-1'
                                                            }`} />
                                                    </button>
                                                </div>
                                            ))}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Retenção de Logs (dias)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="30"
                                                    max="365"
                                                    value={auditSettings.retentionDays}
                                                    onChange={(e) => handleAuditChange('retentionDays', parseInt(e.target.value) || 90)}
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                            </div>

                                            {/* Botão OK para salvar configurações de auditoria */}
                                            <div className="flex justify-end mt-6">
                                                <motion.button
                                                    onClick={handleSaveAuditSettings}
                                                    disabled={isSaving}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                                                >
                                                    {isSaving ? (
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                    <span>{isSaving ? 'Salvando...' : 'OK'}</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Privacidade */}
                            {activeTab === 'privacy' && (
                                <motion.div
                                    key="privacy"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                            <Shield className="w-5 h-5 mr-2 text-blue-400" />
                                            Privacidade e Proteção de Dados
                                        </h3>

                                        <div className="space-y-4">
                                            {[
                                                { key: 'dataEncryption', label: 'Criptografia de dados', description: 'Criptografar dados sensíveis' },
                                                { key: 'anonymizeLogs', label: 'Anonimizar logs', description: 'Remover informações pessoais dos logs' },
                                                { key: 'shareAnalytics', label: 'Compartilhar analytics', description: 'Permitir uso de dados para melhorias' },
                                                { key: 'allowCookies', label: 'Permitir cookies', description: 'Usar cookies para funcionalidades' },
                                                { key: 'gdprCompliance', label: 'Conformidade GDPR', description: 'Aderir às regulamentações de privacidade' }
                                            ].map((setting) => (
                                                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                                                    <div>
                                                        <h4 className="text-white font-medium">{setting.label}</h4>
                                                        <p className="text-sm text-gray-400">{setting.description}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handlePrivacyChange(setting.key, !privacySettings[setting.key])}
                                                        className={`relative w-12 h-6 rounded-full transition-colors ${privacySettings[setting.key] ? 'bg-blue-600' : 'bg-gray-600'
                                                            }`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${privacySettings[setting.key] ? 'translate-x-7' : 'translate-x-1'
                                                            }`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Botão OK para salvar configurações de privacidade */}
                                        <div className="flex justify-end mt-6">
                                            <motion.button
                                                onClick={handleSavePrivacySettings}
                                                disabled={isSaving}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                                            >
                                                {isSaving ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                                <span>{isSaving ? 'Salvando...' : 'OK'}</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SecuritySettingsModal;
