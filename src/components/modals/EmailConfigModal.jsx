import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Settings,
    Save,
    X,
    Server,
    User,
    Lock,
    TestTube,
    CheckCircle,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmailConfigModal = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState({
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: '',
        smtpPassword: '',
        fromEmail: '',
        fromName: 'Sistema de Ponto',
        enableSSL: true,
        enableTLS: true
    });

    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        try {
            // Simular teste de conexão
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.success('Conexão SMTP testada com sucesso!', {
                icon: '✅',
                style: {
                    background: '#10B981',
                    color: '#fff'
                }
            });
        } catch (error) {
            toast.error('Erro ao testar conexão SMTP', {
                icon: '❌',
                style: {
                    background: '#EF4444',
                    color: '#fff'
                }
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveConfig = async () => {
        setIsSaving(true);
        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success('Configurações de e-mail salvas com sucesso!', {
                icon: '✅',
                style: {
                    background: '#10B981',
                    color: '#fff'
                }
            });

            onClose();
        } catch (error) {
            toast.error('Erro ao salvar configurações', {
                icon: '❌',
                style: {
                    background: '#EF4444',
                    color: '#fff'
                }
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-600/20 rounded-lg">
                                <Mail className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Configurações de E-mail
                                </h2>
                                <p className="text-sm text-gray-400">
                                    Configure o servidor SMTP para envio de e-mails
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400 hover:text-white" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        <div className="space-y-6">
                            {/* Servidor SMTP */}
                            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Server className="w-5 h-5 text-blue-400" />
                                    <h3 className="text-lg font-semibold text-white">Servidor SMTP</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Host SMTP
                                        </label>
                                        <input
                                            type="text"
                                            value={config.smtpHost}
                                            onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                            placeholder="smtp.gmail.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Porta
                                        </label>
                                        <input
                                            type="text"
                                            value={config.smtpPort}
                                            onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                            placeholder="587"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Credenciais */}
                            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center space-x-2 mb-4">
                                    <User className="w-5 h-5 text-green-400" />
                                    <h3 className="text-lg font-semibold text-white">Credenciais</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Usuário/E-mail
                                        </label>
                                        <input
                                            type="email"
                                            value={config.smtpUser}
                                            onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                            placeholder="seu-email@gmail.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Senha
                                        </label>
                                        <input
                                            type="password"
                                            value={config.smtpPassword}
                                            onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                            placeholder="Sua senha de aplicativo"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Remetente */}
                            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Mail className="w-5 h-5 text-purple-400" />
                                    <h3 className="text-lg font-semibold text-white">Remetente</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            E-mail de Envio
                                        </label>
                                        <input
                                            type="email"
                                            value={config.fromEmail}
                                            onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                            placeholder="noreply@sistema.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nome do Remetente
                                        </label>
                                        <input
                                            type="text"
                                            value={config.fromName}
                                            onChange={(e) => handleInputChange('fromName', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                            placeholder="Sistema de Ponto"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Configurações de Segurança */}
                            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Lock className="w-5 h-5 text-yellow-400" />
                                    <h3 className="text-lg font-semibold text-white">Segurança</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-300">
                                                Habilitar SSL
                                            </label>
                                            <p className="text-xs text-gray-400">
                                                Recomendado para maior segurança
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('enableSSL', !config.enableSSL)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.enableSSL ? 'bg-blue-600' : 'bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.enableSSL ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-300">
                                                Habilitar TLS
                                            </label>
                                            <p className="text-xs text-gray-400">
                                                Transport Layer Security
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('enableTLS', !config.enableTLS)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.enableTLS ? 'bg-blue-600' : 'bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.enableTLS ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Teste de Conexão */}
                            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center space-x-2 mb-4">
                                    <TestTube className="w-5 h-5 text-orange-400" />
                                    <h3 className="text-lg font-semibold text-white">Teste de Conexão</h3>
                                </div>

                                <p className="text-sm text-gray-400 mb-4">
                                    Teste a conexão com o servidor SMTP antes de salvar as configurações.
                                </p>

                                <button
                                    onClick={handleTestConnection}
                                    disabled={isTesting || !config.smtpHost || !config.smtpUser}
                                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    {isTesting ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <TestTube className="w-4 h-4" />
                                    )}
                                    <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700 bg-gray-800/50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveConfig}
                            disabled={isSaving}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                            {isSaving ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EmailConfigModal;