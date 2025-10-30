import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, X, User, Key, Mail, Send, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import emailService from '../../services/emailService';

const LoginGeneratedModal = ({ isOpen, onClose, userLogin, userName, userEmail, userPassword }) => {
    const [copied, setCopied] = useState(false);
    const [emailSending, setEmailSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState(null);

    // Envio automático de e-mail quando o modal abre
    useEffect(() => {
        if (isOpen && userEmail && userLogin && userPassword && !emailSent && !emailSending) {
            sendEmailAutomatically();
        }
    }, [isOpen, userEmail, userLogin, userPassword, emailSent, emailSending]);

    // Enviar e-mail automaticamente
    const sendEmailAutomatically = async () => {
        setEmailSending(true);
        setEmailError(null);

        try {
            const result = await emailService.sendLoginCredentials({
                nome: userName,
                email: userEmail,
                login: userLogin,
                senha: userPassword
            });

            if (result.success) {
                setEmailSent(true);
                toast.success('📧 E-mail enviado com sucesso para o colaborador!', {
                    duration: 4000,
                    icon: '📧'
                });
            } else {
                setEmailError(result.error);
                toast.error('❌ Erro ao enviar e-mail: ' + result.error);
            }
        } catch (error) {
            setEmailError(error.message);
            toast.error('❌ Erro ao enviar e-mail: ' + error.message);
        } finally {
            setEmailSending(false);
        }
    };

    // Enviar e-mail manualmente (botão)
    const sendEmailManually = async () => {
        await sendEmailAutomatically();
    };

    const copyLogin = async () => {
        try {
            await navigator.clipboard.writeText(userLogin);
            setCopied(true);
            toast.success('Login copiado para a área de transferência!', {
                duration: 2000,
                icon: '📋'
            });

            // Reset copied state after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Erro ao copiar login:', error);
            toast.error('Erro ao copiar login');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative text-center border border-gray-200 dark:border-gray-700"
                    initial={{ scale: 0.9, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -20 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Botão de fechar */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>

                    {/* Ícone de sucesso */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                        className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <CheckCircle className="text-green-600 dark:text-green-400 w-8 h-8" />
                    </motion.div>

                    {/* Título */}
                    <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                    >
                        Colaborador Criado com Sucesso!
                    </motion.h3>

                    {/* Nome do colaborador */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center justify-center space-x-2 mb-4"
                    >
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                            {userName}
                        </span>
                    </motion.div>

                    {/* Login de acesso */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-6"
                    >
                        <div className="flex items-center justify-center space-x-2 mb-3">
                            <Key className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Login de Acesso ao Sistema:
                            </span>
                        </div>

                        <div className="relative">
                            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                                <span className="text-gray-800 dark:text-gray-200 font-mono text-lg font-semibold select-all">
                                    {userLogin}
                                </span>
                                <motion.button
                                    onClick={copyLogin}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-2 rounded-lg transition-colors ${copied
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                                        }`}
                                    title={copied ? 'Copiado!' : 'Copiar login'}
                                >
                                    <Copy size={18} />
                                </motion.button>
                            </div>

                            {copied && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-green-600 dark:text-green-400 font-medium"
                                >
                                    ✓ Copiado!
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Status do E-mail */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className={`rounded-lg p-4 mb-6 ${emailSending
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                : emailSent
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                    : emailError
                                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                        : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            }`}
                    >
                        <div className="flex items-center space-x-2 mb-2">
                            {emailSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-spin" />
                                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                        Enviando e-mail...
                                    </span>
                                </>
                            ) : emailSent ? (
                                <>
                                    <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                        E-mail enviado com sucesso!
                                    </span>
                                </>
                            ) : emailError ? (
                                <>
                                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                                        Erro ao enviar e-mail
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        Enviando e-mail automaticamente...
                                    </span>
                                </>
                            )}
                        </div>

                        {emailSent && (
                            <p className="text-xs text-green-700 dark:text-green-400">
                                As credenciais foram enviadas para: <strong>{userEmail}</strong>
                            </p>
                        )}

                        {emailError && (
                            <div className="mt-2">
                                <p className="text-xs text-red-700 dark:text-red-400 mb-2">
                                    {emailError}
                                </p>
                                <motion.button
                                    onClick={sendEmailManually}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 px-3 py-1 rounded-lg transition-colors"
                                >
                                    Tentar Novamente
                                </motion.button>
                            </div>
                        )}
                    </motion.div>

                    {/* Instruções */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6"
                    >
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>Próximos passos:</strong>
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 mt-2 space-y-1 text-left">
                            <li>• O colaborador receberá as credenciais por e-mail</li>
                            <li>• O colaborador deve alterar a senha no primeiro acesso</li>
                            <li>• O login pode ser visualizado nos detalhes do usuário</li>
                            <li>• Em caso de problemas, reenvie o e-mail manualmente</li>
                        </ul>
                    </motion.div>

                    {/* Botão de fechar */}
                    <motion.button
                        onClick={onClose}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Entendi
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LoginGeneratedModal;
