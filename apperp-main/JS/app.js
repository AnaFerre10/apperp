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
 * Mantém o estado (aberto/fechado) entre as páginas
 */
function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (!sidebarToggle || !sidebar) {
        console.warn('Sidebar elements not found');
        return;
    }
    
    // Recupera o estado salvo da sidebar
    const sidebarState = localStorage.getItem('transcloud_sidebar_state');
    
    // Aplica o estado salvo (apenas em desktop)
    if (window.innerWidth > 768) {
        if (sidebarState === 'collapsed') {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    } else {
        // Em mobile, sempre começa fechada
        sidebar.classList.remove('mobile-open');
        sidebar.classList.remove('collapsed');
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
            
            // Salva o estado no localStorage
            if (sidebar.classList.contains('collapsed')) {
                localStorage.setItem('transcloud_sidebar_state', 'collapsed');
            } else {
                localStorage.setItem('transcloud_sidebar_state', 'expanded');
            }
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
            // Remove classe mobile
            sidebar.classList.remove('mobile-open');
            
            // Restaura estado salvo em desktop
            const savedState = localStorage.getItem('transcloud_sidebar_state');
            if (savedState === 'collapsed') {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
        } else {
            // Em mobile, garante que não tenha classe collapsed
            sidebar.classList.remove('collapsed');
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
/**
 * TransCloud ERP - Main Application Module
 * Configurações globais, navegação e tema (SEM LOGIN)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Remove animações durante o carregamento inicial
    document.body.classList.add('preload');
    
    // Configura nome do usuário padrão
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.textContent = 'Administrador';
    }
    
    // Configuração da sidebar
    setupSidebar();
    
    // Configuração do tema
    setupTheme();
    
    // Verifica tutorial
    checkTutorial();
    
    // Remove a classe preload após tudo estar configurado
    setTimeout(function() {
        document.body.classList.remove('preload');
    }, 50);
});

/**
 * Configura o tema claro/escuro
 */
function setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) return;
    
    // Recupera o tema salvo
    const savedTheme = localStorage.getItem('transcloud_theme');
    
    // Aplica o tema salvo (padrão: claro)
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // Atualiza a visibilidade dos ícones
    updateThemeIcons();
    
    // Remove eventos antigos
    const newToggle = themeToggle.cloneNode(true);
    themeToggle.parentNode.replaceChild(newToggle, themeToggle);
    
    // Adiciona evento de clique
    newToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        
        // Salva a preferência
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('transcloud_theme', 'dark');
        } else {
            localStorage.setItem('transcloud_theme', 'light');
        }
        
        // Atualiza os ícones
        updateThemeIcons();

        // Atualiza os gráficos em tempo real para refletir a cor branca no modo escuro
        if (typeof loadCharts === 'function') {
            loadCharts();
        }
    });
}

/**
 * Atualiza a visibilidade dos ícones de sol/lua
 */
function updateThemeIcons() {
    const iconSun = document.querySelector('.icon-sun');
    const iconMoon = document.querySelector('.icon-moon');
    
    if (!iconSun || !iconMoon) return;
    
    if (document.body.classList.contains('dark-theme')) {
        iconSun.style.display = 'block';
        iconMoon.style.display = 'none';
    } else {
        iconSun.style.display = 'none';
        iconMoon.style.display = 'block';
    }
}

// ... resto do código (setupSidebar, checkTutorial, logout, resetTutorial) permanece igual