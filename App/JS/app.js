/**
 * TransCloud ERP - Main Application Module
 * Configurações globais e navegação (SEM LOGIN)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configuração da sidebar
    setupSidebar();
    
    // Configura nome do usuário padrão
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.textContent = 'Administrador';
    }
    
    // Verifica tutorial
    checkTutorial();
});

/**
 * Configura o comportamento da sidebar
 */
function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('mobile-open');
            } else {
                sidebar.classList.toggle('collapsed');
            }
        });
    }
    
    // Fecha sidebar mobile ao clicar em um link
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
            }
        });
    });
}

/**
 * Verifica se o tutorial já foi concluído
 */
function checkTutorial() {
    const tutorialDone = localStorage.getItem(STORAGE_KEYS.TUTORIAL_DONE);
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!tutorialDone && currentPage !== 'tutorial.html' && currentPage !== '' && currentPage !== 'index.html') {
        setTimeout(() => {
            showToast('Bem-vindo! Que tal fazer o tutorial para conhecer o sistema?', 'info');
        }, 1000);
    }
}

/**
 * Realiza logout (apenas limpa dados e recarrega)
 */
function logout() {
    showToast('Sessão encerrada com sucesso!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

/**
 * Reseta o tutorial
 */
function resetTutorial() {
    localStorage.removeItem(STORAGE_KEYS.TUTORIAL_DONE);
    showToast('Tutorial reiniciado! Redirecionando...', 'success');
    setTimeout(() => {
        window.location.href = 'tutorial.html';
    }, 1500);
}