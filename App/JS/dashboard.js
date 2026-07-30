/**
 * TransCloud ERP - Dashboard Module
 */

// Variáveis globais para armazenar as instâncias dos gráficos
let chartViagensDia = null;
let chartStatusEntregas = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('chartViagensDia')) return;
    
    loadKPIs();
    loadCharts();
    loadRecentActivities();
    
    // Event listeners para os botões de ação dos gráficos
    setupChartActions();
});

/**
 * Configura os botões de período do gráfico
 */
function setupChartActions() {
    const chartActions = document.querySelectorAll('.btn-chart-action');
    
    chartActions.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active de todos os botões
            chartActions.forEach(b => b.classList.remove('active'));
            
            // Adiciona active no botão clicado
            this.classList.add('active');
            
            // Obtém o período selecionado
            const periodo = this.textContent.trim();
            
            // Atualiza o gráfico com os dados do período
            updateStatusChart(periodo);
        });
    });
}

function loadKPIs() {
    const viagens = getData(STORAGE_KEYS.VIAGENS);
    
    const kpiViagensHoje = document.getElementById('kpiViagensHoje');
    const kpiEntregasRealizadas = document.getElementById('kpiEntregasRealizadas');
    const kpiEmTransito = document.getElementById('kpiEmTransito');
    const kpiAtrasos = document.getElementById('kpiAtrasos');
    
    if (kpiViagensHoje) kpiViagensHoje.textContent = viagens.filter(v => v.status === 'Em andamento' || v.status === 'Concluída').length;
    if (kpiEntregasRealizadas) kpiEntregasRealizadas.textContent = viagens.filter(v => v.status === 'Concluída').length;
    if (kpiEmTransito) kpiEmTransito.textContent = viagens.filter(v => v.status === 'Em andamento').length;
    if (kpiAtrasos) kpiAtrasos.textContent = viagens.filter(v => v.status === 'Cancelada').length;
}

function loadCharts() {
    // Identifica se o modo escuro está ativo
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#ffffff' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#f3f4f6';

    // Gráfico de Viagens por Dia (Barra)
    const canvasViagens = document.getElementById('chartViagensDia');
    if (canvasViagens) {
        if (chartViagensDia) {
            chartViagensDia.destroy();
            chartViagensDia = null;
        }

        const ctx = canvasViagens.getContext('2d');
        chartViagensDia = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                datasets: [{
                    label: 'Viagens',
                    data: [12, 19, 15, 22, 18, 8],
                    backgroundColor: '#1a73e8',
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    x: {
                        ticks: { color: textColor },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    // Gráfico de Status das Entregas (Rosquinha / Setores)
    const activeBtn = document.querySelector('.btn-chart-action.active');
    const periodo = activeBtn ? activeBtn.textContent.trim() : 'Semanal';
    updateStatusChart(periodo);

    // Atualiza também as atividades recentes com as cores corretas do tema
    loadRecentActivities();
}

/**
 * Atualiza o gráfico de status baseado no período selecionado
 * @param {string} periodo - 'Semanal' ou 'Mensal'
 */
function updateStatusChart(periodo) {
    const canvasStatus = document.getElementById('chartStatusEntregas');
    if (!canvasStatus) return;
    
    // Destroi o gráfico anterior se existir
    if (chartStatusEntregas) {
        chartStatusEntregas.destroy();
        chartStatusEntregas = null;
    }
    
    // Cor do texto conforme o tema (branco no modo escuro)
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#ffffff' : '#4b5563';
    
    // Dados diferentes para cada período
    let statusData;
    
    if (periodo === 'Semanal') {
        statusData = {
            labels: ['Concluídas', 'Em andamento', 'Pendentes', 'Canceladas'],
            datasets: [{
                data: [18, 6, 4, 2],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverBorderWidth: 3,
                hoverBorderColor: isDark ? '#1e293b' : '#fff'
            }]
        };
    } else if (periodo === 'Mensal') {
        statusData = {
            labels: ['Concluídas', 'Em andamento', 'Pendentes', 'Canceladas'],
            datasets: [{
                data: [85, 22, 15, 8],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverBorderWidth: 3,
                hoverBorderColor: isDark ? '#1e293b' : '#fff'
            }]
        };
    }
    
    // Cria o novo gráfico
    const ctx = canvasStatus.getContext('2d');
    chartStatusEntregas = new Chart(ctx, {
        type: 'doughnut',
        data: statusData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 20,
                        usePointStyle: true,
                        pointStyleWidth: 20,
                        font: {
                            size: 12
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            return data.labels.map((label, index) => {
                                const value = data.datasets[0].data[index];
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                
                                return {
                                    text: `${label}: ${value} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[index],
                                    strokeStyle: data.datasets[0].backgroundColor[index],
                                    fontColor: textColor,
                                    lineWidth: 0,
                                    hidden: false,
                                    index: index
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return ` ${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function loadRecentActivities() {
    const container = document.getElementById('recentActivities');
    if (!container) return;
    
    // Verifica se o modo escuro está ativo
    const isDark = document.body.classList.contains('dark-theme');

    // Define as cores de texto e fundo dinamicamente
    const textColor = isDark ? '#ffffff' : '#1f2937';
    const subtextColor = isDark ? '#9ca3af' : '#6b7280';
    
    const activities = [
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#1a73e8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            text: 'Nova viagem iniciada: São Paulo → Campinas',
            time: '5 min atrás',
            bg: isDark ? 'rgba(26, 115, 232, 0.2)' : '#e3f2fd'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            text: 'Entrega concluída: Pedido #12345',
            time: '15 min atrás',
            bg: isDark ? 'rgba(46, 125, 50, 0.2)' : '#e8f5e9'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="#e65100" stroke-width="2"/>
                <path d="M4 20C4 17.7909 7.79086 16 12 16C16.2091 16 20 17.7909 20 20" stroke="#e65100" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            text: 'Motorista João Silva finalizou rota',
            time: '30 min atrás',
            bg: isDark ? 'rgba(230, 81, 0, 0.2)' : '#fff3e0'
        }
    ];

    container.innerHTML = activities.map(act => `
        <div class="activity-item" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div class="activity-icon" style="background: ${act.bg}; padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                ${act.icon}
            </div>
            <div class="activity-info">
                <p style="margin: 0; font-size: 14px; font-weight: 500; color: ${textColor};">${act.text}</p>
                <span style="font-size: 12px; color: ${subtextColor};">${act.time}</span>
            </div>
        </div>
    `).join('');
}