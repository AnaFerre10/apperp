/**
 * TransCloud ERP - Main Application Module
 * Configurações globais e navegação (SEM LOGIN)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configura nome do usuário padrão
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.textContent = 'Administrador';
    }
    
    // Configuração da sidebar
    setupSidebar();
    
    // Verifica tutorial
    checkTutorial();
});

/**
 * Configura o comportamento da sidebar e menu hamburguer
 */
function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (!sidebarToggle || !sidebar) {
        console.warn('Sidebar elements not found');
        return;
    }
    
    // Remove eventos antigos para evitar duplicação
    const newToggle = sidebarToggle.cloneNode(true);
    sidebarToggle.parentNode.replaceChild(newToggle, sidebarToggle);
    
    // Adiciona evento de clique no botão hamburguer
    newToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (window.innerWidth <= 768) {
            // Mobile: abre/fecha sidebar como overlay
            sidebar.classList.toggle('mobile-open');
        } else {
            // Desktop: expande/recolhe sidebar
            sidebar.classList.toggle('collapsed');
        }
    });
    
    // Fecha sidebar mobile ao clicar em um link
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
            }
        });
    });
    
    // Fecha sidebar mobile ao clicar fora dela
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            const isClickInside = sidebar.contains(e.target);
            const isToggleButton = e.target.closest('#sidebarToggle');
            
            if (!isClickInside && !isToggleButton && sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });
    
    // Ajusta sidebar ao redimensionar a janela
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
        }
    });
}

/**
 * Verifica se o tutorial já foi concluído
 */
function checkTutorial() {
    const tutorialDone = localStorage.getItem(STORAGE_KEYS.TUTORIAL_DONE);
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!tutorialDone && 
        currentPage !== 'tutorial.html' && 
        currentPage !== '' && 
        currentPage !== 'index.html' &&
        currentPage !== 'dashboard.html') {
        setTimeout(() => {
            showToast('Bem-vindo! Que tal fazer o tutorial para conhecer o sistema?', 'info');
        }, 1000);
    }
}

/**
 * Realiza logout
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