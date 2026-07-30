/**
 * TransCloud ERP - Utilities Module
 * Funções utilitárias reutilizáveis
 */

/**
 * Exibe uma notificação toast
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2.5L1.66667 17.5H18.3333L10 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 8.33333V11.6667" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14.5833" r="0.833333" fill="currentColor"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" stroke-width="1.5"/><path d="M10 6.66666V10.8333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="13.75" r="0.625" fill="currentColor"/></svg>'
    };
    
    toast.innerHTML = `${icons[type] || icons.info} ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Abre um modal
 * @param {string} modalId - ID do modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Fecha um modal
 * @param {string} modalId - ID do modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Formata valor monetário
 * @param {number} value - Valor
 * @returns {string} Valor formatado
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata data
 * @param {string|Date} date - Data
 * @returns {string} Data formatada
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

/**
 * Aplica máscara de telefone
 * @param {string} value - Valor
 * @returns {string} Valor com máscara
 */
function maskPhone(value) {
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    return value;
}

/**
 * Valida e-mail
 * @param {string} email - E-mail
 * @returns {boolean} Válido ou não
 */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Debounce function
 * @param {Function} func - Função
 * @param {number} wait - Tempo de espera
 * @returns {Function} Função com debounce
 */
function debounce(func, wait = 300) {
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

// Fecha modal ao clicar fora
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});