/**
 * Serviço para gerenciar histórico de senhas
 * Simula funcionalidade de backend usando localStorage
 */
class PasswordHistoryService {
    constructor() {
        this.STORAGE_KEY = 'passwordHistory';
        this.MAX_HISTORY = 2; // Manter apenas as 2 últimas senhas
    }

    /**
     * Simula hash de senha usando uma função simples
     * Em produção, usar bcrypt ou similar
     */
    hashPassword(password) {
        // Simulação mais consistente de hash - em produção usar bcrypt
        // Usar um salt fixo para simulação (em produção seria único por senha)
        const salt = 'core_rh_salt_2024';
        return btoa(password + salt).slice(0, 50);
    }

    /**
     * Verifica se uma senha corresponde ao hash
     */
    verifyPassword(password, hash) {
        try {
            // Simulação mais robusta de verificação de hash
            const passwordHash = this.hashPassword(password);
            console.log('🔍 Verificando senha:', password, 'Hash:', passwordHash, 'Hash armazenado:', hash);

            // Verificar se os hashes são iguais
            const isMatch = passwordHash === hash;
            console.log('🔍 Senha corresponde:', isMatch);

            return isMatch;
        } catch (error) {
            console.error('Erro ao verificar senha:', error);
            return false;
        }
    }

