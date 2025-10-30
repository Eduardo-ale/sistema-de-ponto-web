// Utilitários de validação para o sistema
export const validationUtils = {
    // Validação de CPF
    validateCPF: (cpf) => {
        // Remove caracteres não numéricos
        const cleanCPF = cpf.replace(/\D/g, '');

        // Verifica se tem 11 dígitos
        if (cleanCPF.length !== 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cleanCPF)) {
            return false;
        }

        // Validação do algoritmo do CPF
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(9))) {
            return false;
        }

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(10))) {
            return false;
        }

        return true;
    },

    // Formatar CPF com máscara
    formatCPF: (value) => {
        const cleanValue = value.replace(/\D/g, '');
        return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    // Validação de e-mail
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Verificar se dados já existem no localStorage
    checkDuplicateData: (field, value, currentUserId = null) => {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const existingUser = users.find(user => {
                // Se estiver editando, excluir o próprio usuário da verificação
                if (currentUserId && user.id === currentUserId) {
                    return false;
                }

                // Comparar valores em minúsculas para e-mail
                if (field === 'email') {
                    return user[field]?.toLowerCase() === value.toLowerCase();
                }

                // Para CPF, comparar apenas números
                if (field === 'cpf') {
                    const userCPF = user[field]?.replace(/\D/g, '');
                    const valueCPF = value.replace(/\D/g, '');
                    return userCPF === valueCPF;
                }

                return user[field] === value;
            });

            return {
                exists: !!existingUser,
                user: existingUser,
                message: existingUser ? `${field === 'cpf' ? 'CPF' : 'E-mail'} já cadastrado` : 'Dados únicos'
            };
        } catch (error) {
            console.error('Erro ao verificar dados duplicados:', error);
            return { exists: false, message: 'Erro na verificação' };
        }
    },

    // Debounce para validação em tempo real
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

export default validationUtils;
