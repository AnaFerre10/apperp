/**
 * TransCloud ERP - Dashboard Module (Enhanced)
 */

let chartViagensDia = null;
let chartStatusEntregas = null;
let chartTendenciaEntregas = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('chartViagensDia')) return;

    loadKPIs();
    loadCharts();
    loadRecentActivities();
    loadProximasViagens();
    loadTabelaEntregas();
    setupChartActions();
    setupRefreshButton();
    updateCurrentDate();

    // Atualiza a cada 30 segundos (simulação)
    setInterval(() => {
        loadKPIs();
        loadProximasViagens();
        loadTabelaEntregas();
    }, 30000);
});

function setupChartActions() {
    const chartActions = document.querySelectorAll('.btn-chart-action');
    chartActions.forEach(btn => {
        btn.addEventListener('click', function() {
            chartActions.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const periodo = this.textContent.trim();
            updateStatusChart(periodo);
        });
    });
}

function setupRefreshButton() {
    const btn = document.getElementById('refreshData');
    if (btn) {
        btn.addEventListener('click', function() {
            this.querySelector('svg').style.animation = 'spin 0.6s ease';
            setTimeout(() => {
                this.querySelector('svg').style.animation = '';
                loadKPIs();
                loadProximasViagens();
                loadTabelaEntregas();
                loadRecentActivities();
                // Atualiza gráficos (dados mockados)
                updateStatusChart(document.querySelector('.btn-chart-action.active')?.textContent.trim() || 'Semanal');
                loadCharts();
                showToast('Dados atualizados com sucesso!', 'success');
            }, 600);
        });
    }
}

function updateCurrentDate() {
    const el = document.getElementById('currentDate');
    if (el) {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        el.textContent = now.toLocaleDateString('pt-BR', options);
    }
}