    /**
     * Obtém histórico de senhas de um usuário
     */
    getUserPasswordHistory(userId) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            return allHistory[userId] || [];
        } catch (error) {
            console.error('Erro ao carregar histórico de senhas:', error);
            return [];
        }
    }

    /**
     * Adiciona uma nova senha ao histórico
     */
    addPasswordToHistory(userId, password) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            const userHistory = allHistory[userId] || [];

            // Criar entrada para a nova senha
            const newEntry = {
                id: Date.now(),
                passwordHash: this.hashPassword(password),
                createdAt: new Date().toISOString(),
                userId: userId
            };

            // Adicionar ao histórico
            userHistory.unshift(newEntry);

            // Manter apenas as últimas MAX_HISTORY senhas
            if (userHistory.length > this.MAX_HISTORY) {
                userHistory.splice(this.MAX_HISTORY);
            }

            // Salvar no localStorage
            allHistory[userId] = userHistory;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allHistory));

            console.log(`✅ Senha adicionada ao histórico do usuário ${userId}`);
            return true;
        } catch (error) {
            console.error('Erro ao adicionar senha ao histórico:', error);
            return false;
        }
    }

    /**
     * Verifica se uma senha já foi usada recentemente
     */
    isPasswordRecentlyUsed(userId, password) {
        try {
            console.log('🔍 Verificando senha recente para usuário:', userId, 'Senha:', password);
            const userHistory = this.getUserPasswordHistory(userId);
            console.log('🔍 Histórico do usuário:', userHistory);

            // Verificar se a senha corresponde a alguma das últimas senhas
            for (const entry of userHistory) {
                console.log('🔍 Verificando entrada:', entry);
                const isMatch = this.verifyPassword(password, entry.passwordHash);
                if (isMatch) {
                    console.log('🔍 SENHA ENCONTRADA NO HISTÓRICO!');
                    return {
                        isUsed: true,
                        usedAt: entry.createdAt,
                        message: 'Esta senha não é permitida, pois já foi utilizada recentemente.'
                    };
                }
            }

            console.log('🔍 Senha não encontrada no histórico - OK para usar');
            return {
                isUsed: false,
                message: 'Senha válida para uso.'
            };
        } catch (error) {
            console.error('Erro ao verificar histórico de senhas:', error);
            return {
                isUsed: false,
                message: 'Erro ao verificar histórico. Senha aceita por segurança.'
            };
        }
    }

    /**
     * Redefine senha com validação de histórico
     */
    async resetPasswordWithHistory(userId, newPassword) {
        try {
            // Verificar se a senha já foi usada recentemente
            const validation = this.isPasswordRecentlyUsed(userId, newPassword);

            if (validation.isUsed) {
                return {
                    success: false,
                    error: 'PASSWORD_RECENTLY_USED',
                    message: validation.message,
                    usedAt: validation.usedAt
                };
            }

            // Simular atualização da senha no "banco de dados"
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    message: 'Usuário não encontrado.'
                };
            }

            // Obter senha atual para adicionar ao histórico
            const currentPassword = users[userIndex].password || 'temp123';

            // Adicionar senha atual ao histórico antes de atualizar
            this.addPasswordToHistory(userId, currentPassword);

            // Atualizar senha do usuário
            users[userIndex].password = newPassword;
            users[userIndex].lastPasswordChange = new Date().toISOString();

            localStorage.setItem('users', JSON.stringify(users));

            // Log de auditoria
            this.logPasswordReset(userId, users[userIndex].name);

            return {
                success: true,
                message: 'Senha redefinida com sucesso!',
                login: users[userIndex].login || users[userIndex].email,
                novaSenha: newPassword
            };

        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            return {
                success: false,
                error: 'RESET_ERROR',
                message: 'Erro interno ao redefinir senha.'
            };
        }
    }

    /**
     * Registra log de auditoria para redefinição de senha
     */
    logPasswordReset(userId, userName) {
        try {
            const auditLog = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                action: 'password_reset',
                userId: userId,
                userName: userName,
                details: 'Senha redefinida pelo administrador',
                ip: '127.0.0.1', // Simulado
                userAgent: navigator.userAgent
            };

            const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
            existingLogs.push(auditLog);
            localStorage.setItem('auditLogs', JSON.stringify(existingLogs));

            console.log(`📝 Log de auditoria: Senha redefinida para ${userName}`);
        } catch (error) {
            console.error('Erro ao registrar log de auditoria:', error);
        }
    }

    /**
     * Obtém estatísticas do histórico de senhas
     */
    getPasswordHistoryStats() {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            const totalUsers = Object.keys(allHistory).length;
            const totalEntries = Object.values(allHistory).reduce((sum, history) => sum + history.length, 0);

            return {
                totalUsers,
                totalEntries,
                averageEntriesPerUser: totalUsers > 0 ? (totalEntries / totalUsers).toFixed(2) : 0
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return {
                totalUsers: 0,
                totalEntries: 0,
                averageEntriesPerUser: 0
            };
        }
    }

    /**
     * Limpa histórico de senhas de um usuário específico
     */
    clearUserPasswordHistory(userId) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            delete allHistory[userId];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allHistory));

            console.log(`🗑️ Histórico de senhas limpo para usuário ${userId}`);
            return true;
        } catch (error) {
            console.error('Erro ao limpar histórico:', error);
            return false;
        }
    }

    /**
     * Inicializa dados de exemplo para demonstração
     */
    initializeSampleData() {
        try {
            const existingHistory = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');

            // Para debug, sempre recriar os dados com a senha Core@123
            console.log('🔄 Recriando dados de exemplo do histórico de senhas...');

            const sampleData = {
                '1': [ // Usuário ID 1 - MARIO LUIS
                    {
                        id: Date.now() - 86400000,
                        passwordHash: this.hashPassword('Core@123'), // Senha que está sendo testada
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        userId: '1'
                    },
                    {
                        id: Date.now() - 172800000,
                        passwordHash: this.hashPassword('password456'),
                        createdAt: new Date(Date.now() - 172800000).toISOString(),
                        userId: '1'
                    }
                ],
                '2': [ // Usuário ID 2
                    {
                        id: Date.now() - 43200000,
                        passwordHash: this.hashPassword('admin123'),
                        createdAt: new Date(Date.now() - 43200000).toISOString(),
                        userId: '2'
                    }
                ]
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleData));
            console.log('✅ Dados de exemplo do histórico de senhas inicializados com Core@123');
            console.log('🔍 Hash da senha Core@123:', this.hashPassword('Core@123'));
        } catch (error) {
            console.error('❌ Erro ao inicializar dados de exemplo:', error);
        }
    }
}

// Instância singleton
const passwordHistoryService = new PasswordHistoryService();

