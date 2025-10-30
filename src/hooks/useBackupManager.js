/**
 * Hook customizado para gerenciar backups
 */

import { useState, useEffect, useCallback } from 'react';
import backupService from '../services/backupService';
import { useAuth } from '../contexts/AuthContext';

export function useBackupManager() {
    const { user } = useAuth();
    const [backups, setBackups] = useState([]);
    const [configuracao, setConfiguracao] = useState(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    // Carregar backups
    const carregarBackups = useCallback(async (filtros = {}) => {
        try {
            setLoading(true);
            const dados = backupService.listarBackups(filtros);
            setBackups(dados);
        } catch (error) {
            console.error('Erro ao carregar backups:', error);
            setBackups([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar configuração
    const carregarConfiguracao = useCallback(async () => {
        try {
            const config = backupService.obterConfiguracao();
            setConfiguracao(config);
        } catch (error) {
            console.error('Erro ao carregar configuração:', error);
            setConfiguracao(null);
        }
    }, []);

    // Carregar logs
    const carregarLogs = useCallback(async () => {
        try {
            const logsBackup = JSON.parse(localStorage.getItem('logs_backup') || '[]');
            setLogs(logsBackup.slice(0, 100)); // Últimos 100
        } catch (error) {
            console.error('Erro ao carregar logs:', error);
            setLogs([]);
        }
    }, []);

    // Gerar backup manual
    const gerarBackup = useCallback(async (config, progressCallback) => {
        if (!user?.id) {
            throw new Error('Usuário não autenticado');
        }

        return await backupService.gerarBackupManual(
            config,
            user.id,
            user.name || user.nome || 'Administrador',
            progressCallback
        );
    }, [user]);

    // Restaurar backup
    const restaurarBackup = useCallback(async (backupId, confirmacaoSenha, progressCallback) => {
        if (!user?.id) {
            throw new Error('Usuário não autenticado');
        }

        return await backupService.restaurarBackup(
            backupId,
            confirmacaoSenha,
            user.id,
            user.name || user.nome || 'Administrador',
            progressCallback
        );
    }, [user]);

    // Salvar configuração
    const salvarConfiguracao = useCallback(async (config) => {
        if (!user?.id) {
            throw new Error('Usuário não autenticado');
        }

        const resultado = await backupService.salvarConfiguracao(
            config,
            user.id,
            user.name || user.nome || 'Administrador'
        );

        if (resultado.success) {
            await carregarConfiguracao();
        }

        return resultado;
    }, [user, carregarConfiguracao]);

    // Deletar backup
    const deletarBackup = useCallback(async (backupId) => {
        if (!user?.id) {
            throw new Error('Usuário não autenticado');
        }

        const resultado = await backupService.deletarBackup(
            backupId,
            user.id,
            user.name || user.nome || 'Administrador'
        );

        if (resultado.success) {
            await carregarBackups();
            await carregarLogs();
        }

        return resultado;
    }, [user, carregarBackups, carregarLogs]);

    // Baixar backup
    const baixarBackup = useCallback(async (backupId) => {
        return await backupService.baixarBackup(backupId);
    }, []);

    // Carregar inicialmente (sem dependências de callbacks para evitar loops)
    useEffect(() => {
        if (!user?.id) return;

        // Carregar dados apenas uma vez ao montar
        const carregarDados = async () => {
            try {
                setLoading(true);
                const dados = backupService.listarBackups({});
                setBackups(dados);

                const config = backupService.obterConfiguracao();
                setConfiguracao(config);

                const logsBackup = JSON.parse(localStorage.getItem('logs_backup') || '[]');
                setLogs(logsBackup.slice(0, 100));
            } catch (error) {
                console.error('Erro ao carregar dados de backup:', error);
            } finally {
                setLoading(false);
            }
        };

        carregarDados();
    }, [user?.id]); // Apenas user.id como dependência

    return {
        backups,
        configuracao,
        logs,
        loading,
        carregarBackups,
        gerarBackup,
        restaurarBackup,
        salvarConfiguracao,
        deletarBackup,
        baixarBackup,
        carregarLogs
    };
}

export default useBackupManager;

