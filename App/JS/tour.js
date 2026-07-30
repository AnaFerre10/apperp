/**
 * TransCloud ERP - Tutorial Interativo Multi-Páginas
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
            background-color: rgba(0, 0, 0, 0.4);
        }
        .tour-overlay.active { opacity: 1; visibility: visible; }
        
        .tour-spotlight {
            position: fixed; z-index: 9999; border-radius: 10px;
            border: 2px solid #1a73e8;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4), 0 0 25px rgba(26, 115, 232, 0.5);
            transition: opacity 0.3s ease, visibility 0.3s ease, top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease;
            pointer-events: none; opacity: 0; visibility: hidden;
            background-color: rgba(255, 255, 255, 0.1);
            backdrop-filter: brightness(1.1);
            -webkit-backdrop-filter: brightness(1.1);
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

const tourStepsDashboard = [
    { element: '#sidebar', title: 'Navegação Principal', description: 'Acesse rapidamente os módulos do sistema.', position: 'right' },
    { element: '#themeToggle', title: 'Alternar Tema', description: 'Alterne entre o tema claro e escuro.', position: 'bottom' },
    { element: '.kpi-grid', title: 'Indicadores (KPIs)', description: 'Resumos em tempo real sobre viagens e entregas.', position: 'bottom' },
    { element: '.charts-grid', title: 'Gráficos', description: 'Análise estatística do desempenho.', position: 'top' },
    { element: '#tableEntregas', title: 'Últimas Entregas', description: 'Status dos registros recentes.', position: 'top' },
    { element: '#recentActivities', title: 'Atividades Recentes', description: 'Movimentações no sistema.', position: 'top' }
];

const tourStepsTransportes = [
    { element: '#sidebar', title: 'Navegação Principal', description: 'Acesse rapidamente qualquer módulo.', position: 'right' },
    { element: '.transport-summary', title: 'Resumo de Transportes', description: 'Indicadores principais da frota.', position: 'bottom' },
    { element: '.tabs', title: 'Abas de Navegação', description: 'Gerencie Viagens, Veículos, Motoristas e Clientes.', position: 'bottom' },
    { element: '#tab-viagens .toolbar', title: 'Busca e Ações', description: 'Filtre dados ou exporte relatórios.', position: 'bottom' },
    { element: '#tableViagens', title: 'Lista de Viagens', description: 'Detalhes completos das viagens cadastradas.', position: 'top' },
    { element: '#tab-viagens .btn-primary', title: 'Nova Viagem', description: 'Cadastre novas operações de transporte.', position: 'bottom' }
];

const tourStepsRelatorios = [
    { element: '#sidebar', title: 'Navegação Principal', description: 'Acesse rapidamente qualquer módulo do sistema.', position: 'right' },
    { element: '#themeToggle', title: 'Alternar Tema', description: 'Alterne visualização entre modo claro e escuro.', position: 'bottom' },
    { element: '.card:has(#btnFiltrar)', title: 'Filtros de Pesquisa', description: 'Filtre seus relatórios por intervalo de datas e tipo específico.', position: 'bottom' },
    { element: '.reports-grid', title: 'Catálogo de Relatórios', description: 'Escolha o tipo de relatório gerencial que deseja consultar.', position: 'top' },
    { element: '.charts-grid', title: 'Gráficos Comparativos', description: 'Acompanhe visualmente as métricas financeiras e operacionais.', position: 'top' },
    { element: '#historicoCard', title: 'Histórico', description: 'Consulte os últimos relatórios gerados recentemente.', position: 'top' }
];

const tourStepsConfiguracoes = [
    { element: '#sidebar', title: 'Navegação Principal', description: 'Acesse rapidamente qualquer módulo.', position: 'right' },
    { element: '#themeToggle', title: 'Alternar Tema', description: 'Troque a aparência do sistema.', position: 'bottom' },
    { element: '#cardMinhasInformacoes', title: 'Minhas Informações', description: 'Gerencie dados do seu perfil e senha.', position: 'right' },
    { element: '#cardOpcoesSistema', title: 'Opções do Sistema', description: 'Ajuste notificações e rotinas de backup.', position: 'left' }
];

// ==================== LÓGICA PRINCIPAL ====================

let currentStepIndex = 0;
let spotlightEl = null;
let popoverEl = null;
let overlayEl = null;

function getActiveSteps() {
    const path = window.location.pathname;
    
    if (path.includes('transportes') || document.querySelector('.transport-summary')) {
        return tourStepsTransportes;
    }
    if (path.includes('relatorios') || document.querySelector('.reports-grid')) {
        return tourStepsRelatorios;
    }
    if (path.includes('configuracoes') || document.getElementById('cardMinhasInformacoes')) {
        return tourStepsConfiguracoes;
    }
    
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

    const selectors = step.element.split(',');
    let target = null;
    for (let sel of selectors) {
        try {
            let el = document.querySelector(sel.trim());
            if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
                target = el;
                break;
            }
        } catch(e) {
            // Tratamento caso o seletor CSS seja inválido em navegadores antigos
        }
    }

    if (!target) {
        target = document.querySelector('.main-content') || document.body;
    }

    if (!isFixed(target)) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setTimeout(() => {
        renderStepContent(target, step, index, steps.length);
    }, 250);
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
            <button class="tour-btn tour-btn-skip" onclick="window.endTour()">Pular</button>
            <div class="tour-btn-nav">
                ${index > 0 ? `<button class="tour-btn tour-btn-prev" onclick="window.prevStep()">Anterior</button>` : ''}
                <button class="tour-btn tour-btn-next" onclick="window.nextStep()">
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

// Exposição explícita no escopo global
window.startTour = startTour;
window.endTour = endTour;
window.nextStep = nextStep;
window.prevStep = prevStep;

document.addEventListener('DOMContentLoaded', initTour);