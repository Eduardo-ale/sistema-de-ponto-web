import { useState, useEffect, useCallback } from 'react';
import userLogsService from '../services/userLogsService';

/**
 * Hook customizado para gerenciar logs de usuários
 * Inclui auto-refresh e integração com userLogsService
 */
export const useUserLogs = () => {
    const [emailLogs, setEmailLogs] = useState([]);
    const [creationLogs, setCreationLogs] = useState([]);
    const [deletionLogs, setDeletionLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    /**
     * Função para atualizar todos os logs
     */
    const refreshLogs = useCallback(async () => {
        setLoading(true);
        try {
            // Carregar todos os tipos de logs em paralelo
            const [emails, creations, deletions] = await Promise.all([
                userLogsService.getEmailLogs(),
                userLogsService.getCreationLogs(),
                userLogsService.getDeletionLogs()
            ]);

            setEmailLogs(emails);
            setCreationLogs(creations);
            setDeletionLogs(deletions);
        } catch (error) {
            console.error('Erro ao carregar logs:', error);
            // Em caso de erro, manter arrays vazios
            setEmailLogs([]);
            setCreationLogs([]);
            setDeletionLogs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Auto-refresh: atualiza logs a cada 30 segundos
     */
    useEffect(() => {
        // Carregar logs imediatamente ao montar o componente
        refreshLogs();

        // Configurar intervalo de auto-refresh
        const interval = setInterval(refreshLogs, 30000); // 30 segundos

        // Cleanup: remover intervalo ao desmontar
        return () => clearInterval(interval);
    }, [refreshLogs]);

    return {
        emailLogs,
        creationLogs,
        deletionLogs,
        loading,
        refreshLogs
    };
};


