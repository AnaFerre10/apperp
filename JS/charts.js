/**
 * TransCloud ERP - Charts Module
 * Funções auxiliares para criação de gráficos
 */

/**
 * Cria um gráfico de barras
 * @param {string} canvasId - ID do elemento canvas
 * @param {Object} config - Configuração do gráfico
 */
function createBarChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: config.data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            ...config.options
        }
    });
}

/**
 * Cria um gráfico de linha
 * @param {string} canvasId - ID do elemento canvas
 * @param {Object} config - Configuração do gráfico
 */
function createLineChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: config.data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            ...config.options
        }
    });
}

/**
 * Cria um gráfico de pizza/rosquinha
 * @param {string} canvasId - ID do elemento canvas
 * @param {Object} config - Configuração do gráfico
 */
function createDoughnutChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: 'doughnut',
        data: config.data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            ...config.options
        }
    });
}

/**
 * Aplica cores padrão do sistema aos gráficos
 */
const CHART_COLORS = {
    primary: '#1a73e8',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    gray: '#6b7280'
};

const CHART_COLORS_ARRAY = [
    '#1a73e8', '#10b981', '#f59e0b', '#ef4444', 
    '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'
];