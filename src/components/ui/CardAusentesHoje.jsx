import React from 'react';
import { motion } from 'framer-motion';
import { UserX, Users } from 'lucide-react';
import { useAbsencesData } from '../../hooks/useAbsencesData';

const CardAusentesHoje = () => {
    const { absencesToday, loading } = useAbsencesData();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-red-900/40 border border-red-700/30 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300"
        >
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-1">
                        Ausentes Hoje
                    </h3>
                    <p className="text-xs text-gray-400">
                        Em feriado, folga ou afastamento
                    </p>
                </div>
                <div className="p-3 bg-red-800/30 rounded-xl">
                    <UserX className="h-6 w-6 text-red-400" />
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-600 rounded w-16 mb-2"></div>
                            <div className="h-3 bg-gray-600 rounded w-24"></div>
                        </div>
                    ) : (
                        <>
                            <p className="text-3xl font-bold text-white mb-1">
                                {absencesToday}
                            </p>
                            <p className="text-xs text-gray-400">
                                {absencesToday === 1 ? 'colaborador' : 'colaboradores'}
                            </p>
                        </>
                    )}
                </div>

                <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Users className="h-3 w-3" />
                    <span>Total</span>
                </div>
            </div>

            {/* Indicador visual */}
            <div className="mt-4 flex items-center space-x-2">
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((absencesToday / 10) * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    />
                </div>
                <span className="text-xs text-gray-400">
                    {Math.min(absencesToday, 10)}/10
                </span>
            </div>
        </motion.div>
    );
};

export default CardAusentesHoje;
