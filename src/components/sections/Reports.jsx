import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    Download,
    Calendar,
    Filter,
    RefreshCw,
    Users,
    Clock,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts';

const Reports = () => {
    const [selectedChart, setSelectedChart] = useState('attendance');
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    // Dados mock para os gráficos
    const attendanceData = [
        { name: 'Jan', present: 95, absent: 5, late: 8 },
        { name: 'Fev', present: 92, absent: 8, late: 12 },
        { name: 'Mar', present: 98, absent: 2, late: 6 },
        { name: 'Abr', present: 94, absent: 6, late: 10 },
        { name: 'Mai', present: 96, absent: 4, late: 7 },
        { name: 'Jun', present: 97, absent: 3, late: 5 }
    ];

    const departmentData = [
        { name: 'TI', value: 35, color: '#3B82F6' },
        { name: 'RH', value: 25, color: '#10B981' },
        { name: 'Vendas', value: 20, color: '#F59E0B' },
        { name: 'Marketing', value: 15, color: '#EF4444' },
        { name: 'Financeiro', value: 5, color: '#8B5CF6' }
    ];

    const overtimeData = [
        { name: 'Semana 1', hours: 12 },
        { name: 'Semana 2', hours: 18 },
        { name: 'Semana 3', hours: 8 },
        { name: 'Semana 4', hours: 22 },
        { name: 'Semana 5', hours: 15 }
    ];

    const productivityData = [
        { name: 'Jan', productivity: 85 },
        { name: 'Fev', productivity: 88 },
        { name: 'Mar', productivity: 92 },
        { name: 'Abr', productivity: 89 },
        { name: 'Mai', productivity: 94 },
        { name: 'Jun', productivity: 96 }
    ];

    const chartTypes = [
        { id: 'attendance', label: 'Frequência', icon: Users },
        { id: 'departments', label: 'Departamentos', icon: PieChart },
        { id: 'overtime', label: 'Horas Extras', icon: Clock },
        { id: 'productivity', label: 'Produtividade', icon: TrendingUp }
    ];

    const renderChart = () => {
        switch (selectedChart) {
            case 'attendance':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="present" fill="#10B981" name="Presentes" />
                            <Bar dataKey="absent" fill="#EF4444" name="Faltas" />
                            <Bar dataKey="late" fill="#F59E0B" name="Atrasos" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'departments':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <RechartsPieChart>
                            <Pie
                                data={departmentData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {departmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                );

            case 'overtime':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={overtimeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="hours" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'productivity':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={productivityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="productivity" stroke="#3B82F6" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    const exportReport = () => {
        // Simular exportação
        console.log('Exportando relatório...');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Relatórios e Indicadores
                </h2>
                <div className="flex items-center space-x-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="week">Esta Semana</option>
                        <option value="month">Este Mês</option>
                        <option value="quarter">Este Trimestre</option>
                        <option value="year">Este Ano</option>
                    </select>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={exportReport}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Exportar</span>
                    </motion.button>
                </div>
            </div>

            {/* Indicadores Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Taxa de Frequência
                            </p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                                96%
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                +2% vs mês anterior
                            </p>
                        </div>
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Horas Extras Totais
                            </p>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                75h
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center mt-1">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                +12% vs mês anterior
                            </p>
                        </div>
                        <Clock className="w-12 h-12 text-purple-500" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Atrasos
                            </p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                                8
                            </p>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center mt-1">
                                <TrendingDown className="w-4 h-4 mr-1" />
                                -25% vs mês anterior
                            </p>
                        </div>
                        <AlertTriangle className="w-12 h-12 text-yellow-500" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Produtividade
                            </p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                94%
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                +5% vs mês anterior
                            </p>
                        </div>
                        <BarChart3 className="w-12 h-12 text-blue-500" />
                    </div>
                </motion.div>
            </div>

            {/* Seleção de Gráficos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Visualizações
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Botões de seleção de gráfico */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {chartTypes.map((chart) => (
                        <motion.button
                            key={chart.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedChart(chart.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${selectedChart === chart.id
                                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            <chart.icon className="w-4 h-4" />
                            <span className="font-medium">{chart.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Gráfico */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    {renderChart()}
                </div>
            </div>

            {/* Tabela de Resumo */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Resumo por Departamento
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Departamento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Funcionários
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Frequência
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Horas Extras
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Produtividade
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {departmentData.map((dept, index) => (
                                <motion.tr
                                    key={dept.name}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div
                                                className="w-4 h-4 rounded-full mr-3"
                                                style={{ backgroundColor: dept.color }}
                                            ></div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {dept.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {dept.value}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {Math.floor(Math.random() * 10) + 90}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {Math.floor(Math.random() * 20) + 5}h
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {Math.floor(Math.random() * 10) + 85}%
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
