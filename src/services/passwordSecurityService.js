/**
 * Serviço de Segurança de Senhas
 * Gerencia histórico de senhas e validações de segurança
 */

class PasswordSecurityService {
    constructor() {
        this.storageKey = 'passwordHistory';
        this.maxHistorySize = 2; // Manter apenas as últimas 2 senhas
    }

    /**
     * Verifica se uma senha foi usada recentemente
     * @param {string} userId - ID do usuário
     * @param {string} newPassword - Nova senha a ser verificada
     * @returns {Promise<{isUsed: boolean, message: string}>}
     */
    async isPasswordRecentlyUsed(userId, newPassword) {
        try {
            const history = this.getPasswordHistory(userId);
            const newPasswordHash = this.hashPassword(newPassword);

            for (const entry of history) {
                if (entry.passwordHash === newPasswordHash) {
                    return {
                        isUsed: true,
                        message: 'Esta senha não é permitida, pois já foi utilizada recentemente.'
                    };
                }
            }

            return {
                isUsed: false,
                message: 'Senha válida'
            };
        } catch (error) {
            console.error('Erro ao verificar histórico de senhas:', error);
            return {
                isUsed: false,
                message: 'Erro na verificação'
            };
        }
    }

    /**
     * Verifica a complexidade da senha
     * @param {string} password - Senha a ser verificada
     * @returns {object} Resultado da verificação de complexidade
     */
    checkPasswordComplexity(password) {
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            isValid: password.length >= 8 &&
                /[A-Z]/.test(password) &&
                /[a-z]/.test(password) &&
                /\d/.test(password) &&
                /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
    }

    /**
     * Redefine a senha com validação de histórico
     * @param {string} userId - ID do usuário
     * @param {string} newPassword - Nova senha
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async resetPasswordWithHistory(userId, newPassword) {
        try {
            // Verificar se a senha foi usada recentemente
            const historyCheck = await this.isPasswordRecentlyUsed(userId, newPassword);
            if (historyCheck.isUsed) {
                return {
                    success: false,
                    error: 'PASSWORD_RECENTLY_USED',
                    message: historyCheck.message
                };
            }

            // Verificar complexidade
            const complexityCheck = this.checkPasswordComplexity(newPassword);
            if (!complexityCheck.isValid) {
                return {
                    success: false,
                    error: 'PASSWORD_COMPLEXITY_INVALID',
                    message: 'A senha não atende aos requisitos de complexidade'
                };
            }

            // Adicionar nova senha ao histórico
            await this.addPasswordToHistory(userId, newPassword);

            // Simular atualização da senha no sistema
            await this.updateUserPassword(userId, newPassword);

            return {
                success: true,
                message: 'Senha redefinida com sucesso'
            };
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            return {
                success: false,
                error: 'UNKNOWN_ERROR',
                message: 'Erro interno do sistema'
            };
        }
    }

    /**
     * Obtém o histórico de senhas de um usuário
     * @param {string} userId - ID do usuário
     * @returns {Array} Histórico de senhas
     */
    getPasswordHistory(userId) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            return allHistory[userId] || [];
        } catch (error) {
            console.error('Erro ao obter histórico de senhas:', error);
            return [];
        }
    }

    /**
     * Adiciona uma nova senha ao histórico
     * @param {string} userId - ID do usuário
     * @param {string} password - Senha a ser adicionada
     */
    async addPasswordToHistory(userId, password) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            const userHistory = allHistory[userId] || [];

            // Adicionar nova entrada
            const newEntry = {
                passwordHash: this.hashPassword(password),
                timestamp: new Date().toISOString(),
                resetBy: 'admin' // Simular reset por admin
            };

            userHistory.unshift(newEntry);

            // Manter apenas as últimas N senhas
            if (userHistory.length > this.maxHistorySize) {
                userHistory.splice(this.maxHistorySize);
            }

            allHistory[userId] = userHistory;
            localStorage.setItem(this.storageKey, JSON.stringify(allHistory));

            console.log(`✅ Senha adicionada ao histórico para usuário ${userId}`);
        } catch (error) {
            console.error('Erro ao adicionar senha ao histórico:', error);
        }
    }

    /**
     * Simula a atualização da senha do usuário
     * @param {string} userId - ID do usuário
     * @param {string} newPassword - Nova senha
     */
    async updateUserPassword(userId, newPassword) {
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 500));

            // Atualizar usuário no localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(user => user.id === userId);

            if (userIndex !== -1) {
                users[userIndex].password = this.hashPassword(newPassword);
                users[userIndex].lastPasswordReset = new Date().toISOString();
                localStorage.setItem('users', JSON.stringify(users));
                console.log(`✅ Senha atualizada para usuário ${userId}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar senha do usuário:', error);
        }
    }

    /**
     * Gera hash da senha (simulado)
     * @param {string} password - Senha em texto plano
     * @returns {string} Hash da senha
     */
    hashPassword(password) {
        // Simulação de hash - em produção usar bcrypt ou similar
        const salt = 'core_rh_salt_2024';
        return btoa(password + salt);
    }

    /**
     * Inicializa dados de exemplo
     */
    initializeSampleData() {
        try {
            const existingHistory = localStorage.getItem(this.storageKey);
            if (existingHistory) {
                console.log('📋 Histórico de senhas já existe');
                return;
            }

            const sampleHistory = {
                '1': [ // Usuário ID 1
                    {
                        passwordHash: this.hashPassword('Core@123'),
                        timestamp: '2024-01-15T10:30:00Z',
                        resetBy: 'admin'
                    },
                    {
                        passwordHash: this.hashPassword('Admin@2024'),
                        timestamp: '2024-01-10T14:20:00Z',
                        resetBy: 'admin'
                    }
                ],
                '2': [ // Usuário ID 2
                    {
                        passwordHash: this.hashPassword('User@123'),
                        timestamp: '2024-01-12T09:15:00Z',
                        resetBy: 'admin'
                    }
                ]
            };

            localStorage.setItem(this.storageKey, JSON.stringify(sampleHistory));
            console.log('✅ Dados de exemplo do histórico de senhas inicializados');
        } catch (error) {
            console.error('❌ Erro ao inicializar dados de exemplo:', error);
        }
    }

    /**
     * Limpa o histórico de senhas de um usuário
     * @param {string} userId - ID do usuário
     */
    clearPasswordHistory(userId) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            delete allHistory[userId];
            localStorage.setItem(this.storageKey, JSON.stringify(allHistory));
            console.log(`✅ Histórico de senhas limpo para usuário ${userId}`);
        } catch (error) {
            console.error('Erro ao limpar histórico de senhas:', error);
        }
    }

    /**
     * Obtém estatísticas do histórico de senhas
     * @returns {object} Estatísticas
     */
    getPasswordHistoryStats() {
        try {
            const allHistory = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
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
}

// Criar instância única
const passwordSecurityService = new PasswordSecurityService();

export default passwordSecurityService;

