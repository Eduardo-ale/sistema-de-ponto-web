import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

const ConfirmActionModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    confirmColor = 'red',
    icon: Icon = AlertCircle,
    loading = false
}) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } finally {
            setIsLoading(false);
        }
    };

    const getColorClasses = () => {
        switch (confirmColor) {
            case 'red':
                return {
                    bg: 'bg-red-600 hover:bg-red-700',
                    icon: 'text-red-600',
                    bgIcon: 'bg-red-100 dark:bg-red-900/20'
                };
            case 'green':
                return {
                    bg: 'bg-green-600 hover:bg-green-700',
                    icon: 'text-green-600',
                    bgIcon: 'bg-green-100 dark:bg-green-900/20'
                };
            case 'blue':
                return {
                    bg: 'bg-blue-600 hover:bg-blue-700',
                    icon: 'text-blue-600',
                    bgIcon: 'bg-blue-100 dark:bg-blue-900/20'
                };
            default:
                return {
                    bg: 'bg-gray-600 hover:bg-gray-700',
                    icon: 'text-gray-600',
                    bgIcon: 'bg-gray-100 dark:bg-gray-900/20'
                };
        }
    };

    const colors = getColorClasses();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700">
                        <h3 className="text-xl font-semibold text-white">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                            disabled={isLoading || loading}
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${colors.bgIcon}`}>
                                <Icon className={`w-6 h-6 ${colors.icon}`} />
                            </div>
                            <div className="flex-1">
                                <div className="text-gray-300 leading-relaxed">
                                    {typeof message === 'string' ? (
                                        <p>{message}</p>
                                    ) : (
                                        message
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
                        <button
                            onClick={onClose}
                            disabled={isLoading || loading}
                            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading || loading}
                            className={`px-4 py-2 text-sm font-medium text-white ${colors.bg} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
                        >
                            {(isLoading || loading) && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            <span>{confirmText}</span>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ConfirmActionModal;


