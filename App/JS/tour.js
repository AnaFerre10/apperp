/**
 * TransCloud ERP - Tutorial Interativo (com suporte a múltiplas páginas)
 */

(function injectTourStyles() {
    if (document.getElementById('tourStyleInject')) return;
    const style = document.createElement('style');
    style.id = 'tourStyleInject';
    style.innerHTML = `
        .tour-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 9998; opacity: 0; visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            background-color: rgba(0, 0, 0, 0.3);
        }
        .tour-overlay.active { opacity: 1; visibility: visible; }
        
        .tour-spotlight {
            position: fixed; z-index: 9999; border-radius: 10px;
            border: 2px solid #1a73e8;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.35), 0 0 25px rgba(26, 115, 232, 0.5);
            transition: opacity 0.3s ease, visibility 0.3s ease, top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease;
            pointer-events: none; opacity: 0; visibility: hidden;
            background-color: rgba(255, 255, 255, 0.12);
            backdrop-filter: brightness(1.2);
            -webkit-backdrop-filter: brightness(1.2);
        }
        .tour-spotlight.active { opacity: 1; visibility: visible; }
        
        .tour-popover {
            position: fixed; z-index: 10000; width: 320px; background-color: #ffffff; color: #1f2937;
            border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); opacity: 0; visibility: hidden;
            border: 1px solid rgba(0, 0, 0, 0.08); font-family: 'Inter', sans-serif;
        }
        body.dark-theme .tour-popover { background-color: #1e293b; color: #f3f4f6; border-color: #334155; }
        .tour-popover.active { opacity: 1; visibility: visible; }
        
        .tour-popover-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .tour-popover-title { font-size: 16px; font-weight: 700; margin: 0; color: inherit; }
        .tour-popover-step { font-size: 12px; font-weight: 600; opacity: 0.6; }
        .tour-popover-body { font-size: 14px; line-height: 1.5; margin-bottom: 20px; color: inherit; }
        .tour-popover-footer { display: flex; justify-content: space-between; align-items: center; }
        
        .tour-btn { border: none; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .tour-btn-skip { background: transparent; color: #6b7280; }
        body.dark-theme .tour-btn-skip { color: #9ca3af; }
        .tour-btn-nav { display: flex; gap: 8px; }
        .tour-btn-prev { background: #e5e7eb; color: #374151; }
        body.dark-theme .tour-btn-prev { background: #334155; color: #e2e8f0; }
        .tour-btn-next { background: #1a73e8; color: #ffffff; }
        .tour-btn-next:hover { background: #1557b0; }
    `;
    document.head.appendChild(style);
})();

// ==================== DEFINIÇÃO DE PASSOS POR PÁGINA ====================

// Passos para o Dashboard
const tourStepsDashboard = [
    { 
        element: '#sidebar', 
        title: 'Navegação Principal', 
        description: 'Acesse rapidamente os módulos do sistema: Dashboard, Transportes, Relatórios e Configurações.', 
        position: 'right' 
    },
    { 
        element: '#themeToggle', 
        title: 'Alternar Tema', 
        description: 'Alterne entre o tema claro e escuro do sistema para melhor conforto visual.', 
        position: 'bottom' 
    },
    { 
        element: '.kpi-grid', 
        title: 'Indicadores Principais (KPIs)', 
        description: 'Acompanhe resumos em tempo real sobre viagens em andamento, entregas concluídas e alertas.', 
        position: 'bottom' 
    },
    { 
        element: '.charts-grid', 
        title: 'Gráficos de Desempenho', 
        description: 'Análise estatística e evolução dos transportes visualmente por período.', 
        position: 'top' 
    },
    { 
        element: '#tableEntregas', 
        title: 'Últimas Entregas', 
        description: 'Veja os registros mais recentes e acompanhe o status de cada carga.', 
        position: 'top' 
    },
    { 
        element: '#recentActivities', 
        title: 'Atividades Recentes', 
        description: 'Acompanhe as movimentações em tempo real do sistema.', 
        position: 'top' 
    }
];

