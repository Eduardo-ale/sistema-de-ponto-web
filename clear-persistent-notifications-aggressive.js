// Script para limpar notificações persistentes - VERSÃO AGRESSIVA
// Execute este script no console do navegador para limpar todas as notificações

console.log('🧹 Limpando notificações persistentes (VERSÃO AGRESSIVA)...');

// Limpar localStorage de notificações
const keysToClear = [
    'emailLogs',
    'passwordHistory',
    'passwordResetAudit',
    'notifications',
    'toast-notifications',
    'react-hot-toast',
    'persistent-notifications',
    'passwordResetError',
    'passwordResetSuccess',
    'alertMessage',
    'showErrorAlert',
    'showSuccessAlert'
];

keysToClear.forEach(key => {
    if (localStorage.getItem(key)) {
        console.log(`🗑️ Removendo ${key} do localStorage`);
        localStorage.removeItem(key);
    }
});

// Limpar sessionStorage também
keysToClear.forEach(key => {
    if (sessionStorage.getItem(key)) {
        console.log(`🗑️ Removendo ${key} do sessionStorage`);
        sessionStorage.removeItem(key);
    }
});

// Limpar cookies relacionados a notificações
document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Forçar limpeza de elementos DOM de notificações
const notificationSelectors = [
    '[class*="toast"]',
    '[class*="notification"]',
    '[class*="alert"]',
    '[class*="PasswordErrorAlert"]',
    '[class*="PasswordSuccessAlert"]',
    '[class*="password-error"]',
    '[class*="password-success"]',
    '.react-hot-toast',
    '#react-hot-toast'
];

notificationSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        if (element && element.parentNode) {
            console.log(`🗑️ Removendo elemento: ${selector}`);
            element.parentNode.removeChild(element);
        }
    });
});

// Limpar elementos específicos do react-hot-toast
const toastContainer = document.getElementById('react-hot-toast');
if (toastContainer) {
    toastContainer.innerHTML = '';
    console.log('🗑️ Limpando container do react-hot-toast');
}

// Limpar todos os elementos com z-index alto (notificações)
const highZIndexElements = document.querySelectorAll('*');
highZIndexElements.forEach(element => {
    const zIndex = window.getComputedStyle(element).zIndex;
    if (zIndex && parseInt(zIndex) > 1000) {
        if (element.classList.contains('toast') ||
            element.classList.contains('notification') ||
            element.classList.contains('alert')) {
            if (element.parentNode) {
                console.log('🗑️ Removendo elemento com z-index alto:', element);
                element.parentNode.removeChild(element);
            }
        }
    }
});

console.log('✅ Notificações persistentes limpas (VERSÃO AGRESSIVA)!');
console.log('🔄 Recarregue a página para aplicar as mudanças');

// Tentar limpar via react-hot-toast se disponível
if (window.toast && typeof window.toast.dismiss === 'function') {
    window.toast.dismiss();
    console.log('🗑️ Limpeza via react-hot-toast.dismiss()');
}

