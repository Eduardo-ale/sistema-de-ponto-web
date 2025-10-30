/**
 * Gráfico de área do saldo do banco de horas
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Banknote, Calendar } from 'lucide-react';
import { useHorasUsuario } from '../../hooks/useHorasCalculadas';
import { formatarHoras } from '../../utils/calculoHorasUtils';
import FiltroPeriodoGrafico from './FiltroPeriodoGrafico';

const GraficoBancoHoras = React.memo(({ usuarioId = null, periodo = 'mes' }) => {
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
            .filter(calc => calc && calc.data && calc.bancoHoras && typeof calc.bancoHoras.saldo === 'number')
            .map(calc => ({
                data: new Date(calc.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                saldo: calc.bancoHoras?.saldo || 0,
                positivo: calc.bancoHoras?.positivo || 0,
                negativo: -(calc.bancoHoras?.negativo || 0)
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
                <Banknote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Banco de Horas - {periodo === 'semana' ? 'Semana' : periodo === 'mes' ? 'Mês' : 'Período'}
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
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Banknote className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Banco de Horas - {filtro.periodo === 'semana' ? 'Semana' : filtro.periodo === 'mes' ? 'Mês' : 'Período'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Evolução do saldo acumulado
                        </p>
                    </div>
                </div>
                <FiltroPeriodoGrafico
                    periodoPadrao={periodo}
                    onFiltroChange={setFiltro}
                />
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosGrafico} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPositivo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNegativo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
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
                            `${formatarHoras(Math.abs(value))}`,
                            name === 'saldo' ? 'Saldo' :
                                name === 'positivo' ? 'Acúmulo Positivo' :
                                    'Acúmulo Negativo'
                        ]}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="saldo"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSaldo)"
                        name="Saldo"
                    />
                    <Area
                        type="monotone"
                        dataKey="positivo"
                        stroke="#10b981"
                        strokeWidth={1}
                        fillOpacity={0.3}
                        fill="url(#colorPositivo)"
                        name="Acúmulo Positivo"
                    />
                    <Area
                        type="monotone"
                        dataKey="negativo"
                        stroke="#ef4444"
                        strokeWidth={1}
                        fillOpacity={0.3}
                        fill="url(#colorNegativo)"
                        name="Acúmulo Negativo"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
});

GraficoBancoHoras.displayName = 'GraficoBancoHoras';

export default GraficoBancoHoras;