function loadKPIs() {
    const viagens = getData(STORAGE_KEYS.VIAGENS) || [];

    const totalHoje = viagens.filter(v => v.status === 'Em andamento' || v.status === 'Concluída').length;
    const concluidas = viagens.filter(v => v.status === 'Concluída').length;
    const emTransito = viagens.filter(v => v.status === 'Em andamento').length;
    const atrasos = viagens.filter(v => v.status === 'Cancelada').length;

    setKPI('kpiViagensHoje', totalHoje);
    setKPI('kpiEntregasRealizadas', concluidas);
    setKPI('kpiEmTransito', emTransito);
    setKPI('kpiAtrasos', atrasos);

    // Novos KPIs com valores mockados
    setKPI('kpiFaturamento', 'R$ ' + (Math.random() * 20000 + 30000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
    setKPI('kpiTempoMedio', (Math.random() * 1.5 + 1.5).toFixed(1) + 'h');
    setKPI('kpiSatisfacao', (Math.random() * 0.4 + 4.6).toFixed(1));
    setKPI('kpiMotoristas', Math.floor(Math.random() * 8 + 10));
}

function setKPI(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function loadCharts() {
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#f1f5f9' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6';

    // Gráfico de barras - Viagens por dia
    const canvasViagens = document.getElementById('chartViagensDia');
    if (canvasViagens) {
        if (chartViagensDia) chartViagensDia.destroy();
        chartViagensDia = new Chart(canvasViagens, {
            type: 'bar',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                datasets: [{
                    label: 'Viagens',
                    data: [12, 19, 15, 22, 18, 8],
                    backgroundColor: '#1a73e8',
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
                    x: { ticks: { color: textColor }, grid: { display: false } }
                }
            }
        });
    }

    // Gráfico de tendência (linha)
    const canvasTendencia = document.getElementById('chartTendenciaEntregas');
    if (canvasTendencia) {
        if (chartTendenciaEntregas) chartTendenciaEntregas.destroy();
        chartTendenciaEntregas = new Chart(canvasTendencia, {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Entregas',
                    data: [8, 12, 9, 15, 20, 18, 10],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
                    x: { ticks: { color: textColor }, grid: { display: false } }
                }
            }
        });
    }

    // Gráfico de status (doughnut)
    const activeBtn = document.querySelector('.btn-chart-action.active');
    const periodo = activeBtn ? activeBtn.textContent.trim() : 'Semanal';
    updateStatusChart(periodo);
}

function updateStatusChart(periodo) {
    const canvasStatus = document.getElementById('chartStatusEntregas');
    if (!canvasStatus) return;

    if (chartStatusEntregas) chartStatusEntregas.destroy();

    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#f1f5f9' : '#4b5563';

    const data = periodo === 'Semanal'
        ? { labels: ['Concluídas', 'Em andamento', 'Pendentes', 'Canceladas'], data: [18, 6, 4, 2] }
        : { labels: ['Concluídas', 'Em andamento', 'Pendentes', 'Canceladas'], data: [85, 22, 15, 8] };

    chartStatusEntregas = new Chart(canvasStatus, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverBorderWidth: 3,
                hoverBorderColor: isDark ? '#1e293b' : '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 16,
                        usePointStyle: true,
                        pointStyleWidth: 16,
                        font: { size: 12 },
                        generateLabels: function(chart) {
                            const ds = chart.data.datasets[0];
                            const total = ds.data.reduce((a, b) => a + b, 0);
                            return chart.data.labels.map((label, i) => ({
                                text: `${label}: ${ds.data[i]} (${((ds.data[i]/total)*100).toFixed(1)}%)`,
                                fillStyle: ds.backgroundColor[i],
                                strokeStyle: ds.backgroundColor[i],
                                fontColor: textColor,
                                index: i
                            }));
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            return ` ${ctx.label}: ${ctx.parsed} (${((ctx.parsed/total)*100).toFixed(1)}%)`;
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

    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#f1f5f9' : '#1f2937';
    const subtextColor = isDark ? '#94a3b8' : '#6b7280';

    const activities = [
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 14L7 6H17L21 14V19H19V17H5V19H3V14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="7" cy="17" r="2" fill="currentColor"/>
                <circle cx="17" cy="17" r="2" fill="currentColor"/>
            </svg>`,
            text: 'Nova viagem iniciada: São Paulo → Campinas',
            time: '5 min atrás',
            bg: isDark ? 'rgba(26,115,232,0.2)' : '#e3f2fd'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            text: 'Entrega concluída: Pedido #12345',
            time: '15 min atrás',
            bg: isDark ? 'rgba(46,125,50,0.2)' : '#e8f5e9'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M4 20C4 17.7909 7.79086 16 12 16C16.2091 16 20 17.7909 20 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>`,
            text: 'Motorista João Silva finalizou rota',
            time: '30 min atrás',
            bg: isDark ? 'rgba(230,81,0,0.2)' : '#fff3e0'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 8V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
            </svg>`,
            text: 'Alerta: Atraso na entrega para cliente ABC',
            time: '1h atrás',
            bg: isDark ? 'rgba(239,68,68,0.2)' : '#fce4ec'
        }
    ];

    container.innerHTML = activities.map(act => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${act.bg}; display: flex; align-items: center; justify-content: center;">
                ${act.icon}
            </div>
            <div class="activity-content">
                <h4 style="color: ${textColor};">${act.text}</h4>
                <span style="color: ${subtextColor};">${act.time}</span>
            </div>
        </div>
    `).join('');
}

function loadProximasViagens() {
    const container = document.getElementById('proximasViagens');
    if (!container) return;

    const viagens = [
        { destino: 'São Paulo → Rio de Janeiro', motorista: 'Carlos Souza', horario: '14:30' },
        { destino: 'Campinas → São José dos Campos', motorista: 'Ana Paula', horario: '15:00' },
        { destino: 'Santos → São Paulo', motorista: 'Roberto Lima', horario: '16:15' },
        { destino: 'São Paulo → Campinas', motorista: 'Mariana Costa', horario: '17:30' },
    ];

    container.innerHTML = viagens.map(v => `
        <div class="viagem-item">
            <div class="viagem-info">
                <div class="viagem-icone"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="2" y="10" width="14" height="8" rx="1"/>
    <rect x="17" y="12" width="5" height="6" rx="1"/>
    <circle cx="6" cy="18" r="2" fill="currentColor"/>
    <circle cx="18" cy="18" r="2" fill="currentColor"/>
</svg></div>
                <div>
                    <div class="viagem-destino">${v.destino}</div>
                    <div class="viagem-motorista">${v.motorista}</div>
                </div>
            </div>
            <div class="viagem-horario">${v.horario}</div>
        </div>
    `).join('');
}

function loadTabelaEntregas() {
    const container = document.getElementById('tableEntregas');
    if (!container) return;

    const entregas = [
        { pedido: '#12345', motorista: 'João Silva', destino: 'São Paulo, SP', status: 'Concluída', horario: '10:30' },
        { pedido: '#12346', motorista: 'Maria Oliveira', destino: 'Campinas, SP', status: 'Em andamento', horario: '11:45' },
        { pedido: '#12347', motorista: 'Carlos Souza', destino: 'Santos, SP', status: 'Pendente', horario: '13:00' },
        { pedido: '#12348', motorista: 'Ana Paula', destino: 'São José dos Campos, SP', status: 'Concluída', horario: '09:15' },
        { pedido: '#12349', motorista: 'Roberto Lima', destino: 'Ribeirão Preto, SP', status: 'Cancelada', horario: '08:00' },
    ];

    const statusMap = {
        'Concluída': 'concluida',
        'Em andamento': 'em-andamento',
        'Pendente': 'pendente',
        'Cancelada': 'cancelada'
    };

    let html = `
        <table class="table-entregas">
            <thead>
                <tr>
                    <th>Pedido</th>
                    <th>Motorista</th>
                    <th>Destino</th>
                    <th>Status</th>
                    <th>Horário</th>
                </tr>
            </thead>
            <tbody>
    `;

    entregas.forEach(e => {
        const statusClass = statusMap[e.status] || '';
        html += `
            <tr>
                <td><strong>${e.pedido}</strong></td>
                <td>${e.motorista}</td>
                <td>${e.destino}</td>
                <td><span class="status-badge ${statusClass}">${e.status}</span></td>
                <td>${e.horario}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Adiciona keyframe de rotação para o botão refresh
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .toast {
        padding: 12px 20px;
        border-radius: 12px;
        background: #1e293b;
        color: #fff;
        font-weight: 500;
        margin-bottom: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: fadeIn 0.3s ease;
    }
    .toast-success { background: #10b981; }
    .toast-info { background: #3b82f6; }
    .toast-error { background: #ef4444; }
    #toastContainer {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);