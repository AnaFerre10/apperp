/**
 * TransCloud ERP - Dashboard Module
 */

// Variável global para armazenar a instância do gráfico de status
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
    const viagens = getData(STORAGE_KEYS.VIAGENS);
    
    // Gráfico de Viagens por Dia (Barra)
    const canvasViagens = document.getElementById('chartViagensDia');
    if (canvasViagens) {
        const ctx = canvasViagens.getContext('2d');
        new Chart(ctx, {
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
                        grid: {
                            color: '#f3f4f6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de Status das Entregas (Rosquinha) - Começa com Semanal
    updateStatusChart('Semanal');
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
                hoverBorderColor: '#fff'
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
                hoverBorderColor: '#fff'
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
    
    const activities = [
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#1a73e8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            text: 'Nova viagem iniciada: São Paulo → Campinas',
            time: '5 min atrás',
            bg: '#e3f2fd'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            text: 'Entrega concluída: Pedido #12345',
            time: '15 min atrás',
            bg: '#e8f5e9'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="#e65100" stroke-width="2"/>
                <path d="M4 20C4 17.7909 7.79086 16 12 16C16.2091 16 20 17.7909 20 20" stroke="#e65100" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            text: 'Motorista João Silva finalizou rota',
            time: '30 min atrás',
            bg: '#fff3e0'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="#c62828" stroke-width="2"/>
                <path d="M12 7V13" stroke="#c62828" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="16" r="1" fill="#c62828"/>
            </svg>`,
            text: 'Alerta: Veículo JKL-3456 em manutenção',
            time: '1 hora atrás',
            bg: '#fce4ec'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 2H17L21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V4C3 2.89543 3.89543 2 5 2H7Z" stroke="#6a1b9a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 2V6H17V2" stroke="#6a1b9a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 13H16" stroke="#6a1b9a" stroke-width="2" stroke-linecap="round"/>
                <path d="M8 17H12" stroke="#6a1b9a" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            text: 'Relatório mensal gerado com sucesso',
            time: '2 horas atrás',
            bg: '#f3e5f5'
        }
    ];
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${activity.bg};">
                ${activity.icon}
            </div>
            <div class="activity-content">
                <h4>${activity.text}</h4>
                <p>Registro atualizado no sistema</p>
            </div>
            <span class="activity-time">${activity.time}</span>
        </div>
    `).join('');
}