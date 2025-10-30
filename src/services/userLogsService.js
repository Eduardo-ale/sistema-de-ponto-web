class LocalStorageService {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    }

    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
        }
    }
}

class UserLogsService {
    constructor() {
        this.CREATION_LOGS_KEY = 'userCreationLogs';
        this.DELETION_LOGS_KEY = 'userDeletionLogs';
    }

    saveCreationLog(userData, createdBy, createdByName, status = 'success') {
        try {
            const log = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                userId: userData.id,
                userName: userData.name,
                userEmail: userData.email,
                createdBy,
                createdByName,
                status
            };

            const logs = this.getCreationLogs();
            logs.push(log);
            LocalStorageService.save(this.CREATION_LOGS_KEY, logs);

            console.log('Log de criação registrado:', log.id);
            return { success: true, logId: log.id };
        } catch (error) {
            console.error('Erro ao registrar log de criação:', error);
            return { success: false, error: error.message };
        }
    }

    saveDeletionLog(userData, deletedBy, deletedByName, reason) {
        try {
            const log = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                userId: userData.id,
                userName: userData.name,
                userEmail: userData.email,
                deletedBy,
                deletedByName,
                reason,
                confirmed: true
            };

            const logs = this.getDeletionLogs();
            logs.push(log);
            LocalStorageService.save(this.DELETION_LOGS_KEY, logs);

            console.log('Log de exclusão registrado:', log.id);
            return { success: true, logId: log.id };
        } catch (error) {
            console.error('Erro ao registrar log de exclusão:', error);
            return { success: false, error: error.message };
        }
    }

    getCreationLogs() {
        try {
            return LocalStorageService.load(this.CREATION_LOGS_KEY) || [];
        } catch (error) {
            console.error('Erro ao carregar logs de criação:', error);
            return [];
        }
    }

    getDeletionLogs() {
        try {
            return LocalStorageService.load(this.DELETION_LOGS_KEY) || [];
        } catch (error) {
            console.error('Erro ao carregar logs de exclusão:', error);
            return [];
        }
    }

    getEmailLogs() {
        try {
            const advancedEmailService = require('./advancedEmailService').default;
            return advancedEmailService.getEmailLogs();
        } catch (error) {
            console.error('Erro ao carregar logs de email:', error);
            return [];
        }
    }

    initializeSampleData() {
        if (this.getCreationLogs().length === 0) {
            const sampleCreationLogs = [
                {
                    id: Date.now() - 1000000000,
                    timestamp: new Date(Date.now() - 1000000000).toISOString(),
                    userId: 1,
                    userName: 'Maria Silva',
                    userEmail: 'maria.silva@empresa.com',
                    createdBy: 'admin',
                    createdByName: 'Administrador',
                    status: 'success'
                },
                {
                    id: Date.now() - 800000000,
                    timestamp: new Date(Date.now() - 800000000).toISOString(),
                    userId: 2,
                    userName: 'João Santos',
                    userEmail: 'joao.santos@empresa.com',
                    createdBy: 'admin',
                    createdByName: 'Administrador',
                    status: 'success'
                }
            ];
            LocalStorageService.save(this.CREATION_LOGS_KEY, sampleCreationLogs);
            console.log('Dados de exemplo de logs de criação inicializados');
        }

        if (this.getDeletionLogs().length === 0) {
            const sampleDeletionLogs = [
                {
                    id: Date.now() - 2000000000,
                    timestamp: new Date(Date.now() - 2000000000).toISOString(),
                    userId: 999,
                    userName: 'Usuário Teste',
                    userEmail: 'teste@empresa.com',
                    deletedBy: 'admin',
                    deletedByName: 'Administrador',
                    reason: 'Usuário criado apenas para testes. Exclusão solicitada após validação.',
                    confirmed: true
                }
            ];
            LocalStorageService.save(this.DELETION_LOGS_KEY, sampleDeletionLogs);
            console.log('Dados de exemplo de logs de exclusão inicializados');
        }
    }

    clearAllLogs() {
        LocalStorageService.remove(this.CREATION_LOGS_KEY);
        LocalStorageService.remove(this.DELETION_LOGS_KEY);
        console.log('Todos os logs foram limpos');
    }
}

const userLogsService = new UserLogsService();
userLogsService.initializeSampleData();

export default userLogsService;


