/**
 * TransCloud ERP - Módulo de Tutorial Interativo Guiado (Spotlight)
 */

const tourSteps = [
    {
        element: '.sidebar-nav',
        title: 'Navegação Principal',
        description: 'Acesse facilmente os módulos do sistema como Transportes, Relatórios e Configurações.',
        position: 'right'
    },
    {
        element: '#themeToggle',
        title: 'Tema Claro e Escuro',
        description: 'Alterne o visual entre os modos claro e escuro a qualquer momento para seu conforto visual.',
        position: 'bottom'
    },
    {
        element: '.kpi-grid',
        title: 'Indicadores KPI',
        description: 'Acompanhe as métricas em tempo real sobre viagens, entregas e ocorrências de hoje.',
        position: 'bottom'
    },
    {
        element: '#chartViagensDia',
        title: 'Gráfico de Viagens',
        description: 'Visualize o desempenho diário das viagens realizadas durante a semana.',
        position: 'top'
    },
    {
        element: '#chartStatusEntregas',
        title: 'Status das Entregas',
        description: 'Gráfico de setores indicando as entregas concluídas, em andamento e pendentes. Você pode alternar entre visão semanal e mensal!',
        position: 'top'
    },
    {
        element: '#recentActivities',
        title: 'Atividades Recentes',
        description: 'Confira as últimas movimentações e atualizações do sistema em tempo real.',
        position: 'top'
    }
];

let currentStepIndex = 0;
let spotlightEl = null;
let popoverEl = null;
let overlayEl = null;

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
    
    // Ativa todas as camadas (LIGA O TEMA ESCURO DO HOLOFOTE)
    if (overlayEl) overlayEl.classList.add('active');
    if (spotlightEl) spotlightEl.classList.add('active');
    if (popoverEl) popoverEl.classList.add('active');
    
    showStep(currentStepIndex);
}

function endTour() {
    // Desativa todas as camadas (DESLIGA O TEMA ESCURO DO HOLOFOTE)
    if (overlayEl) overlayEl.classList.remove('active');
    if (spotlightEl) spotlightEl.classList.remove('active');
    if (popoverEl) popoverEl.classList.remove('active');
    
    localStorage.setItem('transcloud_tour_completed', 'true');
}

function showStep(index) {
    const step = tourSteps[index];
    if (!step) return;

    const target = document.querySelector(step.element);
    if (!target) {
        nextStep();
        return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
        const rect = target.getBoundingClientRect();
        const padding = 8;

        spotlightEl.style.top = `${rect.top - padding}px`;
        spotlightEl.style.left = `${rect.left - padding}px`;
        spotlightEl.style.width = `${rect.width + padding * 2}px`;
        spotlightEl.style.height = `${rect.height + padding * 2}px`;

        popoverEl.innerHTML = `
            <div class="tour-popover-header">
                <h4 class="tour-popover-title">${step.title}</h4>
                <span class="tour-popover-step">${index + 1} de ${tourSteps.length}</span>
            </div>
            <div class="tour-popover-body">${step.description}</div>
            <div class="tour-popover-footer">
                <button class="tour-btn tour-btn-skip" onclick="endTour()">Pular</button>
                <div class="tour-btn-nav">
                    ${index > 0 ? `<button class="tour-btn tour-btn-prev" onclick="prevStep()">Anterior</button>` : ''}
                    <button class="tour-btn tour-btn-next" onclick="nextStep()">
                        ${index === tourSteps.length - 1 ? 'Concluir' : 'Próximo'}
                    </button>
                </div>
            </div>
        `;

        positionPopover(rect, step.position);
    }, 200);
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

function nextStep() {
    if (currentStepIndex < tourSteps.length - 1) {
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

function repositionTour() {
    if (overlayEl && overlayEl.classList.contains('active')) {
        showStep(currentStepIndex);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTour();
    
    const tourDone = localStorage.getItem('transcloud_tour_completed');
    if (!tourDone) {
        setTimeout(startTour, 1000);
    }
});