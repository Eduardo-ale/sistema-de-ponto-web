import React from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Key,
    Smartphone,
    Clock,
    FileText,
    Database
} from 'lucide-react';

const SecurityStatusCard = ({ className = "" }) => {
    // Simular dados de status de segurança
    const securityStatus = {
        password: {
            status: 'strong',
            lastChanged: '2024-01-15',
            score: 95
        },
        twoFactor: {
            enabled: true,
            method: 'email',
            lastUsed: '2024-01-20'
        },
        session: {
            active: true,
            timeout: 15,
            lastActivity: '2024-01-20T10:30:00Z'
        },
        audit: {
            logsEnabled: true,
            lastEvent: '2024-01-20T10:25:00Z',
            totalEvents: 1247
        },
        privacy: {
            encryption: true,
            gdprCompliant: true,
            dataRetention: 90
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'strong':
            case true:
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'medium':
                return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
            case 'weak':
            case false:
                return <XCircle className="w-4 h-4 text-red-400" />;
            default:
                return <Shield className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'strong':
            case true:
                return 'text-green-400';
            case 'medium':
                return 'text-yellow-400';
            case 'weak':
            case false:
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const securityItems = [
        {
            icon: Key,
            label: 'Senha',
            status: securityStatus.password.status,
            details: `Última alteração: ${new Date(securityStatus.password.lastChanged).toLocaleDateString()}`,
            score: securityStatus.password.score
        },
        {
            icon: Smartphone,
            label: '2FA',
            status: securityStatus.twoFactor.enabled,
            details: `Método: ${securityStatus.twoFactor.method.toUpperCase()}`,
            score: securityStatus.twoFactor.enabled ? 100 : 0
        },
        {
            icon: Clock,
            label: 'Sessão',
            status: securityStatus.session.active,
            details: `Timeout: ${securityStatus.session.timeout}min`,
            score: securityStatus.session.active ? 90 : 0
        },
        {
            icon: FileText,
            label: 'Auditoria',
            status: securityStatus.audit.logsEnabled,
            details: `${securityStatus.audit.totalEvents} eventos`,
            score: securityStatus.audit.logsEnabled ? 85 : 0
        },
        {
            icon: Database,
            label: 'Privacidade',
            status: securityStatus.privacy.encryption,
            details: `GDPR: ${securityStatus.privacy.gdprCompliant ? 'Sim' : 'Não'}`,
            score: securityStatus.privacy.encryption ? 95 : 0
        }
    ];

    const overallScore = Math.round(
        securityItems.reduce((sum, item) => sum + item.score, 0) / securityItems.length
    );

    const getOverallStatus = (score) => {
        if (score >= 90) return { status: 'strong', color: 'text-green-400', label: 'Excelente' };
        if (score >= 70) return { status: 'medium', color: 'text-yellow-400', label: 'Bom' };
        return { status: 'weak', color: 'text-red-400', label: 'Precisa Melhorar' };
    };

    const overallStatus = getOverallStatus(overallScore);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gray-800/50 rounded-lg p-6 border border-gray-700 ${className}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Status de Segurança</h3>
                        <p className="text-sm text-gray-400">Monitoramento em tempo real</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-bold ${overallStatus.color}`}>
                        {overallScore}%
                    </div>
                    <div className={`text-sm ${overallStatus.color}`}>
                        {overallStatus.label}
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {securityItems.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <item.icon className="w-4 h-4 text-gray-400" />
                            <div>
                                <div className="text-white font-medium">{item.label}</div>
                                <div className="text-xs text-gray-400">{item.details}</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(item.status)}
                            <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                                {item.score}%
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Barra de Progresso Geral */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Segurança Geral</span>
                    <span className={`text-sm font-medium ${overallStatus.color}`}>
                        {overallScore}%
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${overallScore}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-2 rounded-full ${overallScore >= 90 ? 'bg-green-500' :
                                overallScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                    />
                </div>
            </div>

            {/* Recomendações */}
            {overallScore < 90 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg"
                >
                    <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-300">Recomendações</span>
                    </div>
                    <ul className="text-xs text-yellow-200 space-y-1">
                        {overallScore < 70 && <li>• Ative a autenticação de dois fatores</li>}
                        {overallScore < 80 && <li>• Fortaleça sua senha com símbolos</li>}
                        {overallScore < 90 && <li>• Configure logs de auditoria</li>}
                        <li>• Revise suas configurações de privacidade</li>
                    </ul>
                </motion.div>
            )}
        </motion.div>
    );
};

export default SecurityStatusCard;
