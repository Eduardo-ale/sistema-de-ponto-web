/**
 * Cards de horas para o Dashboard
 */

import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Banknote,
    AlertTriangle
} from 'lucide-react';
import { formatarHoras } from '../../utils/calculoHorasUtils';
import { useTotaisHoras } from '../../hooks/useHorasCalculadas';
import limitesExtrasService from '../../services/limitesExtrasService';

const HorasCards = React.memo(({ periodo = 'mes', delay = 0 }) => {
    const { totais, loading } = useTotaisHoras(periodo);
    const [avisosLimites, setAvisosLimites] = useState([]);

    // Verificar limites mensais
    useEffect(() => {
        const verificarLimites = async () => {
            try {
                const limites = await limitesExtrasService.getAllLimites();
                const hoje = new Date();
                const mes = hoje.getMonth() + 1;
                const ano = hoje.getFullYear();

                // Para cada limite configurado, verificar se está próximo ou excedido
                const avisos = await Promise.all(
                    limites.map(async (limite) => {
                        // Buscar horas extras mensais de todos os usuários do departamento (simplificado)
                        // Em produção, isso seria calculado por departamento
                        const horasExtrasMensais = totais.totalExtras; // Simplificação - considerar total geral

                        if (limite.limiteMensal > 0) {
                            const percentual = (horasExtrasMensais / limite.limiteMensal) * 100;
                            if (percentual >= 100) {
                                return {
                                    departamento: limite.departamento,
                                    tipo: 'excedido',
                                    mensagem: `Limite mensal excedido no departamento ${limite.departamento}`
                                };
                            } else if (percentual >= 80) {
                                return {
                                    departamento: limite.departamento,
                                    tipo: 'proximo',
                                    mensagem: `Limite mensal próximo (${percentual.toFixed(0)}%) no departamento ${limite.departamento}`
                                };
                            }
                        }
                        return null;
                    })
                );

                setAvisosLimites(avisos.filter(a => a !== null));
            } catch (error) {
                console.error('Erro ao verificar limites:', error);
            }
        };

        if (!loading && totais.totalExtras > 0) {
            verificarLimites();
        }
    }, [totais.totalExtras, loading]);

    // Memoizar cards para evitar recriação
    const cards = useMemo(() => [
        {
            id: 'total-horas',
            title: 'Total de Horas Trabalhadas',
            value: formatarHoras(totais.totalHoras),
            change: null,
            icon: Clock,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600'
        },
        {
            id: 'horas-extras',
            title: 'Horas Extras',
            value: formatarHoras(totais.totalExtras),
            change: null,
            icon: TrendingUp,
            color: 'green',
            bgGradient: 'from-green-500 to-green-600'
        },
        {
            id: 'banco-horas',
            title: 'Saldo Banco de Horas',
            value: formatarHoras(Math.abs(totais.bancoHoras.saldo)),
            change: totais.bancoHoras.saldo > 0 ? 'positive' : totais.bancoHoras.saldo < 0 ? 'negative' : null,
            icon: Banknote,
            color: totais.bancoHoras.saldo >= 0 ? 'purple' : 'orange',
            bgGradient: totais.bancoHoras.saldo >= 0 ? 'from-purple-500 to-purple-600' : 'from-orange-500 to-orange-600'
        },
        {
            id: 'horas-faltantes',
            title: 'Atrasos e Faltas',
            value: `${totais.totalAtrasos} ocorrências`,
            change: null,
            icon: AlertCircle,
            color: 'red',
            bgGradient: 'from-red-500 to-red-600'
        }
    ], [totais]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
                const IconComponent = card.icon;
                const isPositive = card.change === 'positive';
                const isNegative = card.change === 'negative';

                return (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: delay + index * 0.1, duration: 0.3 }}
                        className={`bg-gradient-to-br ${card.bgGradient} rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-white`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <IconComponent className="w-6 h-6" />
                            </div>
                            {card.change && (
                                <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-100' : 'text-red-100'}`}>
                                    {isPositive ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-white/90 uppercase tracking-wide">
                                {card.title}
                            </h3>
                            <p className="text-2xl font-bold text-white">
                                {card.value}
                            </p>

                            {/* Aviso de limite para horas extras */}
                            {card.id === 'horas-extras' && avisosLimites.length > 0 && (
                                <div className="mt-2 flex items-center space-x-1 text-xs">
                                    <AlertTriangle className="w-3 h-3 text-yellow-300" />
                                    <span className="text-yellow-200">
                                        {avisosLimites[0].tipo === 'excedido' ? 'Limite excedido' : 'Limite próximo'}
                                    </span>
                                </div>
                            )}

                            {card.id === 'banco-horas' && (
                                <div className="mt-2 text-xs text-white/80">
                                    {totais.bancoHoras.saldo >= 0 ? (
                                        <span className="flex items-center space-x-1">
                                            <TrendingUp className="w-3 h-3" />
                                            <span>Saldo positivo</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-1">
                                            <TrendingDown className="w-3 h-3" />
                                            <span>Saldo negativo</span>
                                        </span>
                                    )}
                                </div>
                            )}

                            {card.id === 'banco-horas' && (
                                <div className="mt-1 text-xs text-white/70">
                                    Positivo: {formatarHoras(totais.bancoHoras.positivo)} |
                                    Negativo: {formatarHoras(totais.bancoHoras.negativo)}
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
});

HorasCards.displayName = 'HorasCards';

export default HorasCards;

