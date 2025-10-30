/**
 * Utilitários para geração de login
 */

/**
 * Gera login automaticamente baseado no nome do usuário
 * @param {string} name - Nome completo do usuário
 * @returns {string} - Login gerado
 */
export const generateLogin = (name) => {
    if (!name) return '';

    // Remove acentos e caracteres especiais
    const normalizedName = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z\s]/g, '');

    // Divide o nome em partes
    const nameParts = normalizedName.trim().split(/\s+/);

    if (nameParts.length === 1) {
        // Se só tem um nome, usa ele
        return nameParts[0];
    } else if (nameParts.length === 2) {
        // Se tem dois nomes, usa primeiro.último
        return `${nameParts[0]}.${nameParts[1]}`;
    } else {
        // Se tem mais de dois nomes, usa primeiro.último
        return `${nameParts[0]}.${nameParts[nameParts.length - 1]}`;
    }
};

/**
 * Gera login baseado no email (método alternativo)
 * @param {string} email - Email do usuário
 * @returns {string} - Login gerado
 */
export const generateLoginFromEmail = (email) => {
    if (!email) return '';
    return email.split('@')[0];
};

export default {
    generateLogin,
    generateLoginFromEmail
};





