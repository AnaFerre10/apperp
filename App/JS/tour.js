/**
 * TransCloud ERP - Sistema Unificado de Tutorial Interativo
 */

// Injeta os estilos dinamicamente sem precisar de arquivo CSS separado
(function injectTourStyles() {
    if (document.getElementById('tourStyleInject')) return;
    const style = document.createElement('style');
    style.id = 'tourStyleInject';
    style.innerHTML = `
        .tour-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 9998; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease;
            background-color: rgba(0, 0, 0, 0.5);
        }
        .tour-overlay.active { opacity: 1; visibility: visible; }
        
        .tour-spotlight {
            position: fixed; z-index: 9999; border-radius: 10px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75);
            transition: opacity 0.3s ease, visibility 0.3s ease, top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease;
            pointer-events: none; opacity: 0; visibility: hidden;
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
        .tour-popover-title { font-size: 16px; font-weight: 700; margin: 0; }
        .tour-popover-step { font-size: 12px; font-weight: 600; opacity: 0.6; }
        .tour-popover-body { font-size: 14px; line-height: 1.5; margin-bottom: 20px; }
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

// Passos para a página de Configurações
const tourStepsConfiguracoes = [
    { element: '.sidebar-nav', title: 'Navegação Principal', description: 'Acesse rapidamente qualquer módulo do sistema.', position: 'right' },
    { element: '#themeToggle', title: 'Alternar Tema', description: 'Troque entre o tema claro e escuro quando preferir.', position: 'bottom' },
    { element: '#cardMinhasInformacoes', title: 'Minhas Informações', description: 'Gerencie seus dados de perfil e atualize sua senha de acesso.', position: 'right' },
    { element: '#accountForm', title: 'Formulário de Dados', description: 'Altere seu nome, e-mail corporativo ou senha e clique em Salvar.', position: 'bottom' },
    { element: '#cardOpcoesSistema', title: 'Opções do Sistema', description: 'Ajuste avisos, notificações por e-mail e rotinas de backup.', position: 'left' },
    { element: '#itemNotificacoes', title: 'Notificações por E-mail', description: 'Ative ou desative o envio de relatórios e alertas automáticos.', position: 'bottom' }
];

// Passos de fallback caso o usuário esteja no Dashboard
const tourStepsDashboard = [
    { element: '.sidebar-nav', title: 'Navegação Principal', description: 'Acesse facilmente os módulos do sistema.', position: 'right' },
    { element: '#themeToggle', title: 'Tema Claro e Escuro', description: 'Alterne o visual do sistema a qualquer momento.', position: 'bottom' }
];

function getActiveSteps() {
    return document.getElementById('cardMinhasInformacoes') ? tourStepsConfiguracoes : tourStepsDashboard;
}

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
    
    if (overlayEl) overlayEl.classList.add('active');
    if (spotlightEl) spotlightEl.classList.add('active');
    if (popoverEl) popoverEl.classList.add('active');
    
    showStep(currentStepIndex);
}

function endTour() {
    if (overlayEl) overlayEl.classList.remove('active');
    if (spotlightEl) spotlightEl.classList.remove('active');
    if (popoverEl) popoverEl.classList.remove('active');
}

function showStep(index) {
    const steps = getActiveSteps();
    const step = steps[index];
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
                <span class="tour-popover-step">${index + 1} de ${steps.length}</span>
            </div>
            <div class="tour-popover-body">${step.description}</div>
            <div class="tour-popover-footer">
                <button class="tour-btn tour-btn-skip" onclick="endTour()">Pular</button>
                <div class="tour-btn-nav">
                    ${index > 0 ? `<button class="tour-btn tour-btn-prev" onclick="prevStep()">Anterior</button>` : ''}
                    <button class="tour-btn tour-btn-next" onclick="nextStep()">
                        ${index === steps.length - 1 ? 'Concluir' : 'Próximo'}
                    </button>
                </div>
            </div>
        `;

        positionPopover(rect, step.position);
    }, 250);
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

function repositionTour() {
    if (overlayEl && overlayEl.classList.contains('active')) {
        showStep(currentStepIndex);
    }
}

// Expõe globalmente para funcionar direto pelo onclick do HTML
window.startTour = startTour;
window.endTour = endTour;
window.nextStep = nextStep;
window.prevStep = prevStep;

document.addEventListener('DOMContentLoaded', () => {
    initTour();
});