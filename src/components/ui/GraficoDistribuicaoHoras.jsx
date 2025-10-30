/**
 * Gráfico de pizza com distribuição de tipos de horas
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { PieChartIcon, Calendar } from 'lucide-react';
import { useHorasUsuario } from '../../hooks/useHorasCalculadas';
import { formatarHoras } from '../../utils/calculoHorasUtils';
import FiltroPeriodoGrafico from './FiltroPeriodoGrafico';

const COLORS = {
    normal: '#3b82f6',
    extraDiurna: '#10b981',
    extraNoturna: '#f59e0b',
    extraFeriado: '#ef4444'
};

const GraficoDistribuicaoHoras = React.memo(({ usuarioId = null, periodo = 'mes' }) => {
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

    // Memoizar cálculos e dados do gráfico para evitar recriação constante
    const { totais, dadosGrafico, total } = useMemo(() => {
        // Calcular totais por tipo (filtrar cálculos válidos primeiro)
        const calculosValidos = horas.filter(calc =>
            calc &&
            typeof calc.horasTrabalhadas === 'number' &&
            calc.horasExtras &&
            calc.bancoHoras
        );

        const totais = calculosValidos.reduce((acc, calc) => {
            const jornada = calc.jornadaContratual || 0;
            const horasNormais = Math.min(calc.horasTrabalhadas || 0, jornada);

            acc.normal += horasNormais;
            acc.extraDiurna += calc.horasExtras?.diurnas || 0;
            acc.extraNoturna += calc.horasExtras?.noturnas || 0;
            acc.extraFeriado += calc.horasExtras?.feriado || 0;

            return acc;
        }, {
            normal: 0,
            extraDiurna: 0,
            extraNoturna: 0,
            extraFeriado: 0
        });

        const dadosGrafico = [
            {
                name: 'Horas Normais',
                value: Number(totais.normal.toFixed(2)),
                color: COLORS.normal
            },
            {
                name: 'Extra Diurna',
                value: Number(totais.extraDiurna.toFixed(2)),
                color: COLORS.extraDiurna
            },
            {
                name: 'Extra Noturna',
                value: Number(totais.extraNoturna.toFixed(2)),
                color: COLORS.extraNoturna
            },
            {
                name: 'Extra Feriado',
                value: Number(totais.extraFeriado.toFixed(2)),
                color: COLORS.extraFeriado
            }
        ].filter(item => item.value > 0);

        const total = dadosGrafico.reduce((sum, item) => sum + item.value, 0);

        return { totais, dadosGrafico, total };
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
                <PieChartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Distribuição de Horas - {periodo === 'semana' ? 'Semana' : periodo === 'mes' ? 'Mês' : 'Período'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Nenhum dado disponível para o período selecionado</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Os dados aparecerão aqui quando houver marcações de ponto registradas
                </p>
            </motion.div>
        );
    }

    // Custom Tooltip com melhor contraste e legibilidade (total já vem do useMemo)
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center space-x-2 mb-1">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: data.payload.color }}
                        />
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {data.name}
                        </p>
                    </div>
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                        {formatarHoras(data.value)}
                    </p>
                    {data.payload && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {((data.value / total) * 100).toFixed(1)}% do total
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <PieChartIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Distribuição de Horas - {filtro.periodo === 'semana' ? 'Semana' : filtro.periodo === 'mes' ? 'Mês' : 'Período'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total: {formatarHoras(total)}
                        </p>
                    </div>
                </div>
                <FiltroPeriodoGrafico
                    periodoPadrao={periodo}
                    onFiltroChange={setFiltro}
                />
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={dadosGrafico}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {dadosGrafico.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-2 gap-2">
                {dadosGrafico.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.name}: {formatarHoras(item.value)}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
});

GraficoDistribuicaoHoras.displayName = 'GraficoDistribuicaoHoras';

export default GraficoDistribuicaoHoras;