// Passos para a página de Transportes
const tourStepsTransportes = [
    { 
        element: '#sidebar', 
        title: 'Navegação Principal', 
        description: 'Acesse rapidamente os módulos do sistema: Dashboard, Transportes, Relatórios e Configurações.', 
        position: 'right' 
    },
    { 
        element: '.transport-summary', 
        title: 'Resumo de Transportes', 
        description: 'Veja os principais indicadores: total de viagens, concluídas, em andamento e faturamento.', 
        position: 'bottom' 
    },
    { 
        element: '.tabs', 
        title: 'Abas de Navegação', 
        description: 'Navegue entre Viagens, Veículos, Motoristas e Clientes para gerenciar cada área.', 
        position: 'bottom' 
    },
    { 
        element: '#tab-viagens .toolbar', 
        title: 'Busca e Ações', 
        description: 'Pesquise registros, adicione novas viagens ou exporte dados para Excel.', 
        position: 'bottom' 
    },
    { 
        element: '#tableViagens', 
        title: 'Lista de Viagens', 
        description: 'Visualize todas as viagens cadastradas com seus detalhes e status.', 
        position: 'top' 
    },
    { 
        element: '#tab-viagens .btn-primary', 
        title: 'Nova Viagem', 
        description: 'Clique aqui para cadastrar uma nova viagem com origem, destino, motorista e valor.', 
        position: 'bottom' 
    }
];

// Passos para Configurações
const tourStepsConfiguracoes = [
    { 
        element: '#sidebar', 
        title: 'Navegação Principal', 
        description: 'Acesse rapidamente qualquer módulo do sistema.', 
        position: 'right' 
    },
    { 
        element: '#themeToggle', 
        title: 'Alternar Tema', 
        description: 'Troque entre o tema claro e escuro quando preferir.', 
        position: 'bottom' 
    },
    { 
        element: '#cardMinhasInformacoes', 
        title: 'Minhas Informações', 
        description: 'Gerencie seus dados de perfil e atualize sua senha de acesso.', 
        position: 'right' 
    },
    { 
        element: '#cardOpcoesSistema', 
        title: 'Opções do Sistema', 
        description: 'Ajuste avisos, notificações por e-mail e rotinas de backup.', 
        position: 'left' 
    }
];

// ==================== LÓGICA PRINCIPAL ====================

let currentStepIndex = 0;
let spotlightEl = null;
let popoverEl = null;
let overlayEl = null;

/**
 * Detecta qual página está ativa e retorna os steps correspondentes.
 */
function getActiveSteps() {
    const path = window.location.pathname;
    // Detecta Transportes
    if (path.includes('transportes') || document.querySelector('.transport-summary')) {
        return tourStepsTransportes;
    }
    // Detecta Configurações
    if (path.includes('configuracoes') || document.getElementById('cardMinhasInformacoes')) {
        return tourStepsConfiguracoes;
    }
    // Padrão: Dashboard
    return tourStepsDashboard;
}

function initTour() {
    if (document.getElementById('tourOverlay')) return;

    overlayEl = document.createElement('div');
    overlayEl.id = 'tourOverlay';
    overlayEl.className = 'tour-overlay';
    document.body.appendChild(overlayEl);

    spotlightEl = document.createElement('div');
    spotlightEl.id = 'tourSpotlight';
    spotlightEl.className = 'tour-spotlight';
    document.body.appendChild(spotlightEl);

    popoverEl = document.createElement('div');
    popoverEl.id = 'tourPopover';
    popoverEl.className = 'tour-popover';
    document.body.appendChild(popoverEl);

    window.addEventListener('resize', repositionTour);
    window.addEventListener('scroll', repositionTour, true);
}

function startTour() {
    initTour();
    currentStepIndex = 0;
    
    overlayEl.classList.add('active');
    spotlightEl.classList.add('active');
    popoverEl.classList.add('active');
    
    showStep(currentStepIndex);
}

function endTour() {
    if (overlayEl) overlayEl.classList.remove('active');
    if (spotlightEl) spotlightEl.classList.remove('active');
    if (popoverEl) popoverEl.classList.remove('active');
}

