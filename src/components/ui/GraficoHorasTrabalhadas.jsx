/**
 * Gráfico de linha temporal de horas trabalhadas
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { useHorasUsuario } from '../../hooks/useHorasCalculadas';
import { formatarHoras } from '../../utils/calculoHorasUtils';
import FiltroPeriodoGrafico from './FiltroPeriodoGrafico';

const GraficoHorasTrabalhadas = React.memo(({ usuarioId = null, periodo = 'semana' }) => {
    const [filtro, setFiltro] = useState({ periodo, dataInicio: null, dataFim: null, mesAno: null });

    // Memoizar dataReferencia para evitar recriação constante
    const dataReferencia = useMemo(() =>
        filtro.dataInicio ? new Date(filtro.dataInicio) : null,
        [filtro.dataInicio]
    );

    const { horas, loading } = useHorasUsuario(
        usuarioId,
        filtro.periodo,
        dataReferencia,
        filtro.dataFim || null,
        filtro.mesAno || null
    );

    // Memoizar dados do gráfico com comparação mais robusta
    const dadosGrafico = useMemo(() => {
        if (!horas || horas.length === 0) return [];

        const dados = horas
            .filter(calc => calc && calc.data && typeof calc.horasTrabalhadas === 'number')
            .map(calc => ({
                data: new Date(calc.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                horasTrabalhadas: calc.horasTrabalhadas || 0,
                jornadaContratual: calc.jornadaContratual || 0,
                horasExtras: calc.horasExtras?.total || 0
            }));

        return dados;
    }, [horas]);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (!loading && dadosGrafico.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center"
            >
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Horas Trabalhadas - {periodo === 'semana' ? 'Semana' : periodo === 'mes' ? 'Mês' : 'Período'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Nenhum dado disponível para o período selecionado</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Os dados aparecerão aqui quando houver marcações de ponto registradas
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Horas Trabalhadas - {filtro.periodo === 'semana' ? 'Semana' : filtro.periodo === 'mes' ? 'Mês' : 'Período'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Evolução das horas trabalhadas ao longo do período
                        </p>
                    </div>
                </div>
                <FiltroPeriodoGrafico
                    periodoPadrao={periodo}
                    onFiltroChange={setFiltro}
                />
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosGrafico} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="data"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Horas', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value, name) => [
                            `${formatarHoras(value)}`,
                            name === 'horasTrabalhadas' ? 'Horas Trabalhadas' :
                                name === 'jornadaContratual' ? 'Jornada Contratual' :
                                    'Horas Extras'
                        ]}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="horasTrabalhadas"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Horas Trabalhadas"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="jornadaContratual"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Jornada Contratual"
                        dot={{ r: 4 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="horasExtras"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="Horas Extras"
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    );
});

GraficoHorasTrabalhadas.displayName = 'GraficoHorasTrabalhadas';

export default GraficoHorasTrabalhadas;

