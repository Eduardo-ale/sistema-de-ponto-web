import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    X,
    Copy,
    User,
    Key,
    Mail,
    Download,
    Share2
} from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPasswordSuccessModal = ({ isOpen, onClose, credentials }) => {
    const [copiedItems, setCopiedItems] = useState({
        login: false,
        password: false,
        both: false
    });

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedItems(prev => ({
                ...prev,
                [type]: true
            }));

            toast.success(`${type === 'both' ? 'Credenciais' : type === 'login' ? 'Login' : 'Senha'} copiado!`, {
                duration: 2000,
                icon: '📋'
            });

            // Resetar estado após 2 segundos
            setTimeout(() => {
                setCopiedItems(prev => ({
                    ...prev,
                    [type]: false
                }));
            }, 2000);
        } catch (error) {
            toast.error('Erro ao copiar para a área de transferência');
        }
    };

    const copyBothCredentials = () => {
        const text = `Login: ${credentials.login}\nSenha: ${credentials.novaSenha}`;
        copyToClipboard(text, 'both');
    };

    const downloadCredentials = () => {
        const content = `CREDENCIAIS DE ACESSO - ${credentials.user.name}
===============================================

Login: ${credentials.login}
Senha: ${credentials.novaSenha}
E-mail: ${credentials.user.email}
Data de Reset: ${new Date().toLocaleString()}

===============================================
Gerado automaticamente pelo sistema CORE RH
`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credenciais-${credentials.login}-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Credenciais salvas em arquivo!', {
            duration: 2000,
            icon: '💾'
        });
    };

    const shareCredentials = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Credenciais de Acesso - CORE RH',
                text: `Login: ${credentials.login}\nSenha: ${credentials.novaSenha}`,
            }).catch(() => {
                copyBothCredentials();
            });
        } else {
            copyBothCredentials();
        }
    };

    if (!isOpen || !credentials) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                    className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Sucesso!</h2>
                                    <p className="text-sm text-gray-500">Senha redefinida com sucesso</p>
                                </div>
                            </div>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Fechar"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Mensagem de sucesso */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                🎉 Parabéns!
                            </h3>
                            <p className="text-gray-600">
                                A senha foi alterada com sucesso para <strong>{credentials.user.name}</strong>
                            </p>
                        </motion.div>

                        {/* Informações do usuário */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Informações do Usuário
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Nome:</span>
                                    <span className="text-gray-900 font-medium">{credentials.user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">E-mail:</span>
                                    <span className="text-gray-900 font-medium">{credentials.user.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Cargo:</span>
                                    <span className="text-gray-900 font-medium">{credentials.user.position || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Credenciais */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                                <Key className="w-4 h-4 mr-2" />
                                Novas Credenciais de Acesso
                            </h4>

                            <div className="space-y-3">
                                {/* Login */}
                                <div>
                                    <label className="block text-xs font-medium text-blue-600 mb-1">
                                        Login
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 font-mono text-sm text-gray-900">
                                            {credentials.login}
                                        </div>
                                        <motion.button
                                            onClick={() => copyToClipboard(credentials.login, 'login')}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`p-2 rounded-lg transition-colors ${copiedItems.login
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                }`}
                                            title="Copiar login"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Senha */}
                                <div>
                                    <label className="block text-xs font-medium text-blue-600 mb-1">
                                        Nova Senha
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 font-mono text-sm text-gray-900">
                                            {credentials.novaSenha}
                                        </div>
                                        <motion.button
                                            onClick={() => copyToClipboard(credentials.novaSenha, 'password')}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`p-2 rounded-lg transition-colors ${copiedItems.password
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                }`}
                                            title="Copiar senha"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Aviso importante */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                        >
                            <div className="flex items-start space-x-2">
                                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-white">!</span>
                                </div>
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium mb-1">Importante:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• O usuário deve alterar esta senha no primeiro acesso</li>
                                        <li>• As credenciais são válidas por 24 horas</li>
                                        <li>• Recomende que o usuário salve as informações em local seguro</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* Botões de ação */}
                        <div className="space-y-3">
                            <motion.button
                                onClick={copyBothCredentials}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${copiedItems.both
                                        ? 'bg-green-600 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                <Copy className="w-4 h-4" />
                                <span>{copiedItems.both ? 'Copiado!' : 'Copiar Login e Senha'}</span>
                            </motion.button>

                            <div className="flex space-x-2">
                                <motion.button
                                    onClick={downloadCredentials}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="text-sm">Salvar</span>
                                </motion.button>

                                <motion.button
                                    onClick={shareCredentials}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-sm">Compartilhar</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Botão fechar */}
                        <motion.button
                            onClick={onClose}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Fechar
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ResetPasswordSuccessModal;
