import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    LogOut,
    Calendar,
    TrendingUp,
    User,
    CheckCircle,
    AlertCircle,
    Play,
    Pause,
    Coffee
} from 'lucide-react';

const UserDashboard = () => {
    const [isWorking, setIsWorking] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Atualizar horário a cada segundo
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handlePunchIn = () => {
        setIsWorking(true);
        // Aqui seria feita a chamada para a API
    };

    const handlePunchOut = () => {
        setIsWorking(false);
        // Aqui seria feita a chamada para a API
    };

    const todayStats = [
        { label: 'Entrada', value: '08:00', status: 'success' },
        { label: 'Saída Almoço', value: '12:00', status: 'success' },
        { label: 'Retorno Almoço', value: '13:00', status: 'success' },
        { label: 'Saída', value: '--:--', status: 'pending' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Meu Ponto
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Controle sua jornada de trabalho
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    João Silva
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Colaborador
                                </p>
                            </div>
                            <button className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Relógio Principal */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8"
                >
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            {formatDate(currentTime)}
                        </h2>
                        <div className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            {formatTime(currentTime)}
                        </div>

                        {/* Botão de Ponto */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={isWorking ? handlePunchOut : handlePunchIn}
                            className={`px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 ${isWorking
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-green-500 hover:bg-green-600'
                                }`}
                        >
                            {isWorking ? (
                                <>
                                    <Pause className="w-6 h-6 inline mr-2" />
                                    Registrar Saída
                                </>
                            ) : (
                                <>
                                    <Play className="w-6 h-6 inline mr-2" />
                                    Registrar Entrada
                                </>
                            )}
                        </motion.button>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                            {isWorking ? 'Você está trabalhando' : 'Você não está trabalhando'}
                        </p>
                    </div>
                </motion.div>

                {/* Grid de Informações */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Status do Dia */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Status do Dia
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {todayStats.map((stat, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {stat.label}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {stat.value}
                                            </span>
                                            {stat.status === 'success' ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Resumo da Semana */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Resumo da Semana
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Horas Trabalhadas</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">32h 15min</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Horas Extras</span>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">2h 30min</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Faltas</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Atrasos</span>
                                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">1</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Próximos Eventos */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Próximos Eventos
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Reunião de Equipe
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Amanhã às 14:00
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Coffee className="w-5 h-5 text-orange-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Pausa para Café
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Em 30 minutos
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Avaliação Mensal
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Próxima semana
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;






