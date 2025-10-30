import { useState, useEffect, useCallback } from 'react';

export const useAutoReportStatus = () => {
    const [status, setStatus] = useState({
        lastExecution: null,
        totalExecutions: 0,
        successRate: 0,
        lastStatus: 'never',
        loading: true
    });

    const [config, setConfig] = useState({
        schedule: '0 7 * * *',
        timezone: 'America/Campo_Grande',
        recipients: ['rh@saude.ms.gov.br', 'admin@core.ms.gov.br', 'ti@core.ms.gov.br'],
        emailFrom: 'core.ms.suporteti@gmail.com',
        nextExecution: null
    });

    // Função para buscar status (simulado)
    const fetchStatus = useCallback(async () => {
        try {
            // Simular dados do localStorage
            const storedStatus = localStorage.getItem('autoReportStatus');
            if (storedStatus) {
                const data = JSON.parse(storedStatus);
                setStatus(prev => ({
                    ...prev,
                    ...data,
                    loading: false
                }));
            } else {
                setStatus(prev => ({
                    ...prev,
                    loading: false
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar status dos relatórios:', error);
            setStatus(prev => ({
                ...prev,
                loading: false
            }));
        }
    }, []);

    // Função para buscar configurações (simulado)
    const fetchConfig = useCallback(async () => {
        try {
            const nextExecution = getNextExecutionTime();
            setConfig(prev => ({
                ...prev,
                nextExecution
            }));
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
        }
    }, []);

    // Função para executar relatório manualmente (simulado)
    const executeManualReport = useCallback(async () => {
        try {
            // Simular execução do relatório
            const startTime = new Date();

            // Simular delay de processamento
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Adicionar ao histórico
            const reportData = {
                tipoRelatorio: 'Relatório Semanal de Ausências',
                destinatarios: 'rh@saude.ms.gov.br, admin@core.ms.gov.br, ti@core.ms.gov.br',
                statusEnvio: 'Sucesso',
                caminhoPdf: `Relatorio_Ausencias_${startTime.toISOString().split('T')[0]}.pdf`,
                tamanhoArquivo: '2.5 MB'
            };

            // Salvar no histórico
            const existingHistory = JSON.parse(localStorage.getItem('reportHistory') || '[]');
            const newReport = {
                id: Date.now(),
                ...reportData,
                dataEnvio: startTime.toISOString(),
                observacao: 'Relatório executado manualmente'
            };

            const updatedHistory = [newReport, ...existingHistory];
            localStorage.setItem('reportHistory', JSON.stringify(updatedHistory));

            // Atualizar status
            const newStatus = {
                lastExecution: {
                    timestamp: startTime.toISOString(),
                    status: 'success',
                    fileName: reportData.caminhoPdf,
                    duration: '2000ms'
                },
                totalExecutions: (status.totalExecutions || 0) + 1,
                successRate: 100,
                lastStatus: 'success'
            };

            // Salvar no localStorage
            localStorage.setItem('autoReportStatus', JSON.stringify(newStatus));

            // Atualizar estado
            setStatus(prev => ({
                ...prev,
                ...newStatus,
                loading: false
            }));

            return { success: true, data: newStatus };

        } catch (error) {
            console.error('Erro ao executar relatório manual:', error);

            // Adicionar falha ao histórico
            const reportData = {
                tipoRelatorio: 'Relatório Semanal de Ausências',
                destinatarios: 'rh@saude.ms.gov.br, admin@core.ms.gov.br, ti@core.ms.gov.br',
                statusEnvio: 'Falha',
                caminhoPdf: `Relatorio_Ausencias_${new Date().toISOString().split('T')[0]}.pdf`,
                tamanhoArquivo: '0 MB',
                observacao: error.message
            };

            const existingHistory = JSON.parse(localStorage.getItem('reportHistory') || '[]');
            const newReport = {
                id: Date.now(),
                ...reportData,
                dataEnvio: new Date().toISOString()
            };

            const updatedHistory = [newReport, ...existingHistory];
            localStorage.setItem('reportHistory', JSON.stringify(updatedHistory));

            // Atualizar status com erro
            const errorStatus = {
                lastExecution: {
                    timestamp: new Date().toISOString(),
                    status: 'error',
                    error: error.message,
                    duration: '0ms'
                },
                totalExecutions: (status.totalExecutions || 0) + 1,
                successRate: status.totalExecutions > 0 ? Math.round(((status.totalExecutions - 1) / status.totalExecutions) * 100) : 0,
                lastStatus: 'error'
            };

            localStorage.setItem('autoReportStatus', JSON.stringify(errorStatus));
            setStatus(prev => ({
                ...prev,
                ...errorStatus,
                loading: false
            }));

            return { success: false, error: error.message };
        }
    }, [status.totalExecutions]);

    // Atualizar status automaticamente
    useEffect(() => {
        fetchStatus();
        fetchConfig();

        // Atualizar a cada 5 minutos
        const interval = setInterval(fetchStatus, 300000);

        return () => clearInterval(interval);
    }, [fetchStatus, fetchConfig]);

    // Função para formatar data/hora
    const formatDateTime = useCallback((timestamp) => {
        if (!timestamp) return 'Nunca executado';

        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    // Função para obter status visual
    const getStatusInfo = useCallback(() => {
        switch (status.lastStatus) {
            case 'success':
                return {
                    color: 'text-green-400',
                    bgColor: 'bg-green-500/20',
                    borderColor: 'border-green-500/30',
                    icon: '✅',
                    text: 'Última execução bem-sucedida'
                };
            case 'error':
                return {
                    color: 'text-red-400',
                    bgColor: 'bg-red-500/20',
                    borderColor: 'border-red-500/30',
                    icon: '❌',
                    text: 'Erro na última execução'
                };
            case 'never':
            default:
                return {
                    color: 'text-gray-400',
                    bgColor: 'bg-gray-500/20',
                    borderColor: 'border-gray-500/30',
                    icon: '⏳',
                    text: 'Ainda não executado'
                };
        }
    }, [status.lastStatus]);

    return {
        status,
        config,
        loading: status.loading,
        executeManualReport,
        formatDateTime,
        getStatusInfo,
        refreshStatus: fetchStatus
    };
};

// Função auxiliar para calcular próxima execução
function getNextExecutionTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0);

    return tomorrow.toISOString();
}