export default passwordHistoryService;

 * Simula funcionalidade de backend usando localStorage
 */
class PasswordHistoryService {
    constructor() {
        this.STORAGE_KEY = 'passwordHistory';
        this.MAX_HISTORY = 2; // Manter apenas as 2 últimas senhas
    }

    /**
     * Simula hash de senha usando uma função simples
     * Em produção, usar bcrypt ou similar
     */
    hashPassword(password) {
        // Simulação mais consistente de hash - em produção usar bcrypt
        // Usar um salt fixo para simulação (em produção seria único por senha)
        const salt = 'core_rh_salt_2024';
        return btoa(password + salt).slice(0, 50);
    }

    /**
     * Verifica se uma senha corresponde ao hash
     */
    verifyPassword(password, hash) {
        try {
            // Simulação mais robusta de verificação de hash
            const passwordHash = this.hashPassword(password);
            console.log('🔍 Verificando senha:', password, 'Hash:', passwordHash, 'Hash armazenado:', hash);

            // Verificar se os hashes são iguais
            const isMatch = passwordHash === hash;
            console.log('🔍 Senha corresponde:', isMatch);

            return isMatch;
        } catch (error) {
            console.error('Erro ao verificar senha:', error);
            return false;
        }
    }

    /**
     * Obtém histórico de senhas de um usuário
     */
    getUserPasswordHistory(userId) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            return allHistory[userId] || [];
        } catch (error) {
            console.error('Erro ao carregar histórico de senhas:', error);
            return [];
        }
    }

    /**
     * Adiciona uma nova senha ao histórico
     */
    addPasswordToHistory(userId, password) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            const userHistory = allHistory[userId] || [];

            // Criar entrada para a nova senha
            const newEntry = {
                id: Date.now(),
                passwordHash: this.hashPassword(password),
                createdAt: new Date().toISOString(),
                userId: userId
            };

            // Adicionar ao histórico
            userHistory.unshift(newEntry);

            // Manter apenas as últimas MAX_HISTORY senhas
            if (userHistory.length > this.MAX_HISTORY) {
                userHistory.splice(this.MAX_HISTORY);
            }

            // Salvar no localStorage
            allHistory[userId] = userHistory;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allHistory));

            console.log(`✅ Senha adicionada ao histórico do usuário ${userId}`);
            return true;
        } catch (error) {
            console.error('Erro ao adicionar senha ao histórico:', error);
            return false;
        }
    }

    /**
     * Verifica se uma senha já foi usada recentemente
     */
    isPasswordRecentlyUsed(userId, password) {
        try {
            console.log('🔍 Verificando senha recente para usuário:', userId, 'Senha:', password);
            const userHistory = this.getUserPasswordHistory(userId);
            console.log('🔍 Histórico do usuário:', userHistory);

            // Verificar se a senha corresponde a alguma das últimas senhas
            for (const entry of userHistory) {
                console.log('🔍 Verificando entrada:', entry);
                const isMatch = this.verifyPassword(password, entry.passwordHash);
                if (isMatch) {
                    console.log('🔍 SENHA ENCONTRADA NO HISTÓRICO!');
                    return {
                        isUsed: true,
                        usedAt: entry.createdAt,
                        message: 'Esta senha não é permitida, pois já foi utilizada recentemente.'
                    };
                }
            }

            console.log('🔍 Senha não encontrada no histórico - OK para usar');
            return {
                isUsed: false,
                message: 'Senha válida para uso.'
            };
        } catch (error) {
            console.error('Erro ao verificar histórico de senhas:', error);
            return {
                isUsed: false,
                message: 'Erro ao verificar histórico. Senha aceita por segurança.'
            };
        }
    }

    /**
     * Redefine senha com validação de histórico
     */
    async resetPasswordWithHistory(userId, newPassword) {
        try {
            // Verificar se a senha já foi usada recentemente
            const validation = this.isPasswordRecentlyUsed(userId, newPassword);

            if (validation.isUsed) {
                return {
                    success: false,
                    error: 'PASSWORD_RECENTLY_USED',
                    message: validation.message,
                    usedAt: validation.usedAt
                };
            }

            // Simular atualização da senha no "banco de dados"
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    message: 'Usuário não encontrado.'
                };
            }

            // Obter senha atual para adicionar ao histórico
            const currentPassword = users[userIndex].password || 'temp123';

            // Adicionar senha atual ao histórico antes de atualizar
            this.addPasswordToHistory(userId, currentPassword);

            // Atualizar senha do usuário
            users[userIndex].password = newPassword;
            users[userIndex].lastPasswordChange = new Date().toISOString();

            localStorage.setItem('users', JSON.stringify(users));

            // Log de auditoria
            this.logPasswordReset(userId, users[userIndex].name);

            return {
                success: true,
                message: 'Senha redefinida com sucesso!',
                login: users[userIndex].login || users[userIndex].email,
                novaSenha: newPassword
            };

        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            return {
                success: false,
                error: 'RESET_ERROR',
                message: 'Erro interno ao redefinir senha.'
            };
        }
    }

    /**
     * Registra log de auditoria para redefinição de senha
     */
    logPasswordReset(userId, userName) {
        try {
            const auditLog = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                action: 'password_reset',
                userId: userId,
                userName: userName,
                details: 'Senha redefinida pelo administrador',
                ip: '127.0.0.1', // Simulado
                userAgent: navigator.userAgent
            };

            const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
            existingLogs.push(auditLog);
            localStorage.setItem('auditLogs', JSON.stringify(existingLogs));

            console.log(`📝 Log de auditoria: Senha redefinida para ${userName}`);
        } catch (error) {
            console.error('Erro ao registrar log de auditoria:', error);
        }
    }

    /**
     * Obtém estatísticas do histórico de senhas
     */
    getPasswordHistoryStats() {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            const totalUsers = Object.keys(allHistory).length;
            const totalEntries = Object.values(allHistory).reduce((sum, history) => sum + history.length, 0);

            return {
                totalUsers,
                totalEntries,
                averageEntriesPerUser: totalUsers > 0 ? (totalEntries / totalUsers).toFixed(2) : 0
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return {
                totalUsers: 0,
                totalEntries: 0,
                averageEntriesPerUser: 0
            };
        }
    }

    /**
     * Limpa histórico de senhas de um usuário específico
     */
    clearUserPasswordHistory(userId) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            delete allHistory[userId];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allHistory));

            console.log(`🗑️ Histórico de senhas limpo para usuário ${userId}`);
            return true;
        } catch (error) {
            console.error('Erro ao limpar histórico:', error);
            return false;
        }
    }

    /**
     * Inicializa dados de exemplo para demonstração
     */
    initializeSampleData() {
        try {
            const existingHistory = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');

            // Para debug, sempre recriar os dados com a senha Core@123
            console.log('🔄 Recriando dados de exemplo do histórico de senhas...');

            const sampleData = {
                '1': [ // Usuário ID 1 - MARIO LUIS
                    {
                        id: Date.now() - 86400000,
                        passwordHash: this.hashPassword('Core@123'), // Senha que está sendo testada
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        userId: '1'
                    },
                    {
                        id: Date.now() - 172800000,
                        passwordHash: this.hashPassword('password456'),
                        createdAt: new Date(Date.now() - 172800000).toISOString(),
                        userId: '1'
                    }
                ],
                '2': [ // Usuário ID 2
                    {
                        id: Date.now() - 43200000,
                        passwordHash: this.hashPassword('admin123'),
                        createdAt: new Date(Date.now() - 43200000).toISOString(),
                        userId: '2'
                    }
                ]
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleData));
            console.log('✅ Dados de exemplo do histórico de senhas inicializados com Core@123');
            console.log('🔍 Hash da senha Core@123:', this.hashPassword('Core@123'));
        } catch (error) {
            console.error('❌ Erro ao inicializar dados de exemplo:', error);
        }
    }
}

// Instância singleton
const passwordHistoryService = new PasswordHistoryService();

export default passwordHistoryService;