function isFixed(element) {
    let el = element;
    while (el && el !== document.body) {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'sticky') {
            return true;
        }
        el = el.parentElement;
    }
    return false;
}

function showStep(index) {
    const steps = getActiveSteps();
    const step = steps[index];
    if (!step) return;

    // Tenta encontrar o elemento alvo usando os seletores
    const selectors = step.element.split(',');
    let target = null;
    for (let sel of selectors) {
        let el = document.querySelector(sel.trim());
        if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
            target = el;
            break;
        }
    }

    // Fallback: se não encontrar, usa o main-content ou body
    if (!target) {
        target = document.querySelector('.main-content') || document.body;
    }

    // Rola até o elemento se não for fixed
    if (!isFixed(target)) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setTimeout(() => {
        renderStepContent(target, step, index, steps.length);
    }, 200); // pequeno delay para o scroll
}

function renderStepContent(target, step, index, totalSteps) {
    const rect = target.getBoundingClientRect();
    const padding = 8;

    spotlightEl.style.top = `${Math.max(0, rect.top - padding)}px`;
    spotlightEl.style.left = `${Math.max(0, rect.left - padding)}px`;
    spotlightEl.style.width = `${rect.width + (padding * 2)}px`;
    spotlightEl.style.height = `${rect.height + (padding * 2)}px`;

    popoverEl.innerHTML = `
        <div class="tour-popover-header">
            <h4 class="tour-popover-title">${step.title}</h4>
            <span class="tour-popover-step">${index + 1} de ${totalSteps}</span>
        </div>
        <div class="tour-popover-body">${step.description}</div>
        <div class="tour-popover-footer">
            <button class="tour-btn tour-btn-skip" onclick="endTour()">Pular</button>
            <div class="tour-btn-nav">
                ${index > 0 ? `<button class="tour-btn tour-btn-prev" onclick="prevStep()">Anterior</button>` : ''}
                <button class="tour-btn tour-btn-next" onclick="nextStep()">
                    ${index === totalSteps - 1 ? 'Concluir' : 'Próximo'}
                </button>
            </div>
        </div>
    `;

    positionPopover(rect, step.position);
}

function positionPopover(targetRect, position) {
    const popoverRect = popoverEl.getBoundingClientRect();
    const margin = 16;
    let top = 0;
    let left = 0;

    switch (position) {
        case 'right':
            left = targetRect.right + margin;
            top = targetRect.top + (targetRect.height / 2) - (popoverRect.height / 2);
            break;
        case 'left':
            left = targetRect.left - popoverRect.width - margin;
            top = targetRect.top + (targetRect.height / 2) - (popoverRect.height / 2);
            break;
        case 'bottom':
            top = targetRect.bottom + margin;
            left = targetRect.left + (targetRect.width / 2) - (popoverRect.width / 2);
            break;
        case 'top':
        default:
            top = targetRect.top - popoverRect.height - margin;
            left = targetRect.left + (targetRect.width / 2) - (popoverRect.width / 2);
            break;
    }

    // Ajusta para não sair da tela
    if (left < 10) left = 10;
    if (left + popoverRect.width > window.innerWidth - 10) {
        left = window.innerWidth - popoverRect.width - 10;
    }
    if (top < 10) top = 10;
    if (top + popoverRect.height > window.innerHeight - 10) {
        top = window.innerHeight - popoverRect.height - 10;
    }

    popoverEl.style.top = `${top}px`;
    popoverEl.style.left = `${left}px`;
}

function repositionTour() {
    if (overlayEl && overlayEl.classList.contains('active')) {
        showStep(currentStepIndex);
    }
}

function nextStep() {
    const steps = getActiveSteps();
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        showStep(currentStepIndex);
    } else {
        endTour();
    }
}

function prevStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        showStep(currentStepIndex);
    }
}

// Expor funções globalmente
window.startTour = startTour;
window.endTour = endTour;
window.nextStep = nextStep;
window.prevStep = prevStep;

// Inicializa ao carregar a página
document.addEventListener('DOMContentLoaded', initTour);